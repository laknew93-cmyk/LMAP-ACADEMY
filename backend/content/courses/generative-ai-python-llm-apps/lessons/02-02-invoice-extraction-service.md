This is your first portfolio project: a small web service that accepts a GST invoice (PDF or photo) and returns clean, validated JSON. Accounts teams at CA firms, distributors and D2C brands spend hours typing invoices into Tally or spreadsheets, so this is a problem interviewers immediately understand.

## What we are building

```text
POST /extract  (upload invoice.pdf or invoice.jpg)
      |
      v
FastAPI -> Claude (document + schema) -> Pydantic Invoice -> GST checks
      |
      v
{ "invoice": {...}, "issues": ["CGST and SGST differ"], "needs_review": true }
```

Install the dependencies:

```bash
pip install anthropic fastapi "uvicorn[standard]" python-multipart pydantic python-dotenv
```

`python-multipart` is needed for FastAPI file uploads.

## Step 1: the schema

Create `schemas.py`. Amounts are floats in rupees, dates are ISO strings, and anything that may be missing is nullable.

```python
from pydantic import BaseModel, Field


class LineItem(BaseModel):
    description: str
    hsn_sac: str | None = Field(description="HSN or SAC code if printed, else null")
    quantity: float
    unit_price: float = Field(description="Price per unit in rupees, before tax")
    taxable_value: float = Field(description="Line amount before tax, in rupees")


class Invoice(BaseModel):
    supplier_name: str
    supplier_gstin: str | None
    buyer_name: str | None
    buyer_gstin: str | None
    invoice_number: str
    invoice_date: str = Field(description="ISO format YYYY-MM-DD")
    place_of_supply: str | None = Field(description="State name if printed")
    line_items: list[LineItem]
    taxable_total: float
    cgst: float = Field(description="0 if not charged")
    sgst: float = Field(description="0 if not charged")
    igst: float = Field(description="0 if not charged")
    grand_total: float
```

## Step 2: the extraction function

Create `extractor.py`. Claude can read PDFs and images directly, so we send the file as a content block alongside the instruction.

```python
import base64
import os

import anthropic

from schemas import Invoice

MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}

SYSTEM = """You extract data from Indian GST invoices for an accounts team.
Copy values exactly as printed. Convert amounts to plain numbers in rupees.
If a field is not present, use null (or 0 for tax amounts). Never invent
GSTINs, invoice numbers or amounts."""


def extract_invoice(file_bytes: bytes, media_type: str) -> Invoice:
    data = base64.standard_b64encode(file_bytes).decode("utf-8")
    if media_type == "application/pdf":
        file_block = {"type": "document",
                      "source": {"type": "base64", "media_type": media_type, "data": data}}
    elif media_type in IMAGE_TYPES:
        file_block = {"type": "image",
                      "source": {"type": "base64", "media_type": media_type, "data": data}}
    else:
        raise ValueError(f"Unsupported file type: {media_type}")

    response = client.messages.parse(
        model=MODEL,
        max_tokens=16000,
        system=SYSTEM,
        messages=[{"role": "user", "content": [
            file_block,
            {"type": "text", "text": "Extract this invoice."},
        ]}],
        output_format=Invoice,
    )
    if response.stop_reason != "end_turn" or response.parsed_output is None:
        raise RuntimeError(f"Extraction incomplete ({response.stop_reason})")
    return response.parsed_output
```

Points to note:

- The file goes in as base64 inside a `document` block (PDF) or `image` block (photo). The file block comes before the text instruction.
- We whitelist media types. Never pass arbitrary user uploads through without checking.
- We leave effort at its default here. Invoices with many line items, smudged scans or handwritten notes benefit from a bit more reasoning; you can tune this later with a test set.

## Step 3: GST sanity checks

The model reads what is printed; your code checks whether it adds up. Create `checks.py`:

