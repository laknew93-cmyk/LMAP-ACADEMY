A workflow that works in your demo is not the same as one a business can depend on. This lesson gives you a practical routine for testing before launch, monitoring after launch, and handling the failures that will inevitably happen.

## Why AI workflows need extra care

Traditional automations are predictable: same input, same output. Once you add AI steps, outputs can vary slightly between runs, and a model update by the provider can subtly change behaviour. Add third-party APIs, expiring logins and humans renaming sheet columns, and you have many ways for things to quietly go wrong. The goal isn't perfection; it's **finding out fast and recovering cleanly**.

## Testing before launch

### 1. Build a test set

You started this in Projects 1–3. A good test set is a sheet with:

| Input | Expected result | Actual result | Pass? | Notes |
|---|---|---|---|---|
| "Need SEO for my Nashik clinic, ₹30k/month" | HOT | | | |
| "Internship available?" | NOT_A_LEAD | | | |
| Empty message, valid phone | REVIEW | | | |

Include:

- **Happy paths:** typical, clean inputs.
- **Edge cases:** empty fields, very long messages, Hindi/Hinglish/Tamil text, emojis, unusual number formats.
- **Adversarial inputs:** prompt-injection attempts, spam, abusive messages.
- **Volume:** 30–50 items at once to reveal rate limits and duplicates.

### 2. Test each step, then the whole flow

Most tools let you run a single step with sample data. Test steps in isolation first, then run end-to-end. For AI steps, run each test input two or three times – if results flip between runs, tighten the prompt or lower the temperature.

### 3. Use a sandbox for outbound actions

During testing, send emails and WhatsApp messages to yourself, not customers. A common trick: a "TEST MODE" variable at the top of the workflow; when on, all outbound messages go to your own address or number. Turn it off only at launch.

### 4. Re-test after every change

Changed the prompt? Switched to a cheaper model? Re-run the test set. This is the habit that separates professionals from hobbyists. A five-minute regression check prevents a week of wrong labels.

## Launch gradually

Don't flip everything on at once:

1. **Shadow mode** (a few days): the workflow runs and logs what it *would* do, but humans keep working as before. Compare.
2. **Assisted mode:** the workflow acts, but outbound messages are drafts or need approval.
3. **Automatic mode:** only for steps that proved reliable, and only for low-risk actions.

Many workflows should stay in assisted mode permanently for anything customer-facing, and that is fine.

## Monitoring after launch

### Know when it fails

- **Error notifications:** every workflow should alert someone on failure – email, Slack, Telegram or WhatsApp – including workflow name, failed step and error message.
- **Central error workflow:** in n8n you can set a single error workflow for many workflows; Make and Zapier have their own error notification settings. One place to receive all alerts.

### Know when it *silently* stops

The most dangerous failure is no failure: the trigger stops firing because a login expired or a form was replaced, and nothing alerts you because nothing ran. Defences:

- **Heartbeat check:** a daily scheduled workflow checks "did the lead workflow log at least one row in the last 24 hours?" If not, alert. Adjust the window to normal volume.
- **Daily summary:** a short message – "Yesterday: 42 leads processed, 3 to review, 0 errors" – means a missing summary is itself a signal.

### Watch quality, not just uptime

A workflow can run "successfully" while producing bad results. Track:

- **Review rate:** how many items fell into REVIEW or HANDOFF? A sudden jump means something changed.
- **Human corrections:** add a "Correct?" column that staff can tick for a sample of items each week.
- **Category distribution:** if HOT leads go from 15% to 60% overnight, the prompt or the input changed.
- **Costs:** check AI provider usage weekly; spikes usually mean loops or unexpected volume.

## Handling failures

### A failure playbook

Write a short playbook for each client workflow. Example:

```text
WORKFLOW: Lead qualification (Kavya Digital)
If an error alert arrives:
1. Open the run history, find the failed run, note the failed step.
2. Temporary error (timeout, 429, 5xx)? Re-run the failed run.
3. Auth error (401/403, "token expired")? Reconnect the account in
   credentials, then re-run.
4. Data error? Fix the data in the review sheet, then re-run.
5. Unknown? Pause the workflow, notify Kavya that leads will be
   handled manually today, investigate.
Leads are always saved to the sheet before AI steps, so nothing is lost.
```

### Common errors decoded

| Error | Usually means | Fix |
|---|---|---|
| 401 / 403 | Login or key invalid, expired or lacking permission | Reconnect / check key permissions |
| 404 | Item, sheet or endpoint not found (renamed or deleted) | Update the reference |
| 429 | Rate limit | Retry with delay, batch |
| 5xx | Provider-side problem | Retry later |
| Parse / JSON error | AI returned malformed output | Structured output mode, fallback branch |

### Recovery and replay

Most tools let you re-run failed executions. Because you designed steps to be safe to repeat (find-or-create, "sent" flags), replaying is safe. Keep the review/dead-letter sheet as your safety net for anything that can't be replayed automatically.

## Documentation and handover

For every workflow you build for a client, keep a one-page document: purpose, trigger, steps, credentials used (names only, never the keys), where logs are, who gets alerts, the failure playbook and the date of last test. Future-you will be grateful, and so will the client's next hire.

## Try it yourself

Harden one of your projects in about 20 minutes:

1. Expand its test set to 20 rows including edge cases and two adversarial inputs, and run it.
2. Add a TEST MODE switch that redirects outbound messages to you.
3. Set up error notifications and a daily heartbeat check.
4. Write a one-page failure playbook for the workflow.
5. Deliberately break something (rename a sheet column or revoke a connection) and confirm you get alerted.

## Key takeaways

- Build a test set with happy paths, edge cases and adversarial inputs, and re-run it after every change.
- Launch in stages: shadow, assisted, then automatic for low-risk steps only.
- Monitor for errors, for silent stops (heartbeat checks), for quality drift and for cost spikes.
- Keep a written failure playbook and design for safe replay.
- Document every client workflow on one page – without ever writing down secrets.
