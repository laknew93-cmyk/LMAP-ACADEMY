Most business value from LLMs comes not from chat but from turning messy text into clean data your code can use: a lead from an email, fields from a resume, line items from an invoice. In this lesson you learn to get reliable JSON out of a model and validate it with Pydantic.

## Why "just ask for JSON" is not enough

Beginners write prompts like "Return the answer as JSON." It works most of the time, and then in production it does not: the model adds a friendly sentence before the JSON, uses `"amount": "₹1,200"` instead of a number, or forgets a field. Your `json.loads` crashes at 2 a.m.

The robust approach has two layers:

1. **Constrain the output** to a schema so the model can only produce valid JSON of the right shape.
2. **Validate the result** in your own code with Pydantic, and apply business rules the schema cannot express.

## Pydantic in two minutes

Pydantic lets you describe data as Python classes with type hints. It validates and converts incoming data, and it can generate a JSON Schema from your class.

```bash
pip install pydantic
```

```python
from typing import Literal
from pydantic import BaseModel, Field


class Lead(BaseModel):
    name: str = Field(description="Full name of the person")
    phone: str | None = Field(description="Indian mobile number, digits only, or null")
    city: str | None
    course_interest: Literal["data-science", "web-dev", "genai", "other"]
    budget_inr: int | None = Field(description="Budget in rupees as an integer, or null")
    wants_callback: bool
```

Key ideas:

- `str | None` means the field may be `null`. Use this whenever information might be missing, so the model is not pushed to invent a value.
- `Literal[...]` restricts a field to fixed choices, which is perfect for categories.
- `Field(description=...)` becomes part of the schema and acts as a mini-instruction to the model.

## Structured output with the SDK

The Anthropic SDK has a `messages.parse()` helper that converts your Pydantic class to a schema, constrains the model's output to it, and returns a validated object:

```python
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

enquiry = """Hi, this is Rohan Deshmukh from Nagpur. I saw your GenAI course ad on
Instagram. My budget is around 8k. Can someone call me on 98220 12345 after 6pm?"""

response = client.messages.parse(
    model=MODEL,
    max_tokens=4000,
    output_config={"effort": "low"},
    system="Extract lead details from enquiries for an edtech company. "
           "Use null for anything not stated. Do not guess.",
    messages=[{"role": "user", "content": enquiry}],
    output_format=Lead,
)

lead = response.parsed_output  # a Lead instance, already validated
print(lead.name, lead.city, lead.budget_inr, lead.course_interest)
print(lead.model_dump_json(indent=2))
```

What is happening:

- `output_format=Lead` tells the SDK to send `Lead`'s JSON Schema as the required output format.
- The model's output is constrained to match that schema, so you get valid JSON with the right field names and types.
- `response.parsed_output` is a real `Lead` object. Your editor autocompletes `lead.budget_inr`, and the type is an `int` or `None`, not a string.
- `effort: "low"` keeps extraction fast and cheap; this is not a hard reasoning task.
- The instruction "use null, do not guess" plus nullable fields is your main defence against made-up data.

If you prefer to work with raw JSON Schema (for example, when the schema comes from a config file), use `output_config={"format": {"type": "json_schema", "schema": {...}}}` with `messages.create()` and `json.loads` the text block. The Pydantic route is easier to maintain.

## Business validation: the second layer

A schema guarantees shape, not truth. "8k" might come back as `8000`, which is right, or the phone might include a country code you do not want. Add your own checks after parsing:

```python
import re


def validate_lead(lead: Lead) -> list[str]:
    """Return a list of problems. Empty list means the lead is usable."""
    problems = []
    if lead.phone:
        digits = re.sub(r"\D", "", lead.phone)
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        if not re.fullmatch(r"[6-9]\d{9}", digits):
            problems.append(f"Phone looks invalid: {lead.phone}")
    if lead.budget_inr is not None and not 500 <= lead.budget_inr <= 500000:
        problems.append(f"Budget out of expected range: {lead.budget_inr}")
    if not lead.phone and lead.wants_callback:
        problems.append("Callback requested but no phone number found")
    return problems


issues = validate_lead(lead)
print("OK" if not issues else issues)
```

In a real pipeline, leads with problems go to a human review queue instead of straight into the CRM. That pattern, **auto-accept clean records and route doubtful ones to a person**, is how most successful extraction systems work in Indian back offices today.

## Designing good extraction schemas

| Tip | Why |
|---|---|
| Make uncertain fields nullable | Prevents the model from inventing values to fill a required field |
| Use enums (`Literal`) for categories | Downstream code can `match` on them safely |
| Use numbers for amounts, ISO strings for dates | No parsing "₹1,200" or "3rd March" later |
| Add short field descriptions | Clarifies units and formats ("rupees, integer") |
| Keep nesting shallow at first | Easier to debug; add nested models (like line items) once basics work |
| Add a `confidence` or `notes` field if useful | Lets the model flag ambiguity for human review |

## Handling failures

Even with constrained output, things can go wrong: the request is refused, or it hits `max_tokens` before the JSON is complete. Check before trusting the result:

```python
if response.stop_reason != "end_turn" or response.parsed_output is None:
    raise ValueError(f"Extraction incomplete: stop_reason={response.stop_reason}")
```

Log the input (minus any sensitive data) whenever this happens. Those cases become test examples later.

## Other providers

OpenAI and Gemini also offer schema-constrained JSON output, and open-source models served via Ollama support a JSON format option. The Pydantic validation layer works identically with all of them, which is one reason to keep it in your code rather than trusting any single provider.

## Try it yourself

About 20 minutes:

1. Run the lead extractor on the sample enquiry.
2. Write three more enquiries yourself: one in Hinglish ("Mera naam Sneha hai, Indore se..."), one with no phone number, and one asking about a course you do not offer.
3. Check that missing data comes back as `null` and the unknown course maps to `"other"`.
4. Add a new field `preferred_language: Literal["english", "hindi", "other"]` and rerun.
5. Feed one deliberately invalid phone number and confirm `validate_lead` flags it.

## Key takeaways

- Asking for JSON in a prompt is fragile; constrain output to a schema instead.
- `client.messages.parse(output_format=YourModel)` returns a validated Pydantic object.
- Nullable fields plus "do not guess" instructions reduce invented data.
- Schemas guarantee shape, not truth: add business-rule validation and a human review path.
- Always check `stop_reason` before trusting extracted data.