```python
import re

from schemas import Invoice

GSTIN_RE = re.compile(r"^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$")


def close(a: float, b: float, tol: float = 1.0) -> bool:
    return abs(a - b) <= tol  # allow rupee rounding


def check_invoice(inv: Invoice) -> list[str]:
    issues = []
    for label, gstin in [("supplier", inv.supplier_gstin), ("buyer", inv.buyer_gstin)]:
        if gstin and not GSTIN_RE.match(gstin):
            issues.append(f"{label} GSTIN format looks wrong: {gstin}")

    lines_sum = sum(li.taxable_value for li in inv.line_items)
    if not close(lines_sum, inv.taxable_total):
        issues.append(f"Line items sum to {lines_sum:.2f}, taxable total is {inv.taxable_total:.2f}")

    if inv.igst > 0 and (inv.cgst > 0 or inv.sgst > 0):
        issues.append("Both IGST and CGST/SGST charged - check inter/intra-state")
    if not close(inv.cgst, inv.sgst):
        issues.append("CGST and SGST should normally be equal")

    expected = inv.taxable_total + inv.cgst + inv.sgst + inv.igst
    if not close(expected, inv.grand_total, tol=2.0):
        issues.append(f"Taxable + tax = {expected:.2f}, grand total is {inv.grand_total:.2f}")
    return issues
```

These rules come from how GST works: intra-state supplies carry CGST and SGST in equal halves, inter-state supplies carry IGST, and totals must reconcile. A GSTIN is 15 characters: state code, PAN, entity number, the letter Z, and a check character. Our regex checks the shape only; the official checksum and GST portal lookup are good extensions.

## Step 4: the API

Create `main.py`:

```python
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, UploadFile

from checks import check_invoice
from extractor import extract_invoice

app = FastAPI(title="GST Invoice Extractor")
MAX_BYTES = 10 * 1024 * 1024  # 10 MB


@app.post("/extract")
async def extract(file: UploadFile):
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 10 MB)")
    try:
        invoice = extract_invoice(content, file.content_type or "")
    except ValueError as e:
        raise HTTPException(415, str(e))
    except RuntimeError as e:
        raise HTTPException(422, str(e))
    issues = check_invoice(invoice)
    return {"invoice": invoice.model_dump(), "issues": issues, "needs_review": bool(issues)}


@app.get("/health")
def health():
    return {"status": "ok"}
```

`load_dotenv()` runs before the other imports so the API key and model name are in the environment when `extractor.py` creates its client.

Run it with `uvicorn main:app --reload` and open `http://127.0.0.1:8000/docs`. FastAPI generates an interactive page where you can upload a file and see the JSON. That `/docs` page is excellent for demos.

Note that `extract_invoice` is a normal blocking function called from an `async` route. For a portfolio demo that is fine; for real traffic, switch to `anthropic.AsyncAnthropic` and `await client.messages.parse(...)`, or declare the route with plain `def` so FastAPI runs it in a thread pool.

## Privacy note

Invoices contain business names, GSTINs and sometimes personal details. For your demo, use sample or self-made invoices, never a client's real documents without permission. Do not log full invoice contents; log only the invoice number and the issues list.

## Try it yourself

About 20 minutes (plus setup):

1. Create two sample invoices: one intra-state (CGST + SGST) and one inter-state (IGST). A word processor exported to PDF is fine; also take a phone photo of a printed one.
2. Run the service and upload all three files through `/docs`.
3. Edit one invoice so the grand total is wrong by ₹500 and confirm `needs_review` becomes `true`.
4. Add a check that `invoice_date` is a valid date not in the future (use `datetime.date.fromisoformat`).
5. Commit the project to a new GitHub repository (with `.env` in `.gitignore`). You will deploy it in Module 5.

## Key takeaways

- Send PDFs and images as content blocks; Claude reads them directly.
- Let the model read and structure; let your code verify with deterministic rules.
- A `needs_review` flag turns an imperfect model into a reliable workflow.
- Whitelist file types and size, and keep sensitive data out of logs.
- FastAPI's `/docs` page gives you a free, demo-ready interface.
