In this lesson you build Project 4: an agent that gathers data from several sources every week, writes a report, and then *waits* for a human to approve, edit or reject it before anything is sent. Human-in-the-loop design is what makes AI automation safe enough for real businesses.

## Why human-in-the-loop

Some outputs are low-risk: a label on an email, a row in a sheet. Others carry your name or your client's: a report to investors, a message to 500 customers, a payment. For those, the pattern is:

> **AI does the work → human approves → automation delivers.**

You keep most of the time savings (reviewing a draft takes minutes; writing it takes hours) while a person stays accountable for what goes out.

## The scenario

Nikhil is the founder of a D2C spice brand in Hyderabad. Every Monday his ops manager, Fatima, spends two hours pulling numbers from the order sheet, the ad spend sheet and the support inbox, then writes a summary for Nikhil and two investors. The goal: Fatima reviews a ready draft on Monday morning in ten minutes.

## The workflow design

```text
1. Schedule trigger: every Monday, 7:00 am
2. Agent step with read-only tools:
     - get_weekly_orders (orders sheet, last 7 days)
     - get_ad_spend (ads sheet, last 7 days)
     - get_support_summary (triage log from Project 2, last 7 days)
     - get_last_week_report (previous report, for comparison)
3. Agent writes the report draft in a fixed template
4. Save draft to a Google Doc + log row with status "PENDING"
5. Send approval request to Fatima with Approve / Edit / Reject options
6. WAIT for the response
7a. Approve → send the report email to Nikhil + investors, status "SENT"
7b. Edit → Fatima edits the Doc, then approves → send edited version
7c. Reject → status "REJECTED", notify Fatima, nothing sent
8. Timeout: no response by 12 noon → reminder; by end of day → mark "EXPIRED"
```

## Why an agent here (and not just a fixed workflow)?

Honestly, the data gathering could be fixed steps. The agent earns its place in the *analysis*: it decides what to look into further. If orders dropped, it can check whether ad spend also dropped or whether support complaints about delivery rose. Giving it tools rather than pre-computed tables lets it follow the thread. If your report is purely numbers, a fixed workflow with one AI summary step is simpler – and that's a perfectly good choice.

## The agent instructions

```text
You prepare the weekly business report for Nikhil Spices.
Use the tools to get data for the 7 days ending yesterday. Compare with
last week's report.

Write the report in this exact structure:
1. Headline (one sentence)
2. Key numbers: orders, revenue (₹), average order value, ad spend,
   revenue-to-ad-spend ratio – this week vs last week
3. What went well (max 3 bullets)
4. What needs attention (max 3 bullets)
5. Customer support themes (max 3 bullets)
6. Questions for the team (max 2)

Rules:
- Every number must come from a tool result. Never estimate or round
  unless you say so.
- If a tool fails or data looks incomplete, say so clearly at the top.
- Separate facts from interpretation; label guesses as "possible reason".
- No hype. Plain, direct business English.
```

The "every number must come from a tool" and "say so if data is missing" rules are critical. A report that confidently invents revenue figures is worse than no report.

### Consider doing the maths outside the AI

Language models can make arithmetic mistakes, especially with many rows. A sturdy pattern: compute totals and percentages in fixed steps (sheet formulas or a summarise/aggregate step), and give the agent the computed numbers. Let the AI do what it is good at – spotting patterns and writing – and let formulas do the arithmetic.

## Building the approval step

All three major tools support pausing for a human, with different mechanics:

- **Wait-for-response nodes:** n8n can send a message (email, Slack, Telegram and others) with approval buttons and pause the workflow until someone responds; it also supports form-based and webhook-based waits.
- **Approval links:** a common no-code pattern is an email with two links – Approve and Reject – each pointing to a webhook URL with the report ID. Clicking one starts (or resumes) the next workflow.
- **Status-column approval:** the simplest of all. The workflow writes "PENDING" in a sheet. Fatima changes it to "APPROVED". A second workflow, triggered by that change (or checking every 15 minutes), sends the report.
- **Built-in approval features:** some platforms offer native human-in-the-loop or approval steps; check your tool's current options.

The status-column method is less elegant but extremely robust and easy for clients to understand. Start there if unsure.

### Approval message design

Make approving easy and informed:

```text
Weekly report ready for review – week ending 12 Oct 2026
Headline: Orders up, but ad efficiency dropped; delivery complaints rose in Pune.
Data warnings: none
Review & edit: [link to Google Doc]
Reply/click: APPROVE | REJECT
```

Show the headline and any data warnings in the message itself, so the reviewer knows where to look.

### Safety rules for approvals

- **Send exactly what was approved.** If Fatima edits the Doc, the send step must read the latest Doc content, not the original draft.
- **One approval, one send.** Mark the row "SENT" immediately and check it before sending, so a double-click doesn't email investors twice.
- **Approvals expire.** A report approved three weeks late shouldn't go out silently.
- **Only the right person can approve.** Unguessable IDs in approval links, or restricting who can edit the status column.

## Try it yourself

Build Project 4 in about 20 minutes, using sample data:

1. Create a sheet with 14 days of fake orders (date, order ID, amount in ₹, city) and a small ad-spend sheet.
2. Build a scheduled workflow (run it manually for testing) with an agent step that has read-only tools for both sheets. Optionally, compute totals with fixed steps first.
3. Use the report template instructions above.
4. Save the draft to a Google Doc and add a log row with status "PENDING".
5. Implement approval using the status-column method: a second workflow sends the Doc content to your email only when status becomes "APPROVED", then sets it to "SENT".
6. Test approve, reject and a double-approval attempt.

## Key takeaways

- Human-in-the-loop means AI drafts, a person approves, automation delivers.
- Use agents for analysis that benefits from following leads; use fixed steps or formulas for arithmetic.
- Require every number to come from data and surface data problems at the top.
- Approval can be buttons, links or a simple status column – robustness beats elegance.
- Send exactly what was approved, exactly once, and let stale approvals expire.
