"It looked good when I tried three questions" is how most GenAI demos are tested, and why most of them disappoint in production. Evaluation is what separates a GenAI engineer from someone who has watched tutorials. In this lesson you build a small test set and an automated evaluation script for your RAG app.

## Why evals matter

Every change you make (a new prompt, a chunk size, a different model, a lower effort setting) can improve some answers and quietly break others. Without a test set you are guessing. With one, you can say in a standup: "Chunk size 1,000 improved retrieval hit rate from 72% to 86% on our 50-question set, with no drop in correctness." That sentence gets people promoted.

## Step 1: build a test set

Start small: 20-50 questions is enough to catch most regressions. Store them in a JSON Lines file, one case per line:

```text
{"id": "q01", "question": "How many days of paternity leave?", "expected_source": "leave-policy.pdf", "expected_page": 4, "reference": "10 working days, within 3 months of birth."}
{"id": "q02", "question": "Can I carry forward unused casual leave?", "expected_source": "leave-policy.pdf", "expected_page": 3, "reference": "No, casual leave lapses at year end."}
{"id": "q03", "question": "What is the CEO's salary?", "expected_source": null, "expected_page": null, "reference": "NOT_IN_DOCS"}
```

Good test sets include:

| Type | Example | Why |
|---|---|---|
| Straightforward | "What are office hours?" | Baseline sanity |
| Paraphrased | "Do I get paid leave when my baby is born?" | Tests semantic retrieval |
| Multi-part | "Leave for marriage and for relocation?" | Needs several chunks |
| Not in docs | "What is the CEO's salary?" | Tests abstaining |
| Tricky wording | Questions using local terms or Hinglish | Tests real user language |

Write questions the way real users type them, typos included. The best source of test cases is real user questions from logs (with personal data removed) once your app is live.

## Step 2: measure retrieval

Retrieval can be checked without any LLM: did the expected page appear in the top-k chunks?

```python
import json

from retriever import retrieve


def load_cases(path: str) -> list[dict]:
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def retrieval_hit_rate(cases: list[dict], k: int = 5) -> float:
    answerable = [c for c in cases if c["expected_source"]]
    hits = 0
    for c in answerable:
        chunks = retrieve(c["question"], k=k)
        if any(ch["source"] == c["expected_source"] and ch["page"] == c["expected_page"]
               for ch in chunks):
            hits += 1
        else:
            print(f"MISS {c['id']}: {c['question']}")
    return hits / len(answerable) if answerable else 0.0


cases = load_cases("eval_cases.jsonl")
print(f"Hit rate @5: {retrieval_hit_rate(cases):.0%}")
```

This is fast and free to run, so run it on every chunking or embedding change. The `MISS` lines tell you exactly which questions to investigate.

## Step 3: grade answers with an LLM judge

Checking whether an answer is correct is harder: "10 working days" and "ten days, excluding weekends" are both right. A common technique is **LLM-as-judge**: a second model call compares the answer to your reference using a clear rubric and returns a structured verdict.

```python
import os
from typing import Literal

import anthropic
from pydantic import BaseModel

from rag import answer  # your answer() function from lesson 3.3

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()


class Verdict(BaseModel):
    reasoning: str
    grade: Literal["correct", "partially_correct", "incorrect"]


JUDGE_SYSTEM = """You grade answers from a company-policy assistant.
Compare the ANSWER with the REFERENCE. Judge facts only, not style.
- correct: all key facts in the reference are present and nothing contradicts it.
- partially_correct: some key facts present, none contradicted.
- incorrect: key facts missing or contradicted, or it answers when the
  reference is NOT_IN_DOCS, or it refuses when an answer exists."""


def judge(question: str, reference: str, model_answer: str) -> Verdict:
    response = client.messages.parse(
        model=MODEL,
        max_tokens=4000,
        output_config={"effort": "low"},
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content":
                   f"QUESTION: {question}\nREFERENCE: {reference}\nANSWER: {model_answer}"}],
        output_format=Verdict,
    )
    return response.parsed_output
```

Run every case through your pipeline and the judge:

```python
from collections import Counter

grades = Counter()
for c in cases:
    result, _ = answer(c["question"])
    text = " ".join(cl.text for cl in result.claims)
    if not result.answer_found:
        text = "I could not find this in the documents."
    v = judge(c["question"], c["reference"], text)
    grades[v.grade] += 1
    if v.grade != "correct":
        print(f"{c['id']} [{v.grade}] {v.reasoning}")

print(dict(grades), f"accuracy: {grades['correct'] / len(cases):.0%}")
```

Tips that make judges reliable:

- **Asking for reasoning before the grade** in the schema lets the judge think before deciding.
- **Use clear categories**, not 1-10 scores. Judges are inconsistent on fine numeric scales.
- **Spot-check the judge**: read 10-20 verdicts yourself. If you disagree often, fix the rubric before trusting the numbers.
- **Keep the judge fixed** while comparing versions of your app; change one thing at a time.

## Evaluating prompts and extraction

The same pattern works beyond RAG. For the invoice extractor, you do not even need a judge: store expected JSON for 15 invoices and compare field by field (exact match for GSTIN and invoice number, a ₹1 tolerance for amounts). Deterministic checks are cheaper and more trustworthy than LLM judges, so use them wherever the answer is exact.

| What you test | Best check |
|---|---|
| Extracted fields | Exact or tolerance comparison in code |
| Classification | Accuracy against labels |
| Retrieval | Hit rate of expected source/page |
| Free-text answers | LLM judge with rubric, plus human spot checks |
| Format rules ("under 150 words") | Code checks |

## Make it a habit

Save each run's results with the date and the setting you changed (a simple CSV is fine). Before merging any prompt change, run the evals. Teams that do this ship with confidence; teams that do not end up afraid to touch their prompts. Evals also cost money, since every case is a model call or two, so start small and use low effort for the judge.

## Try it yourself

About 20 minutes:

1. Write 15 test cases for the documents you ingested: 10 answerable (mix of direct and paraphrased) and 5 not in the documents.
2. Run the retrieval hit rate at k = 3 and k = 8 and note both numbers.
3. Run the full answer evaluation and read every non-correct verdict.
4. Make one change (chunk size, `k`, or a system prompt tweak), rerun, and record before and after in a small table.
5. Read five judge verdicts yourself and note whether you agree.

## Key takeaways

- Without a test set, every change is a guess; 20-50 well-chosen cases catch most regressions.
- Measure retrieval separately (hit rate) because it is cheap and causes most RAG failures.
- LLM-as-judge works with clear rubrics, categorical grades and reasoning-first schemas.
- Prefer deterministic code checks whenever the right answer is exact.
- Record results per change; this evidence is gold in interviews.
