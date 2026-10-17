A prototype that costs a few rupees a day can cost lakhs a month at scale. Companies hiring GenAI engineers care deeply about this, and "I cut our LLM bill significantly without hurting quality" is one of the strongest lines you can put on a resume. This lesson gives you the main levers: measuring tokens, prompt caching, effort and model choice, and batching.

## Step zero: measure

You cannot optimise what you do not measure. Log token usage for every request, with a label for the feature:

```python
import logging
import os

import anthropic

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("llm")
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()


def log_usage(feature: str, response) -> None:
    u = response.usage
    log.info(
        "feature=%s model=%s in=%d out=%d cache_write=%s cache_read=%s",
        feature, response.model, u.input_tokens, u.output_tokens,
        u.cache_creation_input_tokens, u.cache_read_input_tokens,
    )
```

After a day of traffic, you can answer: which feature uses the most tokens? Is it input (long prompts, big documents) or output (long answers, heavy reasoning)? The answer decides which lever to pull.

You can also count tokens before sending, which helps when you need to check whether a document fits or estimate cost:

```python
count = client.messages.count_tokens(
    model=MODEL,
    system="You are a helpful assistant.",
    messages=[{"role": "user", "content": open("policy.txt", encoding="utf-8").read()}],
)
print(count.input_tokens)
```

Different models can use different tokenizers, so count with the model you will actually call. Multiply by the per-token price on the provider's pricing page to estimate cost; prices change, so always check the current page.

## Prompt caching

Many apps send the same large prefix over and over: a long system prompt, tool definitions, a policy document, few-shot examples. Prompt caching lets the provider store that processed prefix for a short time, so later requests that start with the identical prefix are billed at a much lower rate for those tokens and usually respond faster.

```python
POLICY = open("hr_policy.txt", encoding="utf-8").read()  # a long, stable document

SYSTEM = [
    {"type": "text", "text": "You answer questions about the HR policy below. Cite section numbers."},
    {"type": "text", "text": f"<policy>\n{POLICY}\n</policy>",
     "cache_control": {"type": "ephemeral"}},
]


def ask(question: str) -> str:
    response = client.messages.create(
        model=MODEL,
        max_tokens=4000,
        system=SYSTEM,
        messages=[{"role": "user", "content": question}],
    )
    log_usage("hr_bot", response)
    return "".join(b.text for b in response.content if b.type == "text")


ask("How many casual leaves do I get?")      # first call writes the cache
ask("Is there a work-from-home allowance?")  # within a few minutes: reads the cache
```

How it works:

- `cache_control` marks the end of the prefix to cache. Everything **before and including** that block (tools, then system, then messages, in that order) is cached.
- The first request pays a little extra to write the cache (`cache_creation_input_tokens`). Later requests with the same prefix show `cache_read_input_tokens` instead, billed at a fraction of the normal input price.
- The default cache lifetime is a few minutes and is refreshed each time it is used, so a busy app keeps it warm. A longer lifetime option exists for less frequent traffic.
- For simple cases, you can instead pass `cache_control={"type": "ephemeral"}` as a top-level argument to `messages.create`, and the SDK caches up to the last cacheable block automatically.

### Rules that make or break caching

Caching is an exact **prefix match**. One changed character early in the prompt invalidates everything after it. Common mistakes:

| Mistake | Fix |
|---|---|
| Putting today's date or time in the system prompt | Put volatile info in the user message, after the cached part |
| Inserting the user's name at the top of the system prompt | Move personalisation to the end |
| Building tool lists in a different order each request | Keep tool definitions in a fixed order |
| Serialising JSON with unsorted keys | Use `json.dumps(..., sort_keys=True)` |
| Prefix too short | Below a model-specific minimum length, caching silently does nothing |

Always verify: if `cache_read_input_tokens` stays at zero on repeated requests, something in your prefix is changing.

In multi-turn chat, caching also helps: the conversation history is a growing prefix, so each new turn can reuse the cached earlier turns.

## Right-size the model and the effort

Not every task needs your most capable model at high effort:

| Task | Sensible starting point |
|---|---|
| Classification, routing, simple extraction | Smaller, faster model and low effort |
| RAG answers over clean documents | Mid-tier model, low or medium effort |
| Complex agents, tricky reasoning, code generation | Most capable model, higher effort |

Because you read the model name from an environment variable, you can run your evaluation set from Module 3 against a cheaper model or a lower effort setting and compare. Only downgrade where the eval scores hold. Judge cost **per completed task**, not per request: a cheaper setting that needs more retries or more agent steps may not be cheaper overall.

A common architecture is **routing**: a fast, cheap call classifies the request ("simple FAQ" vs "complex analysis"), then sends it to the appropriate model.

## Other levers

- **Cap output where appropriate**: ask for concise answers in the prompt ("max 120 words") rather than relying on a tiny `max_tokens`, which just truncates.
- **Retrieve less**: in RAG, fewer and smaller chunks cut input tokens on every question. Use your hit-rate eval to find the smallest `k` that works.
- **Trim history**: summarise or drop old conversation turns.
- **Batch processing**: for non-urgent bulk jobs (classifying 50,000 support tickets overnight, extracting last year's invoices) use the Message Batches API. Requests are processed asynchronously, typically within hours, at a discount compared with normal calls.
- **Cache your own results**: if many users ask identical questions ("What are the office hours?"), store answers in Redis or a database keyed by a normalised question.

## A worked example

Suppose your HR bot sends a 20,000-token policy with every question and gets 2,000 questions a day. Without caching, that is 40 million input tokens a day just for the policy. With caching and steady traffic, most of those become cache reads at a fraction of the price. Add a smaller model for greeting-style messages and trimmed answers, and the bill can fall substantially. The exact saving depends on your traffic pattern and current prices, which is why you measure before and after.

## Try it yourself

About 20 minutes:

1. Add `log_usage` to your RAG or HR bot and run 10 questions. Note average input and output tokens.
2. Use `count_tokens` on your largest document.
3. Put a long, stable document in the system prompt with `cache_control`. Ask three questions within a couple of minutes and confirm `cache_read_input_tokens` is non-zero from the second call.
4. Deliberately add `datetime.now()` to the start of the system prompt, rerun, and watch cache reads drop to zero. Remove it.
5. Run your evaluation set at two different effort levels and record score, average tokens and average latency in a small table.

## Key takeaways

- Log tokens per feature first; it tells you which lever to pull.
- Prompt caching cuts the cost of repeated prefixes, but only with an exactly identical prefix.
- Keep stable content first and volatile content last; verify with `cache_read_input_tokens`.
- Match model and effort to the task, and prove downgrades with your eval set.
- Use batching, smaller retrieval, trimmed history and result caching for further savings.
