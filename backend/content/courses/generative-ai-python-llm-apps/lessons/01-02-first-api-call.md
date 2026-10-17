In this lesson you set up a clean Python project, store your API key safely, and make your first call to an LLM. By the end you will understand every field in the request and the response, which is the foundation for everything else in the course.

## Set up the project

Create a folder and a virtual environment. Keeping each project in its own environment avoids the classic "it works on my laptop" problem when you deploy later.

```bash
mkdir genai-course && cd genai-course
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install anthropic python-dotenv
```

`anthropic` is the official SDK. `python-dotenv` lets you keep secrets in a local `.env` file during development.

## Store the API key safely

Create an API key from the Anthropic Console (console.anthropic.com). Treat it like your net-banking password: anyone with it can run up charges on your account.

Create a file called `.env` in the project folder:

```text
ANTHROPIC_API_KEY=paste-your-key-here
CLAUDE_MODEL=claude-opus-5-5
```

Then immediately create `.gitignore` so the key never reaches GitHub:

```text
.venv/
.env
__pycache__/
```

Students lose money every year by pushing keys to public repositories, where bots scan for them within minutes. If you ever leak a key, revoke it in the console straight away and create a new one.

We also keep the model name in an environment variable. Model versions change over time; reading the name from configuration means you can switch models (for example to a cheaper, faster one for simple tasks) without editing code. Check the provider's models page for the current list.

## Your first call

Create `first_call.py`:

```python
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()  # reads .env into environment variables

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()  # picks up ANTHROPIC_API_KEY automatically

response = client.messages.create(
    model=MODEL,
    max_tokens=4000,
    messages=[
        {"role": "user", "content": "Explain GST input tax credit in 3 bullet points."}
    ],
)

for block in response.content:
    if block.type == "text":
        print(block.text)

print("---")
print("Stop reason:", response.stop_reason)
print("Input tokens:", response.usage.input_tokens)
print("Output tokens:", response.usage.output_tokens)
```

Run it with `python first_call.py`.

### Line by line

- `load_dotenv()` copies values from `.env` into `os.environ`. In production (Module 5) you will set real environment variables instead, and this line simply does nothing.
- `anthropic.Anthropic()` creates a client. It reads `ANTHROPIC_API_KEY` from the environment, so the key never appears in your code.
- `client.messages.create(...)` sends one request. Everything in this course goes through this Messages API: plain chat, tools, structured output and RAG.
- `model` picks which model answers.
- `max_tokens` is the ceiling on output tokens for this response. If the model hits it, the answer is cut off mid-sentence. Current models also spend some output tokens on internal reasoning, so do not set this too low; a few thousand is a sensible floor for general answers.
- `messages` is the conversation, a list of dictionaries with a `role` (`user` or `assistant`) and `content`.

## Understanding the response

The response is a Python object, not a plain string. The important fields:

| Field | What it tells you |
|---|---|
| `content` | A list of content blocks. Text answers are blocks with `type == "text"`. Later you will also see `tool_use` and `thinking` blocks. |
| `stop_reason` | Why the model stopped: `end_turn` (finished normally), `max_tokens` (cut off), `tool_use` (wants to call a tool), `refusal` (declined for safety reasons). |
| `usage` | Token counts for billing and monitoring. |
| `model` | Which model actually produced the answer. |

That is why we loop over `response.content` and check `block.type` rather than assuming the first block is text. Code that does `response.content[0].text` works in a demo and breaks the day you add tools.

Always check `stop_reason` in real applications. If it is `max_tokens`, you showed the user a truncated answer. Log it and either raise the limit or ask for a shorter answer.

## Controlling effort

Current Claude models think before they answer, and you can tell the model how hard to think with the `effort` setting inside `output_config`:

```python
response = client.messages.create(
    model=MODEL,
    max_tokens=4000,
    output_config={"effort": "low"},  # low | medium | high | xhigh | max
    messages=[{"role": "user", "content": "Is '₹1,18,000 incl. 18% GST' consistent with a base of ₹1,00,000? Answer yes or no."}],
)
```

Low effort is faster and cheaper, which suits simple classification or extraction. Higher effort is worth it for complex reasoning and agents. A good engineering habit is to start low and raise effort only when your tests show the quality needs it.

## Handling errors

Networks fail and keys get revoked. The SDK raises typed exceptions so you can respond sensibly:

```python
try:
    response = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        messages=[{"role": "user", "content": "Hello"}],
    )
except anthropic.AuthenticationError:
    print("Check ANTHROPIC_API_KEY - it is missing or invalid.")
except anthropic.RateLimitError:
    print("Too many requests. Wait a little and try again.")
except anthropic.APIConnectionError:
    print("Network problem. Check your internet connection.")
except anthropic.APIStatusError as e:
    print(f"API error {e.status_code}: {e.message}")
```

Order matters: the specific exceptions come first, then the general `APIStatusError`. The SDK already retries temporary failures such as rate limits and server errors a couple of times before raising; you will tune this in Module 5.

## Other providers

OpenAI, Gemini and Ollama all have Python SDKs with the same shape: create a client from an environment variable, send a list of messages, read text and token usage from the response. Once you understand this call, switching providers is mostly a matter of reading their quick-start page.

## Try it yourself

Take 15 minutes:

1. Set up the project exactly as above and run `first_call.py`.
2. Change the question to something from your own work, for example "Write a polite WhatsApp reminder to a client in Indore whose invoice is 15 days overdue."
3. Set `max_tokens=50` and run again. Print `stop_reason` and confirm it says `max_tokens`. Restore a sensible value.
4. Run the same prompt with `effort` set to `low` and then `high`. Compare the output tokens and the answer quality.
5. Temporarily put a wrong key in `.env` and confirm your `AuthenticationError` message appears. Then fix it.

## Key takeaways

- Keep keys in environment variables and `.env`, and add `.env` to `.gitignore` before your first commit.
- Every request is a `messages.create` call with a model, a `max_tokens` ceiling and a list of messages.
- Read text by looping over content blocks and checking `type`; never assume the first block is text.
- Always check `stop_reason` and log token `usage`.
- Use `effort` to trade reasoning depth for speed and cost.
