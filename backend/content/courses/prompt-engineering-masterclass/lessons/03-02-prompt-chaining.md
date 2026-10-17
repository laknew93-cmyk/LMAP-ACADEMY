Big tasks done in one giant prompt tend to come out shallow. Prompt chaining breaks the work into steps, where each prompt's output becomes the next prompt's input. In this lesson you'll build a chain that turns raw meeting notes into a client-ready report, one of the four course projects.

## Why chain prompts?

A single prompt like "Turn these notes into a polished client report with action items, risks and a summary email" asks the model to understand, organise, analyse, write and format all at once. Chaining gives you:

- **Better quality** — each step gets the model's full attention.
- **Checkpoints** — you can review and correct between steps.
- **Reusability** — individual steps can be reused in other chains.
- **Easier debugging** — if the final report is wrong, you can see which step went wrong.

## The meeting-notes chain

Kavya is a consultant at a small Hyderabad firm advising a retail client. After each client meeting she has messy notes: half sentences, initials, numbers without context. Here is her four-step chain.

### Step 1: Clean and organise

```text
Below are raw notes from a client meeting. Rewrite them as clean, complete
sentences grouped under topic headings. Do not add any information that is
not in the notes. If something is unclear, keep it and mark it [UNCLEAR].
Expand abbreviations only if you are certain; list uncertain ones at the end.

Attendees key: KV = Kavya (us), RS = Rohit Shah (client COO),
AN = Anjali Nair (client Marketing Head).

<notes>
[PASTE RAW NOTES]
</notes>
```

**Checkpoint:** Kavya reads the output and fixes any [UNCLEAR] items from memory. This takes two minutes and prevents errors from flowing downstream.

### Step 2: Extract decisions, actions and risks

```text
From the organised notes below, extract three lists.

Return them in this exact format:

DECISIONS
| # | Decision | Made by |

ACTION ITEMS
| # | Action | Owner | Due date (or "Not set") |

RISKS / OPEN QUESTIONS
| # | Risk or question | Raised by | Suggested next step |

Use only what is in the notes. Do not invent owners or dates.

<organised_notes>
[PASTE STEP 1 OUTPUT, CORRECTED]
</organised_notes>
```

**Checkpoint:** Are owners and dates correct? Is anything missing?

### Step 3: Draft the client report

```text
You are a management consultant writing for a client's leadership team.
Using the organised notes and extracted lists below, write a client-ready
meeting report.

Structure:
1. Purpose of meeting (1-2 sentences)
2. Executive summary (max 5 bullets)
3. Key discussion points (short paragraphs under subheadings)
4. Decisions (table)
5. Action items (table)
6. Risks and open questions (table)
7. Next meeting / next steps

Style: clear, professional Indian business English, no jargon, no filler.
Max 600 words excluding tables. Use only the facts provided.

<organised_notes>
[STEP 1 OUTPUT]
</organised_notes>

<extracted_lists>
[STEP 2 OUTPUT]
</extracted_lists>
```

### Step 4: Review and cover email

```text
Review the report below as the client's COO, who is busy and detail-oriented.
1. List any statement that is vague, unsupported by the notes, or could
   embarrass us if wrong.
2. Suggest fixes.
3. Then write a 100-word cover email from Kavya to Rohit Shah sharing the
   report, highlighting the 2 most urgent action items.

<report>
[STEP 3 OUTPUT]
</report>

<organised_notes>
[STEP 1 OUTPUT]
</organised_notes>
```

The result: a professional report in roughly 15 minutes instead of an hour, with Kavya in control at each checkpoint.

## Designing your own chains

A useful pattern for most chains:

1. **Understand** — clean, summarise or extract from raw input.
2. **Analyse** — classify, compare, find patterns or gaps.
3. **Create** — draft the deliverable.
4. **Review** — critique against a rubric or a reader persona.
5. **Package** — final formatting, cover note, slide outline, social version.

Not every chain needs all five. A job seeker might chain: extract requirements from a job description → map her experience to each requirement → draft a tailored cover letter → review as the hiring manager.

## Practical tips

- **Pass outputs explicitly.** Paste the previous output inside tags rather than relying on "the above". In long chats, models can lose track.
- **Fresh chat or same chat?** Same chat is convenient for short chains. For long ones, a fresh chat per step with only the needed inputs keeps things clean.
- **Keep the original source available.** Later steps should be able to check against the raw facts, as in Step 4.
- **Save the chain as a set of templates.** Name them "Meeting Report 1/4", "2/4", and so on.
- **Automate later.** Once a chain is stable, tools like Zapier, Make or a short script can run it automatically, but only automate what you've tested manually.

## Try it yourself (Project: Meeting Notes to Client Report)

Spend 20 minutes.

1. Take real notes from a recent meeting, class or call (remove confidential names if needed), or write a realistic 200-word set of messy notes.
2. Run Steps 1-4 above, adapting the attendee key and report structure to your context.
3. At each checkpoint, write down one thing you corrected.
4. Compare the final report with what a single "turn these notes into a report" prompt produces.
5. Save all four prompts as a numbered set in your library. This chain is a portfolio project, so keep a sanitised before/after sample to show.

## Key takeaways

- Prompt chaining splits complex work into steps, each feeding the next.
- Checkpoints between steps let you catch errors before they spread.
- A common chain shape is understand, analyse, create, review, package.
- Pass outputs explicitly in tags and keep the original source available for review.
- Save stable chains as numbered templates; automate only after manual testing.
