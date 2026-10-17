Every workflow you will ever build is made of the same three ingredients: something that starts it, steps that do things, and data that flows between them. Get comfortable with these and every tool becomes easy to learn.

## Triggers: what starts a workflow

A **trigger** is the event that kicks off a run. Most triggers fall into four families:

| Trigger type | How it works | Example |
|---|---|---|
| App event | The tool watches an app for something new | New row in Google Sheets, new email in Gmail, new Typeform response |
| Webhook | Another system sends data to a unique URL your workflow listens on | Your website form, Razorpay payment events, a WhatsApp provider's incoming message |
| Schedule | Runs at fixed times | Every Monday at 9 am, every hour |
| Manual | You click a button or submit a form inside the tool | Testing, or an on-demand "generate report" button |

### Polling versus instant

Some app triggers **poll**: the tool checks the app every few minutes for new items. Others are **instant**, usually powered by webhooks behind the scenes. Polling intervals depend on the tool and plan. For a lead form, a delay of a few minutes may be fine; for an OTP-style alert it is not. Check the trigger's description to see which kind it is.

### Webhooks in plain English

A webhook is like giving someone your phone number and saying "call me when something happens." Your workflow tool gives you a unique URL. You paste that URL into the other system's settings (for example, your website form plugin or payment gateway dashboard). Whenever the event happens, that system sends the data to your URL and your workflow starts.

Treat webhook URLs like semi-private addresses. Anyone who has the URL can send data to it, so don't publish it, and in serious setups add a secret check (many tools support a header or a token).

## Actions: what the workflow does

An **action** is a step that does something: create a row, send an email, post a Slack message, call an AI model, update a CRM contact. Actions fall into a few kinds:

- **Create** – add a new record (row, contact, task, message).
- **Update** – change an existing record. Needs a way to identify which one, usually an ID.
- **Search/Find** – look up a record, e.g. "find the row where Phone = this number".
- **Send** – email, WhatsApp, SMS, chat message.
- **HTTP Request** – the universal adapter. When no ready-made connector exists, you call the app's API directly by entering the URL, method (GET, POST), headers and body. Most APIs document these.

A good habit: **search before you create**. If the same customer submits a form twice, a "find or create" pattern prevents duplicate rows.

## Data mapping: the part that confuses everyone

Each step outputs data. Later steps can use it. **Mapping** is the act of saying "put *this* field from an earlier step into *that* box in this step."

Imagine a website form sends this data:

```json
{
  "full_name": "Anjali Deshmukh",
  "phone": "98200 12345",
  "email": "anjali.d@example.com",
  "city": "Nagpur",
  "message": "Need a quote for office interiors, 2,000 sq ft"
}
```

In a "Add row to Google Sheet" step, you would click into the "Name" column box and pick `full_name` from the previous step's data. Every tool shows earlier step outputs in a picker panel, and inserts a reference (shown as a coloured pill or something like `{{ $json.full_name }}` in n8n). When the workflow runs for real, that reference is replaced with the actual value.

### Always run a test first

You cannot map fields that the tool has never seen. Before mapping, **send one real test submission** through the trigger so the tool can capture sample data. Use realistic test data, not "asdf", so you notice formatting problems.

## Transforming data along the way

Raw data is rarely in the format the next app wants. Common transformations:

- **Phone numbers:** "98200 12345" → "919820012345" for WhatsApp APIs (remove spaces, add country code).
- **Names:** split "Anjali Deshmukh" into first and last name.
- **Dates:** "17/10/2026" (Indian format) vs "2026-10-17" (what most APIs expect). Mixing up DD/MM and MM/DD is a classic bug.
- **Currency:** "₹1,50,000" → 150000 as a number.
- **Text cleanup:** trimming spaces, lowercasing emails.

Each tool has formatter functions or a "Formatter"/"Set"/"Edit fields" style step. For messy cases, an AI step can also clean data, but plain functions are cheaper, faster and more predictable – use them first.

## Reading a run history

Every tool keeps a **history** (or "executions", "runs") of each time the workflow ran. Open a run and you can see exactly what data entered and left every step. When something goes wrong, this is the first place to look. Make it a habit to check the history after your first few real runs, even when nothing seems broken.

## Try it yourself

Build this in your chosen tool in about 20 minutes:

1. Create a free Google Form (or Tally/Typeform form) with fields: Name, Phone, City, Message.
2. Create a Google Sheet called "Leads – Test" with columns: Timestamp, Name, Phone (clean), City, Message.
3. Build a workflow: trigger on **new form response** → a formatting step that removes spaces from the phone number and adds "91" in front → **add a row** to the sheet, mapping each field.
4. Submit three test responses with realistic Indian names and numbers written in different formats ("+91 98450-11223", "9845011223", "098450 11223").
5. Check the sheet and the run history. Did all three phone numbers come out identical? If not, fix your formatting step until they do.

## Key takeaways

- Triggers can be app events, webhooks, schedules or manual; know whether yours polls or is instant.
- Actions create, update, find or send data; the HTTP Request step connects to almost any API.
- Mapping means inserting fields from earlier steps; always run a realistic test first so fields appear.
- Clean and transform data (phones, dates, currency) with plain functions before reaching for AI.
- The run history is your best debugging tool.
