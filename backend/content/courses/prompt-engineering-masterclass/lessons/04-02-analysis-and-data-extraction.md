AI is excellent at turning messy text into organised information and at helping you think through data. This lesson covers analysis prompts and a structured data-extraction prompt you will test on 10 samples as a course project.

## Analysis prompts

### Summarise for a decision

A summary is only useful if it serves a purpose. Tell the model what decision the reader faces:

```text
Below are 40 customer reviews of our Bengaluru cloud-kitchen biryani brand
from the last month. I need to decide what to fix first.

1. Group the complaints into themes. For each theme give: number of reviews,
   one representative quote, and severity (High/Medium/Low) with a reason.
2. Separately list what customers praise, so we don't accidentally change it.
3. Recommend the top 2 fixes for the next 30 days.

Count carefully; if you are estimating, say so.

<reviews>
...
</reviews>
```

### Compare and contrast

```text
Compare the two vendor quotations below for office laptops.
Return a table: Item | Vendor A | Vendor B | Difference | Notes.
Include warranty, delivery time, payment terms and total cost with GST.
Then list anything one quote includes that the other doesn't mention.
```

### Find the "so what"

```text
Here is our monthly sales data by city. Don't just describe the numbers.
Tell me: the 3 most important changes vs. last month, possible reasons for
each (labelled as hypotheses), and what data would confirm or rule them out.
```

### A word on numbers

Chat models can misread or miscalculate when you paste large tables. Many assistants can now run code or analyse uploaded spreadsheets, which is far more reliable for calculations. If yours can, upload the file and ask it to compute using code. Either way, spot-check totals against your own spreadsheet.

## Structured data extraction

Extraction means pulling specific fields out of unstructured text: invoices, emails, resumes, contracts, chat messages. Done well, it saves hours of copy-paste work.

Imagine Farhan, an operations executive at a Surat textile trader. Every day he receives order messages on WhatsApp and email in every possible format:

> "Bhai 50 meter rayon print red wala, same as last time, Sharma Traders Indore, deliver by 20th, payment 30 days"

He needs each order as a row in a spreadsheet.

### The extraction prompt

```text
You extract order details from customer messages for a textile trading firm.

For each message inside <message> tags, return ONE line of JSON with exactly
these fields:

{
  "customer_name": string or null,
  "city": string or null,
  "product": string or null,
  "colour": string or null,
  "quantity": number or null,
  "unit": "meter" | "piece" | "kg" | null,
  "delivery_date": string as written, or null,
  "payment_terms_days": number or null,
  "repeat_order": true | false | null,
  "needs_clarification": [string]
}

Rules:
1. Use only information in the message. Never guess or fill from "typical" values.
2. Messages may be in English, Hindi, Gujarati-English or Hinglish. Translate
   values into English.
3. "same as last time" means repeat_order = true; add "Confirm previous order
   specs" to needs_clarification.
4. If quantity has no unit, set unit to null and add "Unit missing".
5. Return only the JSON line, nothing else.

Example:
<message>Need 200 pcs white cotton dupatta, Mehta Fashion Jaipur, urgent</message>
{"customer_name":"Mehta Fashion","city":"Jaipur","product":"cotton dupatta","colour":"white","quantity":200,"unit":"piece","delivery_date":"urgent","payment_terms_days":null,"repeat_order":false,"needs_clarification":["Specific delivery date"]}

<message>
[PASTE MESSAGE]
</message>
```

What makes this robust:

- **A fixed schema** with allowed values.
- **Null rules** so the model never invents a field.
- **A `needs_clarification` list**, which turns ambiguity into an action item instead of a silent error.
- **Language handling** for real Indian inputs.
- **One worked example** showing the exact output shape.

For a spreadsheet, swap JSON for a single tab-separated line with a fixed column order.

## Testing on 10 samples

Apply what you learned in Lesson 3.3. Build a test sheet:

```text
Sample # | Message | Expected output (filled by you) | AI output | Fields correct (x/10) | Notes
```

Choose samples deliberately:

- 4 clean, complete messages
- 2 with missing information (no date, no unit)
- 2 in Hinglish or another mixed language
- 1 with two products in one message
- 1 that isn't an order at all ("Bhai payment kab tak aayega?")

The last two are where extraction prompts usually fail. You'll likely need to add rules such as:

```text
6. If a message contains more than one product, return one JSON line per product.
7. If the message is not an order, return {"not_an_order": true, "summary": "<one line>"}.
```

Score field-level accuracy: 10 samples x 10 fields = 100 checks. Record the score, fix the biggest failure, re-run, and log both versions.

## Privacy note

Extraction often involves personal or business data. Follow your company's rules about which AI tools are approved, prefer business or enterprise plans where data handling terms are clearer, and remove phone numbers, Aadhaar or PAN numbers, and bank details from samples you test with.

## Try it yourself (Project: Data Extraction tested on 10 samples)

Spend 20 minutes.

1. Pick a real extraction need: invoices, job postings, resumes, leads from enquiry emails, or orders.
2. Design a schema of 6-10 fields with allowed values and null rules.
3. Write the prompt with one worked example and a `needs_clarification` field.
4. Collect 10 anonymised samples following the mix above and write the expected output for each.
5. Run, score field by field, fix the top failure, and re-run. Log both scores.
6. Save the final prompt and the test sheet as a portfolio project.

## Key takeaways

- Analysis prompts should name the decision the reader faces, not just ask for a summary.
- For calculations on real data, use the tool's code or spreadsheet analysis and spot-check.
- Extraction prompts need a fixed schema, null rules and a worked example.
- A `needs_clarification` field turns ambiguity into action rather than silent errors.
- Test extraction field by field on varied samples, including non-matching inputs.
