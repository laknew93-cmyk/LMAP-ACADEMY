The single biggest reason people get wrong formulas from AI is that the AI cannot see their sheet. This lesson teaches you a simple way to describe your data so that the first answer is usually the right one.

## Why vague questions get vague formulas

Compare two requests.

```text
Give me a formula to calculate total sales for Jaipur.
```

```text
I'm using Excel (Microsoft 365). Sheet "Sales" has headers in row 1 and data in A2:K1050.
Column C = Store (values: "Jaipur MI Road", "Jaipur Vaishali", "Online")
Column J = Amount incl. GST (numbers)
Column B = Date (real Excel dates)
I want the total of column J for both Jaipur stores combined, for October 2026 only.
Put the formula in a summary sheet. Please explain it briefly.
```

The first will get you a generic `=SUMIF(...)` that refers to imaginary columns and probably misses that "Jaipur" appears inside two different store names. The second gets you something you can paste directly:

```excel
=SUMIFS(Sales!J:J, Sales!C:C, "Jaipur*", Sales!B:B, ">="&DATE(2026,10,1), Sales!B:B, "<"&DATE(2026,11,1))
```

Note the wildcard `"Jaipur*"`, which matches any store name starting with Jaipur, and the date range written as "on or after 1 October and before 1 November" — a pattern you will reuse constantly.

## The CONTEXT template

Use this checklist whenever you ask for a formula. You don't need every item every time, but the more you include, the better the result.

- **C**ell layout — sheet name, header row, data range, column letters.
- **O**utput — where the formula goes and what it should return (a number, text, a list).
- **N**ature of values — numbers, text, real dates or text that looks like dates, blanks.
- **T**ool and version — Excel 2016, Microsoft 365, Google Sheets.
- **E**xamples — two or three sample rows and the answer you expect for them.
- **X**ceptions — what to do with blanks, errors, missing matches.
- **T**each — ask for an explanation so you understand what you paste.

A reusable prompt:

```text
Tool: [Excel 365 / Excel 2019 / Google Sheets]
Sheet: [name], headers in row [1], data in [A2:K500]
Relevant columns:
- [Col letter] = [name] ([type, example values])
- ...
Goal: [what I want, in plain words]
Formula goes in: [cell / sheet]
Sample rows and expected result:
[paste 3 rows] -> expected: [answer]
Edge cases: [blanks / not found / duplicates]
Give me the formula, then explain each part in simple English.
```

## Paste sample rows, not the whole sheet

The fastest way to give context is to copy a few rows directly from your sheet and paste them into the chat. Spreadsheets paste as tab-separated text, which assistants read well. Five to ten rows, including the header, is plenty.

Two rules:

1. **Mask anything personal first.** Customer names, phone numbers, PAN, Aadhaar, bank details — replace them with dummy values. Lesson 1.3 covers this properly.
2. **Include an awkward row.** If some dates are text, or some amounts are blank, include one such row so the AI handles it.

## Use Excel Tables and named columns

If your data is formatted as an Excel Table (select the range, press **Ctrl + T**, and give it a name like `Sales` under Table Design), formulas become far easier to read and to ask about:

```excel
=SUMIFS(Sales[Amount], Sales[Store], "Jaipur*")
```

Tell the AI: "My data is an Excel Table named Sales with columns Invoice No, Date, Store, Amount." It will write structured references like the one above, and they keep working when new rows are added. Google Sheets has a similar feature (Format > Convert to table), and named ranges work in both tools.

## Ask for the formula *and* the reasoning

Always end with "explain each part". This does two things. It helps you learn, so next month you can write a similar formula yourself. And it exposes mistakes — if the explanation says "this looks up the value in column D" and your customer IDs are in column B, you've caught the error before it reaches your manager.

## Iterate, don't restart

If the formula gives `#N/A`, `#VALUE!` or a wrong number, don't start a new chat. Reply in the same conversation with what happened:

```text
I pasted it in F2. It returns #N/A for row 7, where the Lead ID is "LL-0042 " (there's a trailing space).
The other rows work. How do I fix this?
```

The AI now knows the exact problem and will likely suggest wrapping the lookup value in `TRIM()`. Giving the error message, the cell, and the specific value is the debugging equivalent of the CONTEXT template.

## Asking for alternatives

You can ask for multiple solutions and pick the one that suits your team:

```text
Give me two versions: one using XLOOKUP for Excel 365, and one using INDEX-MATCH that works in Excel 2016.
Which is easier for a colleague to maintain?
```

This matters in Indian offices where the same file is opened on a new laptop at head office and an old desktop at the branch.

## Try it yourself

Take 15 minutes and use LeadLoop's leads sheet (or any sheet of yours, masked).

1. Create a small sheet with these headers in row 1: `Lead ID, Created On, Source, Owner, City, Stage, Deal Value`. Add 8 rows of made-up data with sources LinkedIn, Website, Referral, IndiaMART and stages New, Demo, Won, Lost.
2. Without the template, ask an AI: "Formula to get total won deal value from LinkedIn." Paste the result and see if it works.
3. Now use the CONTEXT template — include your columns, tool, three sample rows, and the expected answer you calculated by hand.
4. Compare the two answers. Did the second one work first time? Did the explanation match your columns?
5. Save your filled template in a notes file; you'll reuse it all course.

## Key takeaways

- The AI can't see your sheet — describe layout, data types, tool version and expected output.
- Paste 5–10 masked sample rows, including one awkward row.
- Use Excel Tables (Ctrl + T) so formulas use readable names like `Sales[Amount]`.
- Always ask for an explanation; it teaches you and catches errors.
- When something breaks, reply with the exact error, cell and value instead of starting over.
