You have the skills and the projects. This final lesson helps you convert them into offers: what GenAI roles in India look like, what interviewers actually ask, how to answer system design questions, and a practical plan for the next 30 days.

## The landscape of GenAI roles

Titles vary, but most openings fall into a few groups:

| Role type | Typical employers | What they emphasise |
|---|---|---|
| GenAI / AI engineer | Product startups, SaaS companies, GCCs (global capability centres) | Building LLM features end to end: RAG, agents, evals, deployment |
| GenAI developer / consultant | IT services firms' GenAI practices | Client POCs, integrating LLMs with enterprise systems, documentation |
| ML engineer (LLM focus) | Larger tech firms, AI-first startups | Deeper ML: fine-tuning, model serving, GPUs, evaluation at scale |
| Backend engineer with AI | Almost any product company | Solid APIs and data, plus ability to add LLM features safely |
| Data/analytics with GenAI | Analytics firms, BFSI, retail | LLMs over structured data, text-to-insights, reporting automation |

This course prepares you most directly for the first, second and fourth groups. Read job descriptions on Naukri and LinkedIn carefully: many "AI engineer" roles are mostly good backend engineering, so your Python, FastAPI, Docker and testing skills matter as much as your prompting.

## What interviews usually include

Formats differ by company, but expect some mix of:

1. **Resume and project deep-dive**: "Walk me through your RAG project. Why that chunk size? How did you evaluate it?"
2. **Concept questions**: tokens, context windows, embeddings, RAG versus fine-tuning, hallucinations.
3. **Coding**: plain Python and data structures, sometimes an LLM-flavoured task.
4. **System design**: design an LLM-powered feature end to end.
5. **Behavioural**: teamwork, handling ambiguity, a time something failed.

## Concept questions to prepare

Practise answering each in under two minutes, out loud. Use your own projects as examples.

```text
1. What is a token, and why does it affect cost and latency?
2. Explain embeddings and cosine similarity to a non-technical manager.
3. RAG vs fine-tuning: when would you choose each?
4. How do you reduce hallucinations in a document Q&A system?
5. How do you evaluate a RAG pipeline? Which metrics?
6. What is prompt injection? How would you defend a support bot against it?
7. Explain the tool-use loop. How do you stop an agent from looping forever?
8. How does prompt caching work, and what breaks it?
9. Structured output: how do you guarantee valid JSON?
10. When should you NOT use an agent?
11. How do you handle PII when calling a third-party LLM API?
12. What changes when you move from a prototype to production?
```

A strong answer pattern: **definition, why it matters, how you handled it in your project, one trade-off.** For example, on question 3: "RAG brings in fresh or private knowledge at query time; fine-tuning changes the model's behaviour or style. For our HR policy bot, policies change every quarter, so RAG was the right choice: updating means re-ingesting documents, not retraining. Fine-tuning would make sense for a consistent output format at very high volume, but we got that with structured output instead."

## Coding rounds

Practise implementing these from scratch, without looking at your notes:

- Cosine similarity and top-k search with NumPy.
- A text chunker with overlap.
- A function that calls an LLM and validates the output with Pydantic, with retry on validation failure.
- The tool-use loop with a step limit.
- A rate limiter (sliding window).
- Parsing a CSV and answering a question with pandas.

Keep general DSA skills warm too; many companies still run a standard coding round.

## System design: a worked approach

A common prompt: "Design a chatbot that answers customer questions from a bank's 2,000 policy documents." Structure your answer:

1. **Clarify requirements**: users (customers or staff?), languages (English, Hindi, regional?), latency target, volume per day, accuracy and compliance needs, what happens when unsure.
2. **High-level architecture**: ingestion pipeline (parse, chunk, embed, store with metadata), query pipeline (redact PII, retrieve with filters, generate with citations, validate), and UI.
3. **Key choices with trade-offs**: chunk size and overlap; vector store (pgvector if they already run Postgres); hybrid search for product codes; model and effort per route; caching the system prompt.
4. **Safety**: prompt-injection defences, PII redaction, no side-effecting tools without approval, refusal handling, audit logs.
5. **Evaluation**: a test set from real queries; retrieval hit rate; LLM-judge correctness with human spot checks; regression runs before every prompt change.
6. **Operations**: token and latency monitoring, spend alerts, rate limiting, document re-ingestion when policies change, fallbacks when the API is down.

Draw boxes and arrows as you talk. Structured thinking and trade-offs matter more than product names.

## Behavioural questions

Prepare three short stories using the **STAR** format (Situation, Task, Action, Result):

- A time your model or app gave wrong results and how you found and fixed it (your evaluation work is perfect here).
- A time you chose a simpler solution over a fashionable one (for example, a workflow instead of an agent).
- A time you explained a technical idea to a non-technical person.

Be honest about what you did yourself versus what a team or tutorial did; interviewers probe.

## Your 30-day plan

| Week | Focus |
|---|---|
| 1 | Polish flagship project, README, demo video; update resume and LinkedIn |
| 2 | Practise the 12 concept questions aloud; record yourself once |
| 3 | Coding drills from the list above; two mock system design sessions with a friend |
| 4 | Apply steadily to roles matching your profile; tailor your resume to each description; follow up politely |

Tailored applications that link your live demo usually beat mass-applying. Ask alumni and LinkedIn connections in GenAI teams for referrals, and share your project, not just your resume.

## Try it yourself

About 20 minutes:

1. Pick three concept questions and write a four-part answer (definition, why it matters, your project, one trade-off) for each.
2. Time yourself answering one aloud; aim for under two minutes.
3. Sketch the bank chatbot system design on paper using the six-step structure.
4. Write one STAR story about a bug or quality issue you fixed during this course.
5. Find three real job descriptions on Naukri or LinkedIn and highlight which of your projects matches each requirement.

## Key takeaways

- Many GenAI roles are mostly solid backend engineering plus LLM-specific skills.
- Answer concept questions with definition, importance, your project and a trade-off.
- Practise core implementations (similarity search, chunking, tool loop) from memory.
- Use a clear structure for system design: requirements, architecture, trade-offs, safety, evaluation, operations.
- Honest, specific evidence ("17 of 20 test questions correct") beats vague claims and buzzword lists.
