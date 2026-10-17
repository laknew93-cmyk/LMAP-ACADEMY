Before you paste a single row of company data into an AI tool, you need a privacy routine. This lesson gives you one — simple enough to follow every time, strict enough to keep you, your employer and your customers safe.

## Why this matters in India specifically

Indian business data is full of sensitive identifiers: PAN on invoices, Aadhaar in KYC files, mobile numbers in every CRM, bank account numbers in vendor masters, salary data in HR sheets. India's Digital Personal Data Protection Act, 2023 places obligations on organisations that process personal data, and most companies also have their own IT policies on which external tools are allowed.

You don't need to be a lawyer to act responsibly. You need three habits: **check your company's policy, share the minimum, and mask what you share.**

## Rule 1: Know what your company allows

Some organisations provide an approved AI tool (for example, an enterprise version of Copilot or ChatGPT with data-protection terms), and some ban external AI tools altogether. Consumer chat assistants may, depending on the product and your settings, use conversations to improve their models. Enterprise and team plans usually offer stronger commitments.

Before using AI at work, find out:

- Which AI tools are approved?
- Is customer or employee data allowed in them at all?
- Are there settings (such as turning off chat history or model training) you must use?

If nobody can tell you, assume the strictest answer and use only masked or synthetic data.

## Rule 2: Never upload these

Treat this as a hard list. These never go into a consumer AI tool, masked or not, unless your organisation has explicitly approved a tool for that purpose:

- **Aadhaar numbers** (full or partial scans of cards)
- **PAN numbers** of individuals
- Bank account numbers, IFSC with account details, card numbers, UPI IDs tied to names
- Passwords, OTPs, API keys
- Salary, medical or performance data linked to named employees
- Anything marked confidential: board papers, unannounced results, M&A data

The good news: you almost never *need* these for analysis. A sales analysis needs amounts, dates, categories and cities — not who the customer is.

## Rule 3: Share the minimum

Before uploading, delete columns the question doesn't need. Asking "which category grew fastest?" requires Date, Category and Amount. It doesn't need Customer Name, Mobile or Address. Work on a **copy** of the file and remove the columns entirely — hiding them is not enough, because hidden columns still upload.

## Rule 4: Mask what's left

When you do need a row-level identifier (to count unique customers, for example), replace real values with codes.

### Replace names with IDs

Create a lookup sheet on your own machine that maps each customer to a code, then use the code in the shared copy.

In Excel 365, list unique customers:

```excel
=UNIQUE(Sales[Customer Name])
```

Next to that list, generate codes:

```excel
="CUST-"&TEXT(ROW()-1,"0000")
```

This gives CUST-0001, CUST-0002 and so on (assuming the list starts in row 2). Then bring the code into your data with XLOOKUP and delete the original name column from the copy. Keep the mapping sheet private — it's your key to un-mask the results later.

In Excel 2016 without UNIQUE, use **Data > Remove Duplicates** on a copied column instead.

### Mask mobile numbers

If you must keep a hint of the number (for example, to spot duplicates), show only the last four digits:

```excel
="XXXXXX"&RIGHT(D2,4)
```

For a number like 9876543210 this returns XXXXXX3210.

### Mask PAN if it's in the file

Better to delete the PAN column entirely. If a reviewer needs to see the format is valid, keep only the structure:

```excel
=LEFT(E2,3)&"XXXXX"&RIGHT(E2,2)
```

ABCPE1234F becomes ABCXXXXX4F. Even so, don't upload it unless there's a strong reason.

### Shift or band sensitive numbers

For salary or deal-value analysis where exact amounts are sensitive, you can group them into bands (`"₹5–10 L"`) or multiply every value by a constant factor known only to you. Ratios, rankings and growth percentages stay correct; absolute numbers don't leak.

## Use synthetic data to design, real data to run

A powerful pattern: ask the AI to **generate fake data with the same structure** as yours, design your formulas or pivot on that, then run the finished workbook on the real data locally.

```text
Create 30 rows of realistic sample data for a Jaipur clothing retailer with these columns:
Invoice No, Date (Oct 2026, DD-MM-YYYY), Store (Jaipur MI Road, Jaipur Vaishali, Online),
Category (Sarees, Kurtis, Bedsheets, Dupattas), Qty, Rate, Amount incl GST, Payment Mode (UPI, Card, Cash, COD).
Include 2 duplicate invoices and 3 city/store spelling errors so I can practise cleaning.
Output as a table I can paste into Excel.
```

The AI never sees a real customer, and you get a practice file with exactly the messiness you need.

## The 60-second pre-upload checklist

Copy this and keep it next to your desk:

```text
[ ] Is this tool approved for this kind of data?
[ ] Am I working on a COPY, not the original?
[ ] Removed every column the question doesn't need (deleted, not hidden)?
[ ] No Aadhaar, PAN, bank, card, password or salary-by-name data?
[ ] Names/phones/emails replaced with codes or masked?
[ ] Checked other sheets/tabs in the workbook — are they clean too?
[ ] Would I be comfortable if my manager saw exactly what I uploaded?
```

That sixth item catches people often: you clean "Sheet1" and upload the workbook, forgetting the "Customer Master" tab.

## Try it yourself

Spend 15 minutes building your masking toolkit.

1. Ask an AI to generate 20 rows of fake customer data with columns Name, Mobile, City, PAN, Order Amount. (Yes, fake PANs in the correct format — this is practice.)
2. Paste it into Excel or Sheets. Create a masked copy: generate CUST codes, mask mobiles to the last four digits, and delete the PAN column.
3. Save the mapping (name → code) on a separate sheet and note where you'd store it securely.
4. Run through the 60-second checklist against your masked copy.
5. Find your company's AI or IT usage policy (or ask your manager) and write down which tools are approved.

## Key takeaways

- Check your organisation's policy first; if unclear, use only masked or synthetic data.
- Aadhaar, PAN, bank details, passwords and named salary data never go into consumer AI tools.
- Delete unneeded columns from a copy — hidden columns still upload.
- Replace identifiers with codes and keep the mapping private.
- Design with synthetic data, then run your finished workbook on real data locally.
