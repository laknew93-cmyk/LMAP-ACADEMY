This is where automations become intelligent. In this lesson you will add an AI step that can summarise, classify, extract and draft – and, just as importantly, you will learn how to make its output reliable enough for the next step to use.

## Two ways to add AI

Every major automation tool now offers AI in two forms:

1. **Built-in AI steps** – the tool provides an "AI" or "AI by [tool]" step, sometimes with a model already connected. Quick to start, less control.
2. **Direct model connectors** – steps for OpenAI, Anthropic (Claude), Google Gemini and others, where you connect your own API key and pick the model. More control over model choice and cost.

If no connector exists for a provider, you can always call its API with an HTTP Request step. Either way, the step works like this: you send a **prompt** (instructions plus data from earlier steps), and you get back **text** that later steps can use.

## The four jobs an LLM step does best

| Job | Input | Output | Example |
|---|---|---|---|
| Summarise | Long text | Short text | Turn a 40-line customer email into 2 lines for the sales team |
| Classify | Text | One label from a fixed list | Sales / Support / Billing / Spam |
| Extract | Unstructured text | Structured fields | Pull name, GSTIN, invoice amount and due date from an email |
| Draft | Context + instructions | A message | Write a polite reply confirming the site-visit slot |

Most useful business workflows combine two or three of these.

## Writing prompts for automations

A prompt in an automation is different from chatting. Nobody is there to say "no, shorter please". The output must be right the first time and in a shape the next step understands. Use this structure:

```text
ROLE: You are an assistant for Sharma Dental Clinic, Lucknow.

TASK: Classify the patient message below into exactly ONE category.

CATEGORIES:
- APPOINTMENT: wants to book, change or cancel an appointment
- BILLING: questions about fees, payments, insurance, receipts
- CLINICAL: questions about symptoms, treatment, pain, medicines
- OTHER: anything else

RULES:
- If the message mentions severe pain, bleeding or swelling, choose CLINICAL.
- Reply with the category word only. No explanation.

MESSAGE:
{{message_from_previous_step}}
```

Notice: a clear role, a fixed list of allowed outputs with definitions, tie-breaking rules, and a strict output format. The `{{...}}` part is where you map the field from the trigger step.

## Getting structured output (JSON)

When you need several fields back, ask for JSON. Many tools and model providers also offer a "structured output" or "JSON mode" option – turn it on when available, because it makes valid JSON much more likely.

```text
Extract details from this enquiry. Return ONLY valid JSON with these keys:
{
  "name": string,
  "company": string or null,
  "budget_inr": number or null,
  "timeline": "urgent" | "1-3 months" | "later" | "unknown",
  "summary": string (max 25 words)
}
If a value is not mentioned, use null or "unknown". Do not guess.

Enquiry:
{{message}}
```

After the AI step, add a **parse JSON** step (some tools do this automatically) so each key becomes its own mappable field. Now your router can branch on `timeline` and your sheet can store `budget_inr` in its own column.

### Guard against bad output

Even good prompts sometimes produce surprises. Protect the workflow:

- After a classify step, add a filter: is the output one of the allowed labels? If not, route to a fallback/review branch.
- Set a **low temperature** (or the most "precise/deterministic" setting) for classification and extraction. Use higher creativity only for drafting.
- Tell the model what to do when information is missing ("use null, do not guess"). This reduces made-up values.

## Choosing a model

Providers usually offer larger, more capable models and smaller, faster, cheaper ones. A practical rule:

- **Classify, extract, short summaries:** start with a small, fast model. It is usually good enough and costs much less.
- **Drafting customer-facing messages, nuanced reasoning, long documents:** try a more capable model.

Test both on 10–20 real examples and compare. Don't choose based on hype; choose based on your examples. Model names and prices change frequently, so check the provider's current model list.

## Privacy before you paste

Every AI step sends data to a model provider. Before you pipe customer messages through it:

- Check the provider's data usage terms for API traffic (API terms are often different from consumer chat apps).
- Avoid sending data you don't need. If you only need the message text, don't send the customer's Aadhaar or PAN number along with it.
- Tell your client, in writing, which provider processes their data. Under India's Digital Personal Data Protection Act, businesses have obligations around personal data; your client should take their own legal advice, but you should make data flows transparent.

## Try it yourself

Add an AI step to your lead workflow (about 20 minutes):

1. After the validation step, add an AI step (built-in or your chosen provider).
2. Use the extraction prompt above, adapted to your form fields.
3. Turn on JSON/structured output if available, then parse the result into fields.
4. Add columns to your sheet for `timeline`, `budget_inr` and `summary`, and map them.
5. Submit five test enquiries with different styles: one detailed, one vague, one in Hinglish ("bhai 3BHK ka interior chahiye, budget 8 lakh"), one with no budget and one that is spam.
6. Review the sheet. Did the model invent any values? Tighten your rules if so.

## Key takeaways

- An LLM step is a smart function inside a fixed workflow: prompt in, text out.
- Use it to summarise, classify, extract and draft – often in combination.
- For automations, demand strict output: fixed labels, JSON keys, and explicit "don't guess" rules.
- Validate AI output before acting on it and route unexpected results to review.
- Start with smaller models for simple tasks, test on real examples, and be transparent about data sent to providers.
