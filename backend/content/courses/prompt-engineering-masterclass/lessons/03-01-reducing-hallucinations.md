AI models sometimes state things that are simply false, with complete confidence. This is called hallucination. You can't eliminate it entirely, but the right prompting habits reduce it sharply and make the remaining errors easier to catch.

## Why models hallucinate

A model generates text that *sounds* right based on patterns. It doesn't look facts up unless it's connected to search or documents, and it has no built-in sense of "I'm not sure". If you ask for a court judgment citation, a statistic or a quote, it may produce something plausible-looking that doesn't exist. Hallucinations are most common with:

- Specific numbers, dates and statistics
- Citations, case laws, research papers and URLs
- Niche or local facts (a small company, a recent rule change)
- Recent events beyond the model's training data
- Questions with a false assumption built in ("Why did RBI ban UPI in 2025?")

## Technique 1: Ground the model in your text

The most powerful fix is to give the model the source and tell it to use *only* that source.

Before:

```text
What is the notice period in our company's leave policy?
```

The model has never seen your policy. It will guess something typical.

After:

```text
Answer the question using ONLY the policy text inside <policy> tags.
If the answer is not in the policy, reply exactly:
"Not specified in the policy."
Quote the sentence your answer is based on.

<policy>
[PASTE HR POLICY]
</policy>

Question: What is the notice period for employees on probation?
```

This prompt does three things: restricts the source, gives a defined way to say "I don't know", and requires a supporting quote you can check in seconds.

Most chat assistants let you upload PDFs and documents. The same principle applies: tell the model to answer from the uploaded file only, and to cite the page or section.

## Technique 2: Give permission to say "I don't know"

Models are trained to be helpful, which can push them to answer even when they shouldn't. Explicitly allowing uncertainty helps:

```text
If you are not confident about any fact, say "I'm not sure" rather than
guessing. It is better to leave a gap than to give a wrong answer.
```

You can go further and ask for confidence labels:

```text
After each claim, add (High), (Medium) or (Low) confidence.
For anything Medium or Low, tell me what source I should check.
```

Confidence labels aren't precise measurements, but they reliably point you towards the claims that need checking.

## Technique 3: Ask for sources carefully

"Give me sources" can backfire: a model without search access may invent realistic-looking references. Handle it like this:

- If your tool has **web search or browsing**, ask it to search and link sources, then click the links yourself.
- If it doesn't, ask: "Which types of official sources would confirm this?" (e.g., the CBIC website for GST, the RBI website for banking rules) rather than asking for specific URLs.
- Never paste a citation into a report, assignment or legal document without opening it.

## Technique 4: Challenge false assumptions

Build a check into the prompt:

```text
Before answering, check whether my question contains any incorrect
assumptions. If it does, point them out first.

Question: Since freelancers in India don't need to file income tax below
₹10 lakh, how should I invest my savings?
```

A good response will flag that the premise is wrong before going further.

## Technique 5: Separate facts from generation

When writing content that includes facts, split the job:

1. Gather facts yourself (or from a grounded prompt using your documents).
2. Paste the verified facts into a writing prompt with: "Use only these facts. Do not add any numbers, names or claims not listed."

This is how careful marketers and analysts work: the creativity happens in the wording, never in the facts.

## Technique 6: Verify with a second pass

After a factual answer, ask:

```text
List every factual claim in your previous answer as a numbered list.
For each, state whether it came from the provided document (quote it)
or from your general knowledge.
```

Claims from "general knowledge" are the ones to check. This takes a minute and catches many problems.

## A grounding template for your library

```text
TEMPLATE: Grounded Q&A
You are a careful research assistant.
Answer the question using only the content in <source>.
Rules:
- Quote the exact supporting text for each point.
- If the source doesn't contain the answer, say "Not found in source."
- Do not use outside knowledge, even if you think you know the answer.
- If the question is ambiguous, list the possible interpretations.

<source>
[PASTE DOCUMENT]
</source>

Question: [QUESTION]
```

## Know where the risk is highest

For legal, medical, tax and financial matters, AI output should be a starting point for a qualified professional, not a final answer. A Chennai CA firm might use AI to draft a client explanation of a notice, but the CA still checks every section number and date before it goes out.

## Try it yourself

Spend 15-20 minutes.

1. Take a real document you know well: your company's leave policy, a rental agreement, a product manual, a syllabus.
2. Write five questions: three answerable from the document, two that are not.
3. Ask all five with no document. Note any confident wrong answers.
4. Ask again using the Grounded Q&A template with the document pasted in.
5. Check: did it quote correctly? Did it say "Not found in source" for the two unanswerable questions?
6. Save the template with any tweaks to your library.

## Key takeaways

- Hallucinations are most likely with numbers, citations, niche facts and recent events.
- Grounding the model in provided text, with a quote requirement, is the strongest fix.
- Explicitly allow "I don't know" and define the exact wording for it.
- Never trust a citation or URL you haven't opened yourself.
- Keep facts and creative wording separate, and verify high-stakes output with a professional.
