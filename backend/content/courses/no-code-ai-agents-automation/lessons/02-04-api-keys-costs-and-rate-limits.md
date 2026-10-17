The moment you connect a real AI provider, you are dealing with API keys, usage bills and rate limits. These are boring topics until a leaked key or a runaway loop costs you money. This lesson makes you careful without making you nervous.

## What an API key is

An **API key** is a long secret string that identifies you to a service like OpenAI, Anthropic or Google. Anyone who has your key can use the service and the usage is billed to your account. Treat it exactly like a debit card PIN – actually, more carefully, because keys can be used silently from anywhere in the world.

## Handling keys safely

### Store keys in the tool's credentials section

Zapier, Make and n8n all have a dedicated place to store connections/credentials. Paste the key there once, give it a clear name ("OpenAI – Client: Mehta Traders"), and select it in your steps. **Never** paste a key directly into a prompt, a text field, a Google Sheet, or an HTTP Request body where it will show up in run logs.

### One key per project or client

Most providers let you create multiple keys and often group them into projects or workspaces. Create a separate key for each client or workflow. If one leaks or a client leaves, you revoke that key without breaking everything else. You can also see usage per key, which helps with billing clients.

### Who owns the account

For client work, the cleanest arrangement is usually: **the client creates the AI provider account, adds their own payment method, and creates a key for you**. Then:

- Usage is billed to them directly; you don't carry their costs on your card.
- When the engagement ends, they revoke your access.
- There is no confusion about who owns the data relationship with the provider.

If you do resell usage, put it in your contract with a clear monthly cap.

### Never share keys over chat

Do not ask clients to WhatsApp you their keys. Use the tool's sharing or team features where possible, or a password manager's secure sharing feature. If a key has been pasted somewhere public – a screenshot on LinkedIn, a shared Google Doc, a GitHub repository – **revoke it immediately and create a new one**. Assume it has already been copied.

### Least privilege

Some services offer keys with restricted permissions (read-only, specific project only). Use the narrowest permission that works. A key that only needs to read a Google Sheet shouldn't be able to delete Drive files.

## Understanding AI costs

AI APIs are usually billed by **tokens** – chunks of text roughly a few characters long. You pay for input tokens (your prompt plus the data) and output tokens (the response), with output usually costing more per token. Check your provider's pricing page for current rates; don't rely on numbers from old blog posts.

### Estimate before you build

```text
Monthly cost ≈ runs per month × (input tokens + output tokens per run) × price per token
```

For a lead classifier: a short prompt plus a 100-word enquiry, with a one-word answer, is a small number of tokens per run. Even with a few thousand leads per month, a small model typically costs very little. But feed a 30-page PDF into a large model on every run and costs grow fast.

### Ways to keep costs down

- **Use the smallest model that passes your tests** (classification rarely needs the biggest model).
- **Trim the input:** send only the email body, not the entire thread with signatures and disclaimers.
- **Limit output length:** set a maximum output length and ask for concise formats.
- **Filter before the AI step:** don't send spam, auto-replies or newsletters to the model at all. A simple filter on sender or subject saves money on every run.
- **Don't repeat work:** if you've already classified an email, store the result; don't reclassify on every re-run.

### Set spending limits

Most AI providers let you set usage limits, budget alerts or prepaid credits. Set a monthly limit for every key or project, with an email alert well below it. This single setting protects you from the most common disaster: a workflow stuck in a loop calling the AI thousands of times overnight.

Also remember the automation tool's own costs – task or operation counts, or your server bill if self-hosting n8n.

## Rate limits

Providers cap how many requests (and tokens) you can send per minute. If you exceed the limit, you get an error (often HTTP status 429, "Too Many Requests"). This commonly happens when:

- A sheet with 500 rows is processed all at once.
- A bulk email import triggers hundreds of runs.

How to handle it:

- **Turn on retries with a delay** for AI steps. Most rate-limit errors succeed on retry a little later.
- **Batch and pace:** process items in small batches with a short wait between them. Make and n8n let you control this; in Zapier you can add delay steps or use built-in throttling options where available.
- **Spread scheduled jobs:** don't run every client's daily workflow at exactly 9:00 am.

## A simple security checklist

```text
[ ] Keys stored only in the tool's credentials section
[ ] Separate key per client/project, clearly named
[ ] Monthly spending limit + alert set at provider
[ ] Retries with delay on all AI and API steps
[ ] Filter removes junk before the AI step
[ ] No keys in screenshots, docs, sheets or chat messages
[ ] Client knows which provider processes their data
```

## Try it yourself

Spend 15 minutes on your own setup:

1. Log in to your AI provider's dashboard. Find where keys are created, and create a new key named for your course project.
2. Find the usage/billing page and set a low monthly spending limit and alert.
3. Replace any key you pasted directly into steps with a stored credential.
4. Add a filter before your AI step that skips submissions where the message is shorter than 10 characters.
5. Estimate your workflow's monthly AI cost using the formula above and the provider's current pricing page. Write the estimate in your project notes.

## Key takeaways

- An API key is like a payment instrument; store it only in the tool's credentials section and never share it in chat.
- Use separate keys per client, ideally on the client's own provider account.
- Estimate token costs before building, use smaller models, trim inputs and filter junk.
- Always set spending limits and alerts at the provider.
- Handle rate limits with retries, delays and batching.
