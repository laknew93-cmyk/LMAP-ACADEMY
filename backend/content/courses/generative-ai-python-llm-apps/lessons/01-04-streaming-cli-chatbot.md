Waiting ten seconds for a full answer feels broken; watching the answer appear word by word feels fast, even when the total time is identical. In this lesson you add streaming and turn everything so far into a proper command-line chatbot you can show in your portfolio.

## Why streaming matters

Without streaming, the API returns nothing until the whole response is generated. With streaming, the server sends small pieces (events) as soon as they are produced. Benefits:

- **Perceived speed**: the first words appear quickly, which is what users judge you on.
- **Long outputs are safer**: very long requests can hit HTTP timeouts if you wait for the full answer; streaming keeps the connection active.
- **Cancel early**: a user can stop a rambling answer and you stop paying for further tokens.

## The simplest stream

The SDK offers a `messages.stream()` helper that handles the low-level events for you:

```python
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

with client.messages.stream(
    model=MODEL,
    max_tokens=16000,
    messages=[{"role": "user", "content": "Write a 150-word story about a Jaipur auto driver who learns Python."}],
) as stream:
    for text in stream.text_stream:
        print(text, end="", flush=True)

    final = stream.get_final_message()

print()
print("Stop reason:", final.stop_reason)
print("Output tokens:", final.usage.output_tokens)
```

Line by line:

- `with client.messages.stream(...) as stream:` opens the connection. The `with` block makes sure it is closed properly even if your code raises an error.
- `stream.text_stream` yields only the text pieces, skipping other event types you do not need yet.
- `print(text, end="", flush=True)` prints without a newline and forces the terminal to show it immediately.
- `stream.get_final_message()` gives you the complete response object (content, `stop_reason`, `usage`) once streaming finishes, so you do not have to rebuild it yourself.

You may notice a short pause before the first words. Current models reason before answering, and by default that reasoning is not shown. For a chat app, this is usually fine; for slower, harder tasks, show a "thinking..." indicator so users know something is happening.

## Building the CLI chatbot

Now combine streaming with the conversation history from the last lesson. Create `chat_cli.py`:

```python
import os
import sys

import anthropic
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

SYSTEM = """You are a friendly Python tutor for Indian engineering students.
Explain with short code examples. Keep answers under 200 words unless asked."""


def stream_reply(messages: list[dict]) -> str:
    """Stream one assistant reply to the terminal and return its text."""
    parts = []
    with client.messages.stream(
        model=MODEL, max_tokens=16000, system=SYSTEM, messages=messages
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
            parts.append(text)
        final = stream.get_final_message()
    print()
    if final.stop_reason == "max_tokens":
        print("[Answer was cut off - ask me to continue.]")
    return "".join(parts)


def main() -> None:
    messages: list[dict] = []
    print("Python tutor. Type 'exit' to quit, 'reset' to start over.\n")
    while True:
        try:
            user = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            break
        if not user:
            continue
        if user.lower() == "exit":
            break
        if user.lower() == "reset":
            messages.clear()
            print("(history cleared)\n")
            continue

        messages.append({"role": "user", "content": user})
        print("Tutor: ", end="", flush=True)
        try:
            reply = stream_reply(messages)
        except anthropic.APIError as e:
            messages.pop()  # don't keep a user turn with no answer
            print(f"\n[Error: {e}]", file=sys.stderr)
            continue
        messages.append({"role": "assistant", "content": reply})
        print()


if __name__ == "__main__":
    main()
```

What is worth noticing:

- **Separation of concerns**: `stream_reply` knows how to talk to the API; `main` handles the user interface. When you build the web version, you will reuse the first idea and replace the second.
- **Commands**: `exit` and `reset` are handled locally and never sent to the model. Real products have many such commands (`/help`, `/export`).
- **Graceful failure**: if the API call fails, we remove the unanswered user message so the history stays a clean alternation of user and assistant turns, then let the user try again instead of crashing.
- **Ctrl+C** exits cleanly rather than printing a stack trace.

Run it with `python chat_cli.py` and have a conversation.

## Measuring latency

Engineers in GenAI roles are often asked "how fast is it?" Two numbers matter:

| Metric | Meaning |
|---|---|
| Time to first token (TTFT) | How long until the first text appears. Drives perceived speed. |
| Total time | How long until the answer is complete. Drives throughput and cost per user. |

You can measure TTFT with a few lines:

```python
import time

start = time.perf_counter()
first = None
with client.messages.stream(
    model=MODEL, max_tokens=16000,
    messages=[{"role": "user", "content": "List 5 Indian startups in fintech."}],
) as stream:
    for text in stream.text_stream:
        if first is None:
            first = time.perf_counter() - start
print(f"\nTTFT: {first:.2f}s, total: {time.perf_counter() - start:.2f}s")
```

Try it with low and high `effort` settings (add `output_config={"effort": "low"}`) and note the difference. Lower effort usually means less reasoning and a faster first token.

## Streaming with other providers

OpenAI, Gemini and Ollama all support streaming with the same idea: you iterate over chunks and print the text in each. The event names differ, so check their documentation, but the structure of your CLI does not change.

## Try it yourself

About 20 minutes:

1. Build and run `chat_cli.py`.
2. Change the system prompt to a domain you care about: an interview coach for TCS/Infosys freshers, or a travel planner for weekend trips from Bengaluru.
3. Add a `/save` command that writes the conversation to `chat_history.json` using `json.dump`.
4. Add a `/tokens` command that prints the input and output tokens of the last reply (hint: return `final.usage` from `stream_reply` as well).
5. Measure TTFT for three different prompts and note the numbers. Keep them; you will compare after adding caching in Module 5.

## Key takeaways

- Streaming improves perceived speed and avoids timeouts on long outputs.
- `client.messages.stream()` with `text_stream` and `get_final_message()` covers most needs.
- Keep API logic separate from interface code so you can swap a CLI for a web UI.
- Handle errors without corrupting conversation history.
- Track time to first token and total time; they are the latency numbers interviewers ask about.
