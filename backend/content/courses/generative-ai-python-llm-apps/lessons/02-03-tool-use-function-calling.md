An LLM on its own cannot check today's order status, query your database or do exact arithmetic on 500 rows. Tool use (also called function calling) fixes this: you describe functions to the model, it decides when to call them, and your code runs them. This lesson teaches the full round trip.

## How tool use works

The model never runs your code. The flow is a conversation:

```text
1. You send: user question + list of tool descriptions
2. Model replies: stop_reason = "tool_use", with a tool_use block
   {name: "get_order_status", input: {"order_id": "BLR-10234"}}
3. Your code runs get_order_status("BLR-10234") -> result
4. You send: the whole conversation + a tool_result block with the result
5. Model replies: a normal answer that uses the result
```

Steps 2-4 can repeat several times in one task. Running them in a loop is what makes an agent, which is Module 4. Here we handle one round cleanly.

## Defining a tool

A tool definition has a name, a description, and a JSON Schema for its input. Let us build a support bot for a fictional D2C snacks brand in Bengaluru:

```python
import json
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

TOOLS = [
    {
        "name": "get_order_status",
        "description": (
            "Look up the delivery status of a customer's order by order ID. "
            "Use this whenever the customer asks where their order is, "
            "when it will arrive, or whether it has shipped. "
            "Order IDs look like 'BLR-10234'."
        ),
        "strict": True,
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {"type": "string", "description": "Order ID, e.g. BLR-10234"}
            },
            "required": ["order_id"],
            "additionalProperties": False,
        },
    }
]

# Fake database for the demo
ORDERS = {
    "BLR-10234": {"status": "shipped", "courier": "Delhivery", "eta": "2026-10-20"},
    "BLR-10235": {"status": "processing", "courier": None, "eta": None},
}


def get_order_status(order_id: str) -> dict:
    order = ORDERS.get(order_id.strip().upper())
    if order is None:
        return {"error": f"No order found with ID {order_id}"}
    return {"order_id": order_id, **order}
```

Writing good tool descriptions is the single biggest lever on tool-use quality:

- Say **what it does**, **when to use it**, and **what the input looks like**.
- Write for a smart colleague who has never seen your codebase.
- `strict: True` (with `additionalProperties: False` and a `required` list) guarantees the model's input matches your schema exactly, so you are not handling missing or misspelt fields.

## The round trip

```python
def run_tool(name: str, tool_input: dict) -> str:
    if name == "get_order_status":
        return json.dumps(get_order_status(**tool_input))
    return json.dumps({"error": f"Unknown tool {name}"})


SYSTEM = "You are the support assistant for Crunchy Bites, a snacks brand. Be brief and warm."
messages = [{"role": "user", "content": "Hi, where is my order BLR-10234?"}]

response = client.messages.create(
    model=MODEL, max_tokens=4000, system=SYSTEM, tools=TOOLS, messages=messages,
)

if response.stop_reason == "tool_use":
    # 1. Keep the assistant turn exactly as returned (it contains the tool_use block)
    messages.append({"role": "assistant", "content": response.content})

    # 2. Run every requested tool and collect results in ONE user message
    results = []
    for block in response.content:
        if block.type == "tool_use":
            output = run_tool(block.name, block.input)
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": output})
    messages.append({"role": "user", "content": results})

    # 3. Ask the model to finish the answer using the results
    response = client.messages.create(
        model=MODEL, max_tokens=4000, system=SYSTEM, tools=TOOLS, messages=messages,
    )

print("".join(b.text for b in response.content if b.type == "text"))
```

Line by line, the parts that trip people up:

- `messages.append({"role": "assistant", "content": response.content})` appends the **full** content list, not just the text. It includes the `tool_use` block (and any reasoning blocks), which the API needs to match your result to the request.
- Each `tool_result` must carry the `tool_use_id` of the block it answers.
- The model may request **several tools at once** (for example, two order IDs). Run them all and return all results in a **single** user message. Splitting them across messages confuses the model.
- `block.input` is already a Python dict. Do not parse it as a string.
- The second call must include the same `tools` list, so the model understands the history.

## Reporting errors to the model

If a tool fails, do not crash and do not silently drop it. Return the error as the result and mark it:

```python
results.append({
    "type": "tool_result",
    "tool_use_id": block.id,
    "content": "Order lookup service is down. Ask the customer to try in 10 minutes.",
    "is_error": True,
})
```

The model can then apologise, ask for a corrected order ID, or try another approach. Our `get_order_status` already returns a helpful message for unknown IDs, which lets the model ask the customer to double-check.

## Steering whether a tool is called

By default the model decides whether to call a tool (`tool_choice` is "auto"). On the newest Claude models you cannot force a specific tool call, so steer with the system prompt instead: "Always look up the order before answering any delivery question." Then check in code whether a `tool_use` block came back. If you only wanted structured data, not an action, use structured output from the previous lessons rather than a tool.

## Security: tools are where risk lives

Once a model can call functions, a malicious user message (or a malicious document) could try to make it call them in harmful ways. Ground rules you should already follow:

| Rule | Example |
|---|---|
| Validate inputs in your code | Check the order belongs to the logged-in customer before returning details |
| Least privilege | A support bot gets `get_order_status`, not raw SQL access |
| Confirm before side effects | Refunds, emails and deletions need human or user confirmation |
| Limit loops | Cap the number of tool calls per request |

We return to this in the safety lesson in Module 5.

## Other providers

OpenAI, Gemini and most open-source models served via Ollama support function calling with a very similar shape: a JSON Schema per tool, a response that asks for a call, and a message carrying the result back. The field names differ, so read their documentation, but your `run_tool` dispatcher and security rules carry over unchanged.

## Try it yourself

About 20 minutes:

1. Run the example and confirm the bot gives the courier and ETA.
2. Ask about `BLR-99999` and check the bot handles the "not found" result gracefully.
3. Ask "Where are BLR-10234 and BLR-10235?" and print how many `tool_use` blocks come back.
4. Add a second tool, `get_refund_policy`, with no inputs (`"properties": {}` and `"required": []`), returning a short policy string. Ask "Can I return an opened packet?"
5. Ask an unrelated question ("What is the capital of Kerala?") and confirm no tool is called.

## Key takeaways

- The model requests tool calls; your code executes them and sends results back.
- Clear tool descriptions (what, when, input format) drive quality more than anything else.
- Append the full assistant content, match every `tool_result` to its `tool_use_id`, and return all results in one message.
- Report tool failures with `is_error` instead of crashing.
- Validate inputs and gate side effects: tools are your main security boundary.
