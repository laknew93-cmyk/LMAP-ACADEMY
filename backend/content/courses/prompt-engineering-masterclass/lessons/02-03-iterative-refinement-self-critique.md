Experts rarely get the perfect answer in one shot. They get a good first draft, then refine it quickly. This lesson teaches you a structured way to iterate, and how to make the model critique its own work.

## The first answer is a draft

Treat every first response as version 1. The question is not "is this perfect?" but "what is the single most important thing to improve?" Fix that, then the next thing. Three focused rounds usually beat one enormous prompt.

## Specific feedback beats "make it better"

Vague follow-ups get vague changes.

Weak:

```text
Make it better.
```

Strong:

```text
Good start. Three changes:
1. The opening is generic — start with the customer's problem
   (late GST filings) instead of our company history.
2. Cut the length by about a third; it should fit on one phone screen.
3. Replace "leverage synergies" and "cutting-edge" with plain words.
Keep everything else the same.
```

Notice "keep everything else the same." Without it, models often rewrite parts you were happy with.

## A simple refinement loop

1. **Generate** — run your prompt.
2. **Diagnose** — what's wrong? Content, structure, tone, length, accuracy?
3. **Instruct** — give 1-3 specific changes.
4. **Compare** — is version 2 actually better? If not, go back.
5. **Promote** — when you find an instruction that fixed something, add it to the original prompt or template so you don't need the fix next time.

Step 5 is what separates professionals from casual users. Each conversation should improve your template.

## Self-critique prompts

You can ask the model to review its own output against criteria before you see the final version.

### Critique, then rewrite

```text
Write a 150-word cold email to the HR head of a mid-size Coimbatore textile
company, offering our payroll outsourcing service.

Then critique your draft against these criteria, scoring each 1-5:
- Relevance to a textile manufacturer's payroll pain points
- Clarity of the single call to action
- Tone: respectful, not pushy
- Length within 150 words

Finally, write an improved version that fixes every criterion scoring below 4.
Show: Draft, Critique table, Final version.
```

The criteria matter. A model asked to "critique" without criteria tends to give polite, shallow feedback. Give it a rubric and it gives targeted feedback.

### Role-switch review

Ask the model to review as a specific reader:

```text
Now read the proposal above as a sceptical CFO of a ₹50 crore manufacturing
company. List the 5 questions or objections she would raise. Then revise the
proposal to answer the top 3 without making it longer than 400 words.
```

This works brilliantly for pitches, cover letters, lesson plans, and anything with a demanding audience.

### Red-team your own plan

```text
Here is my plan to launch a weekend tiffin service in Lucknow.
Act as an experienced food entrepreneur. Identify the 5 most likely reasons
this plan fails in the first 3 months, ranked by likelihood. For each, suggest
one cheap way to test or reduce the risk.

<plan>
...
</plan>
```

## Comparing versions

Ask for options, then let the model (and you) judge:

```text
Write 3 different opening lines for this LinkedIn post: one story-based,
one with a surprising observation, one with a direct question.
Then tell me which you'd pick for an audience of HR professionals and why.
```

Make the final decision yourself. The model's pick is a useful opinion, not a verdict.

## Limits of self-critique

Self-critique improves style, structure and completeness reliably. It is weaker at catching factual errors, because the model checking the facts is the same one that produced them. For facts and numbers, use grounding in source documents and your own verification, which you'll learn in the next module.

Also watch for **over-editing**. After four or five rounds, text can become bland or bloated. If version 5 is worse than version 3, go back to version 3. Copy good versions into a document as you go so you can.

## When to start a fresh chat

Long conversations accumulate clutter: abandoned ideas, contradictory instructions. If the model keeps reverting to something you rejected, start a new chat and paste in a clean, updated prompt that includes everything you learned. This is often faster than arguing with a confused thread.

## Try it yourself

Spend 15-20 minutes.

1. Choose a piece of writing that matters: a cover letter, a client proposal intro, a notice to parents, a sales email.
2. Generate version 1 with a solid prompt.
3. Write a 4-criterion rubric for this task and run the "critique, then rewrite" pattern.
4. Do one role-switch review as the toughest real reader.
5. Pick the best version and identify which instruction made the biggest improvement.
6. Add that instruction to your original prompt and save it in your library.

## Key takeaways

- Treat the first answer as a draft and refine in short, focused rounds.
- Give 1-3 specific changes and say "keep everything else the same".
- Self-critique works best with an explicit rubric or a specific reviewer role.
- Self-critique improves style and structure but is not a reliable fact-checker.
- Promote every successful fix back into your template so it sticks.
