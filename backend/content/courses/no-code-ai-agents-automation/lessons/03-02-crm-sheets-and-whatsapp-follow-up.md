Your leads are now captured and scored. In this lesson you finish Project 1: saving every lead to a Google Sheet or CRM, routing by score, alerting your team, and following up on WhatsApp or email in a way that is fast, personal and compliant.

## Step 6: Save every lead

Save first, act second. Whatever happens later in the run, the lead should already be recorded.

### Option A: Google Sheets as a lightweight CRM

For a small business, a well-designed sheet goes a long way. Suggested columns:

| Column | Filled by |
|---|---|
| Lead ID | Automation (e.g. date + row number) |
| Received at | Trigger |
| Source | Trigger |
| Name, Phone, Email, Company | Trigger (cleaned) |
| Message | Trigger |
| AI score, Category, Reason, Next step | AI step |
| Owner | Router |
| Follow-up sent | Automation (yes/no + timestamp) |
| Status | Humans (New, Contacted, Proposal, Won, Lost) |
| Notes | Humans |

Freeze the header row, protect the automation-filled columns from accidental edits where you can, and **never rename columns** without updating the workflow – renamed columns are one of the most common causes of broken flows.

### Option B: A real CRM

If the business uses Zoho CRM, HubSpot, Pipedrive, LeadSquared or similar, use the tool's connector (or HTTP Request with the CRM's API) to "find or create contact" and then "create deal/lead". Map the AI fields into custom fields so the sales team sees the score and reason inside the CRM they already use.

## Step 7: Route by score

Add a router with four branches based on `category`:

```text
HOT        → assign owner, instant alert to owner, immediate personalised follow-up
WARM       → assign owner, follow-up message, reminder task in 2 days
COLD       → polite acknowledgement email, add to monthly newsletter list (with consent)
NOT_A_LEAD / REVIEW → no outbound message; log only (REVIEW gets a human check)
```

For owner assignment, keep it simple: a lookup sheet mapping city or service to a person, or a round-robin using a counter. Don't over-engineer this in version one.

## Step 8: Follow-up messages

### Alert the team instantly for HOT leads

Send the owner a short internal alert on Slack, email or a WhatsApp group the team uses:

```text
HOT lead (score 84) – Rohan Kulkarni, Kulkarni Sweets, Indore
Needs: Instagram + Google Ads for 3 outlets, starting next month
Why: clear budget mentioned, local business, near-term start
Call: +91 98XXXXXX21
```

Speed matters with hot leads; an alert that arrives within a minute changes how fast the team responds.

### AI-drafted personalised follow-up

Add a second AI step that drafts the outbound message using the lead's own words:

```text
Write a short, warm first reply from Kavya at Kavya Digital to this lead.
- Max 60 words. Plain, friendly English; no hype, no emojis.
- Mention one specific detail from their message.
- Offer a 15-minute call and ask for a convenient time.
- Do not mention prices or make promises about results.

Lead name: {{name}}
Their message: {{message}}
```

For HOT leads in the beginning, consider sending this draft to the owner for a quick approval instead of sending automatically. We cover human approval properly in Module 4.

### WhatsApp: do it the right way

WhatsApp is how most Indian customers prefer to talk, but automation needs care:

- Use the **WhatsApp Business Platform** (Cloud API), either directly through Meta or through an official Business Solution Provider (many Indian providers such as Interakt, AiSensy, Wati, Gupshup and others offer this with friendly dashboards and connectors). Avoid unofficial tools that automate the regular WhatsApp app – they can get numbers banned and are not suitable for client work.
- Businesses generally need the customer's **opt-in** before messaging them. Add a clear checkbox or line on your form ("I agree to be contacted on WhatsApp").
- Messages that a business starts – like your first follow-up – generally must use a **pre-approved message template**. Templates have placeholders, e.g. "Hi {{1}}, thanks for contacting {{2}} about {{3}}…". Free-form messages, including fully AI-written text, are typically allowed only within a limited customer-service window after the customer messages you. Check current Meta rules and your provider's guidance, as policies and pricing change.
- In practice: send an approved template first (you can fill a placeholder with a short AI-generated detail if it fits the template's purpose), and once the lead replies, a human or a bot can continue the conversation freely within the allowed window.

### Email follow-up

Email is more flexible: you can send the AI-drafted message directly from Gmail/Outlook connectors. Send from a real person's address, include a signature, and for bulk or newsletter emails use a proper email marketing tool with unsubscribe handling.

### Record what was sent

After sending, update the lead's row: `Follow-up sent = yes, 17-Oct-2026 10:42, WhatsApp`. Before sending, check this column so a re-run never messages a lead twice.

## Step 9: The follow-up reminder

For WARM leads, schedule a check: a daily scheduled workflow that finds rows where Status is still "New" and Received at is more than two days ago, and sends the owner a reminder list. This "wait" step is exactly what humans forget and automations remember.

## Try it yourself

Complete Project 1 (about 20 minutes, plus provider sign-up time if needed):

1. Add the lead-sheet columns above and map all fields, saving the lead before any routing.
2. Add a router on `category` with HOT, WARM, COLD and a fallback branch.
3. For HOT, send yourself an instant alert (email or chat) and an AI-drafted follow-up email.
4. Optional: sign up for a WhatsApp Business Platform provider's trial and submit one template for approval for your follow-up.
5. Add a "Follow-up sent" check so re-runs don't double-message.
6. Push your 10-lead test set through the full flow and screenshot the resulting sheet for your portfolio (blur any real personal data).

## Key takeaways

- Save the lead first, then route and act, so nothing is lost if a later step fails.
- A well-structured Google Sheet is a perfectly good CRM for small teams; connect a real CRM when one exists.
- Instant alerts for hot leads and automatic reminders for warm leads are often the biggest wins.
- Use the official WhatsApp Business Platform with opt-in and approved templates for business-initiated messages.
- Track what was sent so the workflow never double-messages a lead.
