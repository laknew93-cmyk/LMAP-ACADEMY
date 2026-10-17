In Module 2 you handled one round of tool use. An agent is simply that round in a loop: the model calls a tool, sees the result, decides what to do next, and keeps going until the task is done. In this lesson you write that loop yourself, with the safety limits every production agent needs.

## What makes something an "agent"?

There is a lot of hype around the word. A practical definition:

> An agent is an LLM that decides, step by step, which tools to call and when it has finished, based on the results it has seen so far.

Compare that with a **workflow**, where your code fixes the steps in advance (retrieve, then answer; or extract, then validate). Workflows are predictable and cheap. Agents are flexible but cost more, take longer and are harder to test. You will learn to choose between them in lesson 4.3.

## The loop

```text
messages = [user question]
repeat (at most N times):
    response = model(messages, tools)
    if response does not ask for tools: return final answer
    run each requested tool
    append assistant turn + tool results to messages
stop with "step limit reached"
```

## A reusable agent function

Create `agent.py`. It takes a dictionary of Python functions plus their tool definitions, so you can reuse it for any project.

```python
import json
import os
from typing import Callable

import anthropic

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()


def run_agent(question: str, system: str, tools: list[dict],
              functions: dict[str, Callable], max_steps: int = 8,
              verbose: bool = True) -> str:
    messages = [{"role": "user", "content": question}]

    for step in range(1, max_steps + 1):
        response = client.messages.create(
            model=MODEL, max_tokens=16000, system=system,
            tools=tools, messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason != "tool_use":
            text = "".join(b.text for b in response.content if b.type == "text")
            if response.stop_reason == "max_tokens":
                text += "\n[Answer truncated]"
            return text

        results = []
        for block in response.content:
            if block.type != "tool_use":
                continue
            if verbose:
                print(f"  step {step}: {block.name}({json.dumps(block.input)})")
            fn = functions.get(block.name)
            try:
                if fn is None:
                    raise ValueError(f"Unknown tool: {block.name}")
                output, is_error = str(fn(**block.input)), False
            except Exception as e:  # report the failure to the model
                output, is_error = f"Error: {e}", True
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": output[:20000], "is_error": is_error})
        messages.append({"role": "user", "content": results})

    return "Stopped: step limit reached before the task was finished."
```

### The details that matter

- **`max_steps`** is your circuit breaker. Without it, a confused agent can loop for dozens of calls and burn your budget. Every agent you ever ship needs a limit.
- **`stop_reason != "tool_use"`** is the exit condition. When the model stops asking for tools, its text is the final answer. We also flag `max_tokens` truncation instead of silently returning half an answer.
- **The assistant turn is appended in full**, including tool requests and reasoning blocks, exactly as in Module 2.
- **Exceptions become tool results** with `is_error: True`. The model often recovers on its own, for example by fixing a wrong column name and trying again. That self-correction is one of the main benefits of agents.
- **`output[:20000]`** truncates huge tool outputs. A tool that returns a 2 MB CSV would blow up your context and cost. Design tools to return small, summarised results, and keep this cap as a safety net.
- **`verbose`** prints each step. Watching the trace is how you debug agents; in production, log it instead.

## Trying it with two simple tools

```python
from datetime import date


def days_until(target_date: str) -> int:
    """Days from today until an ISO date."""
    return (date.fromisoformat(target_date) - date.today()).days


def gst_amount(amount_inr: float, rate_percent: float) -> dict:
    tax = round(amount_inr * rate_percent / 100, 2)
    return {"tax": tax, "total": round(amount_inr + tax, 2)}


TOOLS = [
    {"name": "days_until", "description": "Number of days from today until a date (YYYY-MM-DD).",
     "input_schema": {"type": "object", "properties": {"target_date": {"type": "string"}},
                      "required": ["target_date"]}},
    {"name": "gst_amount", "description": "Compute GST and total for an amount in rupees.",
     "input_schema": {"type": "object", "properties": {
         "amount_inr": {"type": "number"}, "rate_percent": {"type": "number"}},
         "required": ["amount_inr", "rate_percent"]}},
]

print(run_agent(
    "A laptop costs ₹62,000 before 18% GST. What's the total, and how many days "
    "until 2026-12-31 when the offer ends?",
    system="You are a precise assistant. Use tools for all date and money maths.",
    tools=TOOLS,
    functions={"days_until": days_until, "gst_amount": gst_amount},
))
```

You should see two tool calls (possibly in the same step, since the model can request several tools at once) and a final answer combining both results. Notice the system prompt says "use tools for all maths". LLMs can do arithmetic, but tools make it exact and auditable.

## The SDK tool runner

Writing the loop yourself is the best way to understand agents, and it gives you full control. The Anthropic Python SDK also offers a beta **tool runner** that runs this loop for you: you decorate plain functions with `@beta_tool` (their type hints and docstrings become the schema) and call `client.beta.messages.tool_runner(...)`. It is a good choice once you understand what it automates. Frameworks such as LangGraph, LlamaIndex and the OpenAI Agents SDK provide similar loops with more features. In interviews, being able to explain the raw loop impresses more than naming frameworks.

## Cost and latency of agents

Each step is a full API call that resends the growing conversation. A 6-step agent might use several times the tokens of a single RAG answer. Practical controls:

| Control | Effect |
|---|---|
| `max_steps` | Hard cap on calls per task |
| Small tool outputs | Fewer input tokens on every later step |
| Lower `effort` for simple agents | Less reasoning per step |
| Prompt caching (Module 5) | Cheaper repeated system prompt and tool definitions |
| Clear tool descriptions | Fewer wasted or wrong calls |

## Try it yourself

About 20 minutes:

1. Save `agent.py` and run the laptop example. Read the step trace.
2. Ask a question that needs several tool calls, such as "What's the GST at 12% on ₹4,500, and how many days until Republic Day, 2027-01-26?"
3. Pass an invalid date ("31-12-2026") in your question and watch the agent handle the error and retry.
4. Set `max_steps=1` and observe what happens. Restore it.
5. Add a third tool, `inr_to_words(amount: int)`, that writes an amount in Indian words (lakh, crore), and ask for an invoice total in words.

## Key takeaways

- An agent is a tool-use round in a loop where the model decides the next step and when to stop.
- Always set a step limit and cap tool output size.
- Turn exceptions into `is_error` tool results so the agent can self-correct.
- Log every step; traces are how you debug agents.
- Agents multiply tokens and latency, so control them deliberately.
