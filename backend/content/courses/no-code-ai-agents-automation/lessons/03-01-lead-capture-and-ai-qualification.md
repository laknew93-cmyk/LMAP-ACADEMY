This lesson starts Project 1: a complete lead-qualification automation. Here we design the flow and build the first half – capturing leads and having AI score them against clear criteria. The next lesson adds the CRM and follow-up.

## The business scenario

Kavya runs a digital marketing agency in Indore. Leads come in from her website form and a Meta lead ad. Today, her team reads each lead the next morning and decides who to call. Hot leads go cold overnight, and junior staff spend time calling students asking about internships.

The goal: **every lead is scored within a minute, hot leads trigger an instant alert and message, and everything lands in one sheet or CRM.**

## The full flow

```text
1. Trigger: new lead (website form webhook or lead-ad connector)
2. Validate: required fields present, phone cleaned
3. Deduplicate: has this phone/email been seen before?
4. AI qualify: score + category + reason, as JSON
5. Parse & check AI output
6. Save: row in Google Sheet / CRM record     ← next lesson
7. Route by score: hot / warm / cold          ← next lesson
8. Follow-up: WhatsApp/email, alerts           ← next lesson
9. Error handling: review sheet + notification
```

## Step 1: Capture leads from more than one source

If you have two sources, you have two options:

- **Two small workflows** (one per source) that both send their data to a shared third workflow via a webhook. Good when sources differ a lot.
- **One workflow per source** that each do everything. Simpler, but changes must be made twice.

For beginners, start with one source. Once it works, add the second by building a tiny workflow that reformats its data into the same shape and passes it on. A consistent internal format is worth agreeing early:

```json
{
  "source": "website",
  "name": "",
  "phone": "",
  "email": "",
  "company": "",
  "message": "",
  "received_at": ""
}
```

## Step 2 and 3: Validate and deduplicate

Reuse your validation from Module 2. Then add a **search step** in your sheet or CRM: look for an existing row with the same phone or email. If found, update that row's "Last enquiry" date and append the new message instead of creating a duplicate. People often submit the same form twice, and duplicates make the team look disorganised when two people call the same lead.

## Step 4: Define what "qualified" means

The AI can only qualify leads as well as you define qualification. Sit with Kavya and write down her actual criteria. A simple version of a widely used framework works well: **budget, need, timeline, fit**.

```text
You qualify leads for Kavya Digital, a marketing agency in Indore
that serves small and medium businesses in Madhya Pradesh and nearby.

Our ideal client:
- A business (not a student or job seeker)
- Needs social media, Google Ads or SEO services
- Monthly marketing budget of ₹25,000 or more, or a clear growth goal
- Wants to start within 2 months

Score the lead from 0 to 100 and assign a category:
- HOT (70-100): clear business need, budget likely fits, starting soon
- WARM (40-69): real business but unclear budget or timeline
- COLD (0-39): poor fit, very small budget, or far future
- NOT_A_LEAD: job/internship seekers, vendors selling to us, spam

Return ONLY valid JSON:
{
  "score": number,
  "category": "HOT" | "WARM" | "COLD" | "NOT_A_LEAD",
  "reason": "one sentence, max 20 words",
  "business_type": "short phrase or unknown",
  "suggested_next_step": "one short sentence for the sales team"
}

Do not invent facts. If budget is not mentioned, say so in the reason.

Lead:
Name: {{name}}
Company: {{company}}
Message: {{message}}
Source: {{source}}
```

A few design choices worth noticing:

- The **ideal client** section is specific to the business. This is the part that makes the AI useful instead of generic.
- **NOT_A_LEAD** is a separate category, so internship requests don't pollute your conversion numbers.
- **reason** and **suggested_next_step** help humans trust and act on the score. A score with no reason is hard to trust.

## Step 5: Parse and check

After the AI step:

1. Parse the JSON into fields.
2. Add a filter or If step: is `category` one of the four allowed values and is `score` a number between 0 and 100?
3. If not, set category to "REVIEW" and continue – the lead still gets saved; a human just decides manually.

Never let a broken AI response cause a lead to disappear. Losing a lead is worse than not scoring it.

## Calibrating the scorer

Before switching it on for real, test against history:

1. Take 20–30 past leads where you know the outcome (became a client, didn't respond, was junk).
2. Run them through the workflow manually, or paste them into the AI step's test panel.
3. Compare AI categories with what actually happened.
4. Where it disagrees, ask why. Usually the criteria are missing something, e.g. "Leads from Bhopal are fine too" or "Restaurants are a great fit for us."
5. Update the prompt and re-test.

Keep a small "test set" of these examples in a sheet. Whenever you change the prompt later, re-run the test set to make sure you didn't break anything.

## Try it yourself

Build the first half of Project 1 (about 20 minutes):

1. Write a qualification prompt for a real or imagined business – your own freelance service is perfect. Include an ideal-client section and the four categories.
2. Add it as the AI step in your lead workflow, after validation.
3. Add a deduplication search on phone number.
4. Parse the JSON and add an output check that sets "REVIEW" on bad output.
5. Create a test set of 10 enquiries: 3 that should be HOT, 3 WARM, 2 COLD and 2 NOT_A_LEAD. Run them all and record whether the AI agreed with you.

## Key takeaways

- Design the whole lead flow first: capture, validate, deduplicate, qualify, save, route, follow up.
- Qualification quality depends on writing the business's real ideal-client criteria into the prompt.
- Ask for a score, a category, a reason and a next step, in JSON.
- Never let a bad AI response lose a lead – fall back to a REVIEW status.
- Calibrate against past leads and keep a test set for future prompt changes.
