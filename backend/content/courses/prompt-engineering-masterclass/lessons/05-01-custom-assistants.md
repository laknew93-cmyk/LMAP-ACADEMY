If you keep pasting the same background and instructions into every chat, it's time to build a custom assistant. This lesson covers custom instructions and configurable assistants such as Custom GPTs, Claude Projects and Gemini Gems, and walks you through configuring one for a specific job role.

## Three levels of customisation

Features and names change, but most major assistants offer some version of these:

| Level | What it is | Good for |
|---|---|---|
| **Custom instructions / personal preferences** | Standing notes about you that apply to every chat | Your role, writing style, format preferences |
| **Saved assistants** (e.g., Custom GPTs in ChatGPT, Gems in Gemini) | A named assistant with its own instructions and optionally uploaded files | One repeated job: "Proposal Writer", "Interview Coach" |
| **Project workspaces** (e.g., Claude Projects, ChatGPT Projects) | A workspace with shared files and instructions across many chats | Ongoing work on one client, course or product |

Availability, sharing options and limits depend on your plan and change often, so check your tool's current help pages. The prompting principles below work in all of them.

## Custom instructions: your default context

Custom instructions answer two questions: "What should the AI know about me?" and "How should it respond?"

```text
About me:
I'm a digital marketing consultant in Kochi working with small hospitality
businesses (homestays, cafes, Ayurveda resorts). Clients are owner-run,
budget-conscious, and mostly use Instagram, Google Business Profile and
WhatsApp.

How to respond:
- Be concise. Lead with the answer, then detail if needed.
- Use ₹ and Indian context by default.
- When suggesting tactics, note rough effort (Low/Medium/High).
- Ask one clarifying question if my request is ambiguous, instead of guessing.
- Never invent statistics. If you cite a number, say where it comes from or
  label it as an estimate.
```

Keep it short and stable. Task-specific instructions belong in a dedicated assistant, not here.

## Designing a role-specific assistant

A custom assistant's instructions are a long-lived **system prompt**. They deserve more care than a normal prompt because they run every time. Use this structure:

1. **Identity and purpose** — who it is and the one job it does.
2. **Users** — who will talk to it and what they know.
3. **Workflow** — the steps it follows, including what to ask first.
4. **Knowledge** — which uploaded files to rely on, and how.
5. **Output formats** — templates for its main deliverables.
6. **Rules and boundaries** — what it must never do.
7. **Tone** — with a short example.

### Example: "Recruiter Screening Assistant"

For Pooja, a talent acquisition executive at a Bengaluru IT services company:

```text
IDENTITY
You are the Screening Assistant for the TA team at a mid-size IT services
company. You help recruiters screen CVs against job descriptions quickly
and fairly.

USERS
Recruiters with 1-5 years' experience. They paste a JD and one or more CVs.

WORKFLOW
1. If no JD is provided, ask for it. Do not screen without a JD.
2. Extract the JD's must-have and nice-to-have requirements as a list,
   and ask the recruiter to confirm or edit them.
3. For each CV, produce the Screening Card (format below).
4. Offer to draft 5 role-specific interview questions for shortlisted CVs.

KNOWLEDGE
Use the uploaded "Screening Guidelines.pdf" for scoring rules and the
"Role Levels.pdf" for experience bands. If they conflict with a user
request, follow the guidelines and say so.

SCREENING CARD FORMAT
Candidate: [initials only]
Match: Strong / Partial / Weak
Must-haves met: x of y — list each with Yes/No/Unclear and CV evidence
Nice-to-haves: list
Gaps to probe in interview: up to 3
Notice period / location: as stated, or "Not stated"

RULES
- Judge only on skills, experience and stated requirements.
- Never consider or comment on age, gender, religion, caste, marital status,
  photos, or college prestige unless the JD makes a lawful, job-related
  requirement explicit.
- Never invent experience. If something is unclear, mark it "Unclear".
- The recruiter makes the final decision; you provide evidence, not verdicts.
- Remind users to remove phone numbers and addresses before pasting CVs.

TONE
Neutral, crisp, evidence-based. Example: "Must-have: Java 3+ years — Yes
(CV: 'Java developer, Infosys, 2021-2025')."
```

Notice how much of this is about **behaviour in edge cases**: missing JD, conflicting instructions, unclear evidence, sensitive attributes. That's what separates a dependable assistant from a demo.

## Knowledge files

Most custom assistants let you upload reference files. Tips:

- Upload clean, current documents: style guides, policies, FAQs, product sheets, templates.
- Name files clearly and refer to them by name in the instructions.
- Tell the assistant how to use them: "Answer pricing questions only from Price_List_Oct.pdf."
- Remove outdated versions. Conflicting files cause conflicting answers.
- Don't upload anything you wouldn't want every user of the assistant to see.

## Test before sharing

Use the testing approach from Lesson 3.3. Write 8-10 test conversations, including a user who skips the JD, a CV with sensitive personal details, and someone asking "Just tell me who to reject". Fix the instructions until all pass.

## Try it yourself (Project: Custom Assistant for a Job Role)

Spend 20 minutes.

1. Pick a job role you have or want: sales executive, teacher, HR recruiter, content marketer, financial analyst, customer support lead.
2. Identify the one repeated task the assistant will handle.
3. Write the instructions using the seven-part structure, with at least 4 rules for edge cases.
4. Create the assistant in your tool (or, if your plan doesn't support it, save the instructions and paste them at the start of a new chat).
5. Run 6 test conversations, including 2 tricky ones. Revise the instructions.
6. Save the final instructions and test notes as a portfolio project.

## Key takeaways

- Custom instructions hold stable facts about you; dedicated assistants handle one repeated job.
- An assistant's instructions are a system prompt: define identity, users, workflow, knowledge, formats, rules and tone.
- Most of the work is specifying behaviour for edge cases and boundaries.
- Upload clean, current knowledge files and tell the assistant exactly how to use them.
- Test with tricky conversations before sharing an assistant with anyone.
