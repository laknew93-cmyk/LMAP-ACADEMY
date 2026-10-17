AI assistants are impressive, but they make mistakes in very specific, predictable ways. Once you know these patterns, you can catch errors before they reach your boss, your client or your customer.

## The biggest risk: hallucinations

A **hallucination** is when an AI assistant states something false with complete confidence. It isn't lying on purpose — it's generating text that *sounds* right based on patterns, even when the facts are wrong.

Common examples professionals run into:

- A circular number, section of the Income Tax Act or court case that doesn't exist.
- A book, research paper or website link that looks real but isn't.
- A company's "head office address" that is slightly off.
- A quote attributed to a famous person who never said it.
- A wrong total when adding a long column of numbers.

Kavya, an HR executive in Hyderabad, asked an assistant to list the notice-period rules "under Indian labour law" for a policy document. The answer looked authoritative but mixed up rules from different state laws and company practice. She caught it because she checked with her company's legal advisor before circulating it. That check saved her a lot of embarrassment.

### Why hallucinations happen

Remember from the last lesson: the assistant predicts likely words. If it has seen many documents that say "As per Section ___ of the Act…", it may fill in a plausible section number even when it doesn't actually know the right one. The more specific and niche the fact, the higher the risk.

## Other limits you should know

### 1. Knowledge has a cut-off date

Each model is trained on data up to a certain point. Unless the assistant searches the web, it may not know about a new RBI rule, a recent budget announcement or last week's news. If something is time-sensitive, ask it to search, or check an official source yourself.

### 2. It can misread your intent

If you write "summarise this", it guesses how long and how detailed you want it. Vague prompts get generic answers. You'll fix this with better prompts in Lesson 1.4.

### 3. It agrees with you too easily

Ask "Isn't this a great plan?" and it will often find reasons to say yes. If you want honest feedback, ask for it directly: "List the three weakest points in this plan."

### 4. Maths and counting can slip

Assistants are much better at maths than they used to be, especially when they use a built-in calculation tool. Still, for invoices, GST calculations or salary figures, always verify in Excel, Google Sheets or a calculator.

### 5. It doesn't know your private context

It doesn't know your company's internal policies, your client's preferences or the decision taken in yesterday's meeting — unless you paste that information in.

### 6. Long documents can lose detail

When you upload a very long PDF, the assistant may miss or blur details in the middle. You'll learn techniques to handle this in Module 3.

## The traffic-light rule for trusting AI output

Use this simple system to decide how much checking a piece of AI output needs:

| Signal | Type of output | What to do |
|---|---|---|
| Green | Drafting, rewording, brainstorming, tone changes | Read it once, edit to taste, use it |
| Yellow | Summaries, explanations, general advice | Spot-check against the original source |
| Red | Numbers, laws, medical, financial, names, dates, citations | Verify every fact with an official or original source |

For example, "rewrite this email to sound more polite" is green. "Summarise this 30-page vendor contract" is yellow — check that key clauses match. "What is the current GST rate on restaurant services?" is red — confirm on an official government source or with your CA.

## Simple prompts that reduce errors

You can't eliminate hallucinations, but you can reduce them with how you ask:

```text
Answer only using the document I have pasted below. If the answer is not in the document, say "Not found in the document" instead of guessing.
```

```text
If you are not sure about any fact in your answer, clearly mark it as [UNSURE] so I can verify it.
```

```text
For each factual claim, tell me what kind of source I should check to confirm it (for example, an official government website, the company's annual report, or the original contract).
```

These work because they give the assistant permission to say "I don't know" — something it otherwise rarely volunteers.

## When not to use AI at all

There are situations where an AI assistant is the wrong tool, or should only be a starting point:

- Final legal, medical, tax or investment decisions — use a qualified professional.
- Anything involving confidential client data your company hasn't approved for AI tools (we cover this in Module 5).
- Emotionally sensitive conversations, like condolence messages to a close colleague, where your own words matter more than polish.
- Situations where you can't check the output and a mistake would be costly.

## Try it yourself

This 15-minute exercise will show you hallucinations first-hand, so you recognise them later.

1. Open your AI assistant and ask: `List 5 well-known books about time management by Indian authors, with the author name and year of publication.`
2. Pick two of the books from the answer. Search for them yourself on Google, Amazon India or a library catalogue. Are the title, author and year all correct?
3. Now ask the same question with this addition: `If you are not certain a book exists, say so clearly.` Compare the two answers.
4. Next, ask a question about your own field where you already know the answer (for example, a process at your workplace or a concept from your degree). Note whether anything is wrong or oversimplified.
5. Write one line in your notebook: "I must always verify ___ when using AI."

## Key takeaways

- Hallucinations are confident-sounding false statements; they are most likely with specific facts, numbers, laws and citations.
- Assistants may not know recent events unless they search the web, and they tend to agree with you.
- Use the traffic-light rule: green for drafting, yellow for summaries, red for facts that must be verified.
- Prompts that allow "I don't know" or ask the assistant to flag uncertainty reduce errors.
- You remain responsible for anything you send, sign or submit.
