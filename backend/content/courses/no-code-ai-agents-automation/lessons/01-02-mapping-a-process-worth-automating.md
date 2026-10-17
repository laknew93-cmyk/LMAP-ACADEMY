The most common mistake beginners make is opening an automation tool first and thinking about the process second. In this lesson you will learn to map a process on paper, spot the steps worth automating and estimate the time saved before you build anything.

## Why mapping comes first

If you automate a messy process, you get a fast mess. A Jaipur textile exporter once asked a freelancer to "automate our order follow-ups". After an hour of questions, it turned out there were three different order sources, two people who each had their own spreadsheet and no agreed definition of when an order was "confirmed". The automation was not the problem; the process was.

Mapping forces you to answer the questions an automation tool will ask you anyway: what starts this, what data do we have, what decisions are made, and where does the result go?

## The five-column process map

You do not need fancy software. A Google Sheet or a notebook page works. For each step, fill in five columns:

| # | Step | Who/what does it | Input → Output | Type |
|---|---|---|---|---|
| 1 | New enquiry arrives on website | Website form | Visitor details → email to sales@ | Trigger |
| 2 | Copy details into Leads sheet | Ravi (sales exec) | Email → sheet row | Copy |
| 3 | Read message, decide if serious | Ravi | Message text → HOT/WARM/COLD | Judgement |
| 4 | Send portfolio on WhatsApp | Ravi | Phone number → message | Send |
| 5 | Follow up after 3 days if no reply | Ravi (often forgets) | Sheet status → reminder | Wait + send |

The **Type** column is where the insight comes from. Use these labels:

- **Trigger** – the event that starts everything.
- **Copy** – moving data from one place to another. Perfect for plain automation.
- **Transform** – reformatting data (dates, phone numbers, names). Also easy to automate.
- **Judgement** – reading something and deciding. A candidate for an AI step.
- **Write** – composing a message or document. A candidate for an AI step, often with a human check.
- **Send** – delivering a message. Automatable, but think about approval.
- **Wait** – delays and follow-ups. Automation tools handle these well; humans forget them.

## Spotting good candidates

A process is worth automating when most of these are true:

- It happens **often** – daily or many times a week.
- It is **rule-based or judgement-light** – a smart intern could do it with a one-page instruction sheet.
- The **inputs are digital** – emails, forms, sheets, chats, not handwritten registers.
- Mistakes are **cheap to catch** – a wrong label is fine; a wrong bank transfer is not.
- People **dislike** doing it, so it gets delayed or skipped.

Be wary of processes that happen twice a year, need deep context that lives in someone's head, or involve money moving without review.

## Estimating time saved

Clients and bosses will ask, "Is this worth it?" Give them a simple, honest calculation:

```text
Time saved per month =
  (minutes per occurrence) × (occurrences per month) × (share automated)
```

For Ravi's lead process:

- Steps 2–5 take about 6 minutes per lead.
- About 200 leads arrive per month.
- The automation handles roughly 80% of the work (Ravi still reviews HOT leads).

6 × 200 × 0.8 = 960 minutes, or about **16 hours a month**.

Then add the benefits that are harder to measure but often matter more: leads contacted within minutes instead of the next day, no forgotten follow-ups, cleaner data for reports. Write them down as qualitative benefits rather than inventing numbers.

### Don't forget the costs

Be equally honest about what the automation costs:

- **Build time** – your hours to design, build and test.
- **Running costs** – the automation tool's subscription and AI usage. Check current pricing pages; they change often.
- **Maintenance** – forms change, APIs change, someone renames a sheet column. Budget a little time each month.

If the time saved is small and the process changes every few weeks, it may not be worth automating yet. That is a perfectly good answer to give a client – and it builds trust.

## Questions to ask the process owner

When you sit down with a founder or ops lead, these questions surface most of what you need:

```text
1. What event starts this process? How do you find out about it?
2. Where does the information live at each step (app, sheet, email, WhatsApp)?
3. Which step takes the longest? Which one gets forgotten?
4. When you decide something in this process, what rules do you follow?
5. What does a mistake look like, and how bad is it?
6. Who needs to know when it's done?
7. How many times a week does this happen?
```

Question 4 is gold. The answer becomes the instructions for your AI step later. If the owner says, "It depends... I just know," spend more time here; vague rules lead to vague AI output.

## Using AI to help you map

You can use any chat assistant to turn a rambling voice note into a clean map. Record the owner explaining their process, get a transcript, then use a prompt like:

```text
Below is a transcript of a business owner explaining a process.
Turn it into a table with columns: Step, Who does it, Input → Output,
Type (Trigger / Copy / Transform / Judgement / Write / Send / Wait).
List any unclear points as questions at the end.

Transcript:
[paste here]
```

Always check the result with the owner – the model may fill gaps with guesses.

## Try it yourself

Take the task you circled in the previous lesson (or pick a new one) and spend 15–20 minutes on this:

1. Create a sheet with the five columns: Step, Who/what, Input → Output, Type, Notes.
2. Map every step, including the boring "copy" steps and the "wait" steps people forget.
3. Mark each step as automate, AI step, human, or human approval.
4. Estimate minutes per occurrence and occurrences per month, and calculate time saved.
5. Write two or three qualitative benefits and one honest risk.

You now have a one-page brief you could show a client.

## Key takeaways

- Map the process before you open any tool; automating a messy process makes a faster mess.
- Label each step as Trigger, Copy, Transform, Judgement, Write, Send or Wait to find automation and AI opportunities.
- Good candidates are frequent, digital, rule-based and low-risk when wrong.
- Estimate time saved with a simple formula, list qualitative benefits, and be honest about build and running costs.
