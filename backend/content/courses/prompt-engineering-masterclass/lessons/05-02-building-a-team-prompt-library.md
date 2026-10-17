A single great prompt helps you. A well-organised library of tested prompts helps your entire team, and is one of the most convincing portfolio pieces you can show. In this lesson you'll assemble your 25-prompt professional library, the main course project.

## Why a library beats scattered prompts

In most teams, good prompts live in one person's chat history. When that person is on leave, quality drops. A shared library gives:

- **Consistency** — client emails, reports and posts follow the same standard.
- **Speed** — new joiners are productive on day one.
- **Improvement** — everyone's fixes flow back into one place.
- **Evidence** — you can show managers and interviewers exactly how you use AI.

## Choose a home

Start with what your team already uses: a Google Sheet, Notion database, Confluence page, SharePoint list or even a well-structured Google Doc. A spreadsheet or database works best because you can filter and sort. Some teams later move templates into custom assistants or internal tools, but the library remains the source of truth.

## The library entry format

Every prompt gets the same fields:

```text
ID: MKT-07
Name: Blog-to-social repurposer
Category: Marketing > Content
Use when: You have a published blog and need LinkedIn, Instagram and
WhatsApp versions.
Inputs needed: Blog text, target audience, one link
Prompt:
"""
[full template with [VARIABLES] and <tags>]
"""
Example input: (short, anonymised)
Example output: (short excerpt)
Tested: 8 cases, 7/8 pass (v3). Weakness: very technical blogs.
Tools tried: ChatGPT, Claude, Gemini — all fine
Owner: Ritu S.
Last updated: Oct 2026
Version notes: v3 added banned-words list
Safety notes: Don't paste unpublished client strategy.
```

The "Tested", "Owner" and "Last updated" fields are what make it professional. They tell a teammate whether to trust the prompt.

## Organising 25 prompts

Group prompts by job, not by technique. A common structure for a knowledge worker:

| Category | Suggested count | Examples |
|---|---|---|
| Communication | 5 | Leave request, client follow-up, difficult conversation, payment reminder, meeting invite |
| Writing and content | 5 | Style-matched post, blog outline, repurposer, proofreader, headline variations |
| Analysis and research | 5 | Decision summary, review themes, vendor comparison, grounded Q&A, assumption checker |
| Data and productivity | 5 | Extraction schema, notes-to-actions, checklist builder, formula helper, SQL helper |
| Thinking and quality | 5 | Critique-and-rewrite, role-switch review, red-team a plan, meeting report chain, prompt improver |

Adapt categories to your role. A teacher might have Lesson planning, Assessment, Parent communication, Differentiation and Admin. A sales professional might have Prospecting, Discovery, Proposals, Follow-up and CRM hygiene.

## A prompt that improves prompts

Every library should include a "meta-prompt" that helps teammates improve their own drafts:

```text
You are a prompt engineering reviewer. Improve the prompt below.

1. Identify what's missing: role, task, context, constraints, format,
   examples, handling of missing information.
2. Ask me up to 3 questions if critical information is missing.
3. Then produce an improved version using labelled sections, [VARIABLES]
   for anything that changes between uses, and <tags> for pasted content.
4. List 3 test inputs I should try it on, including one edge case.

<draft_prompt>
[PASTE PROMPT]
</draft_prompt>
```

## Naming and versioning

- Use short IDs by category: COM-01, WRI-04, ANA-02.
- Use a simple version number (v1, v2, v3) and a one-line change note.
- Don't overwrite silently. If a change makes things worse, you need to go back.
- Archive prompts nobody has used in months rather than deleting them.

## Quality gate for team prompts

Before a prompt enters the shared library, it should pass a short checklist:

```text
[ ] Clear name and "use when" line
[ ] All variables in [CAPITALS]; pasted content in <tags>
[ ] Defines what to do when information is missing
[ ] Tested on at least 5 inputs, results recorded
[ ] No confidential data inside the template itself
[ ] Owner assigned
```

## Rolling it out to a team

1. **Start small.** Ten excellent prompts beat a hundred untested ones.
2. **Demo, don't decree.** Show a before/after in a 15-minute team meeting.
3. **Collect feedback.** Add a "Suggestions" column or a channel for comments.
4. **Review monthly.** Update prompts when tools, policies or products change.
5. **Celebrate contributions.** Credit owners by name. People improve what they feel ownership of.

## Using it on your CV and LinkedIn

A library is concrete evidence of prompt engineering skill. Describe it honestly and specifically, for example: "Built and tested a 25-prompt library for marketing workflows (content, analysis, reporting), with documented test cases and version history." Share a sanitised sample of 3-5 entries if asked, never client data.

## Try it yourself (Project: 25-Prompt Professional Library)

This exercise spans several sessions; start with 20 minutes today.

1. Create a spreadsheet with the entry fields above as columns.
2. Add the prompts you've saved from earlier lessons (you should have 8-12).
3. Decide your five categories based on your role, and list the gaps.
4. Today, write and quick-test 3 new prompts to fill the biggest gaps.
5. Over the next week, complete all 25, each tested on at least 3 inputs, with your 5 most-used prompts tested on 5 or more.
6. Run your weakest prompt through the meta-prompt and log the improvement.

## Key takeaways

- A shared, tested prompt library gives teams consistency, speed and continuous improvement.
- Every entry needs a name, use-case, inputs, the template, test results, owner and date.
- Organise prompts by job category, not by technique.
- Version prompts, never overwrite silently, and gate new entries with a quality checklist.
- A sanitised library is strong, honest evidence of prompt engineering skill for your CV.
