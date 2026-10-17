A straight-line workflow is a good start, but real business processes have decisions in them: "only if", "otherwise", "if this fails, then". This lesson covers filters, routers and the error handling that keeps your workflows from failing silently.

## Filters: stop or continue

A **filter** is a gate. If the condition is true, the run continues; if false, it stops quietly at that point. Zapier calls them Filters, Make attaches filters to the lines between modules, and n8n uses an If or Filter node.

Typical filter conditions:

- Email subject **contains** "invoice".
- Order value **greater than** 5000.
- City **is one of** Mumbai, Thane, Navi Mumbai.
- Phone **exists** (is not empty).

### Write conditions defensively

Data is messier than you expect. "Mumbai", "mumbai ", "Bombay" and "MUMBAI" are all the same city to a human but not to a filter. Before filtering:

- Trim spaces and lowercase text in a formatting step.
- For numbers, make sure the field is treated as a number, not text. Text comparison can rank "900" above "10000".
- Decide what happens when a field is empty. Most bugs live there.

## Routers and branches: different paths for different cases

A **router** (Make), **paths** (Zapier) or **Switch/If** nodes (n8n) send the run down different branches based on conditions.

Example for a Coimbatore pump manufacturer receiving enquiries:

```text
New enquiry
 ├─ Branch A: product = "industrial"  → assign to Senthil, email + CRM deal
 ├─ Branch B: product = "agricultural" → assign to dealer network sheet
 └─ Branch C: anything else (fallback) → send to general inbox for review
```

Two rules for routers:

1. **Always have a fallback branch.** Something will eventually not match any rule. Without a fallback, it vanishes.
2. **Make branches mutually exclusive** unless you really want one item to go down two paths. Some tools run every branch whose condition is true.

Later in this course, AI classification will feed routers: the AI labels an email as "billing", "support" or "sales", and the router acts on the label. The label must be one of a fixed list for this to work – we will enforce that in the next lesson.

## Loops and lists

Sometimes a trigger brings a list: an order with five line items, or a daily sheet with 40 new rows. Tools handle this with iterators or loop steps that run the following steps once per item, and aggregators that combine results back into one. You do not need to master them yet; just know that when a step seems to run "too many times" or "only once", list handling is usually the reason.

## Error handling: plan for failure

Every workflow will fail at some point. The Google Sheet gets renamed, an API is down for ten minutes, an AI provider rate-limits you, a customer types an emoji where you expected a number. The question is not *whether* it fails, but *whether you find out*.

### Types of failures

| Failure | Example | Typical fix |
|---|---|---|
| Temporary | API timeout, rate limit, provider outage | Retry after a delay |
| Data problem | Empty phone number, invalid email | Validate early, route to a review sheet |
| Configuration | Renamed sheet, expired login, revoked key | Alert a human to fix it |
| Logic | AI returns an unexpected label | Fallback branch, tighter prompt |

### Tools you have

- **Retries:** most tools can automatically retry a failed step a few times with a wait in between. Turn this on for steps that call external APIs, including AI steps.
- **Error routes / error workflows:** Make lets you attach error handlers to modules; n8n lets you set an error workflow that runs when any workflow fails, and individual nodes can be set to continue on error; Zapier offers error notifications and some path-on-error options. The names differ, but the idea is the same: *when this breaks, do something useful*.
- **Notifications:** send yourself an email, Slack, Telegram or WhatsApp alert with the workflow name, the step that failed and the error message.
- **Dead-letter sheet:** a Google Sheet called "Failed items" where any item that couldn't be processed is logged with its data and error. A human reviews it daily. Nothing is lost.

### Validate early

The cheapest error is the one you catch at the start. Right after the trigger, add a check: are the required fields present and in the right format? If not, send the item to the review sheet and stop. This avoids half-finished runs where the CRM got updated but the WhatsApp message failed.

### Make steps safe to repeat

If a run fails halfway and you re-run it, will it create a duplicate CRM contact or send the customer a second message? Use "find or create" patterns and record a status column ("WhatsApp sent: yes") that you check before sending. This property – safe to run twice – will save you embarrassment with clients.

## Try it yourself

Extend your lead workflow from the previous lesson (about 20 minutes):

1. Add a validation step right after the trigger: if Phone is empty or shorter than 10 digits, send the row to a new sheet tab called "Needs review" and stop.
2. Add a router with three branches based on City: one for your own city, one for a list of three nearby cities, and a fallback for everything else. Each branch adds a different value in a new "Region" column.
3. Turn on retries (or the equivalent) for the Google Sheets step.
4. Set up an error notification to your email.
5. Test with four submissions: a valid local lead, a valid nearby-city lead, an unknown city, and one with a missing phone number. Confirm each landed where expected.

## Key takeaways

- Filters stop or continue a run; routers send it down different branches.
- Always include a fallback branch, and normalise text before comparing.
- Expect failures: use retries for temporary errors, alerts for configuration errors, and a review sheet for bad data.
- Validate inputs at the start and design steps so a re-run does not create duplicates or double messages.
