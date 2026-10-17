Great prompts are not long for the sake of it; they contain the right ingredients. In this lesson you will learn the six building blocks that professional prompts share, and a simple checklist you can run in under a minute.

## The six building blocks

Think of a prompt as a brief with six optional parts. You will not always need all six, but knowing them means you never forget the one that matters.

| Block | Question it answers | Example |
|---|---|---|
| **Role** | Who should the AI act as? | "You are a senior GST consultant" |
| **Task** | What exactly should it do? | "Draft a reply to this client query" |
| **Context** | What background does it need? | "Client is a small Jaipur textile exporter" |
| **Constraints** | What are the rules and limits? | "Under 150 words, no legal jargon" |
| **Format** | What should the output look like? | "Three bullet points, then a one-line next step" |
| **Examples** | What does good look like? | "Here is a reply we liked last month: ..." |

### Role

A role sets vocabulary, depth and perspective. "Explain inflation" produces something different from "You are an economics teacher for Class 10 CBSE students. Explain inflation." Roles work best when they are specific. "You are an expert" adds little; "You are a recruiter who screens 200 fresher CVs a week for IT services firms" adds a lot.

### Task

Use a clear action verb: draft, summarise, compare, classify, rewrite, extract, critique, plan. One prompt, one main task. If you find yourself writing "and also" three times, consider splitting it (you will learn chaining in Module 3).

### Context

Context is usually the biggest missing piece. Who is the audience? What happened before? What is the goal behind the task? The model cannot see your inbox, your company or your history unless you tell it.

### Constraints

Constraints narrow the space of acceptable answers: length, tone, reading level, words to avoid, things that must be included, deadlines, budget. Phrase them positively where you can ("use short sentences") rather than only negatively ("don't be wordy").

### Format

Tell the model the shape of the answer: a table with named columns, numbered steps, an email with a subject line, a 3-slide outline. This alone saves most people ten minutes of reformatting per task.

### Examples

Showing one sample of the output you want is often more powerful than three paragraphs describing it. The next lesson is entirely about this.

## Before and after

Rahul is a business analyst at a Bengaluru fintech. His first attempt:

```text
Summarise this report.
[pastes 12-page report]
```

His rebuilt prompt:

```text
Role: You are a business analyst preparing a briefing for our CFO.

Task: Summarise the attached quarterly report on UPI merchant payments.

Context: The CFO has 3 minutes before a board meeting. She cares most about
revenue impact, risks, and anything that needs a decision this month.

Constraints:
- Use only information in the report; if something is unclear, say so.
- No more than 180 words.
- Plain English, no unexplained acronyms.

Format:
1. One-sentence headline
2. "Key numbers" — up to 4 bullets
3. "Risks" — up to 3 bullets
4. "Decisions needed" — numbered list, or "None" if none

Report:
"""
[pastes report]
"""
```

The second prompt takes 90 seconds longer to write and saves 20 minutes of editing. That trade is the heart of prompt engineering.

## Order and emphasis

Models handle long prompts well, but a few habits help:

- **Put instructions before long content** and, for very long documents, briefly repeat the key instruction at the end ("Remember: under 180 words, CFO audience").
- **Use headings or labels** like "Task:", "Context:" so both you and the model can see the structure.
- **Be explicit about priorities.** If accuracy matters more than length, say so.

## The 60-second checklist

Before you press Enter on any important prompt, scan it:

```text
[ ] Role — is a specific perspective useful here?
[ ] Task — one clear verb, one main job?
[ ] Context — audience, purpose, background?
[ ] Constraints — length, tone, must/must-not?
[ ] Format — exact shape of the output?
[ ] Examples — would one sample remove guesswork?
```

You will not tick every box every time. A quick factual question needs only a task. But for anything you will send to a client, a boss or a student, run the checklist.

## A reusable skeleton

Copy this into your notes. You will reuse it constantly:

```text
You are [specific role].

Task: [action verb + deliverable].

Context:
- Audience: [who will read/use it]
- Purpose: [what it should achieve]
- Background: [relevant facts]

Constraints:
- [length]
- [tone / reading level]
- [must include / must avoid]

Format: [exact structure]

[Optional] Example of the style I want:
"""
[example]
"""
```

## Try it yourself

Take 15-20 minutes.

1. Choose a task you do often: a weekly status email, a product description for a Meesho listing, a parent-teacher note, a cover letter for a Naukri application.
2. Fill in the reusable skeleton above for that task. Write at least two bullets under Context and Constraints.
3. Run it in your preferred assistant.
4. Now delete one block at a time (first Role, then Context, then Format) and rerun. Note in your Prompt Journal which deletion hurt the output most.
5. Save the full version as the first entry in your future prompt library.

## Key takeaways

- Strong prompts combine six blocks: role, task, context, constraints, format and examples.
- Context is the most commonly missing block and usually the biggest improvement.
- Specific roles and explicit formats save far more time than they cost to write.
- Label sections and put instructions before long pasted content.
- Use the 60-second checklist for any output that will reach another person.
