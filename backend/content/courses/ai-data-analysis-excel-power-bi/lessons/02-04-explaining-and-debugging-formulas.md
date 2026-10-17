Half of spreadsheet work isn't writing new formulas — it's understanding and fixing the ones someone else left behind. This lesson shows how to use AI as a patient tutor that explains, audits and repairs formulas, and how to check its work.

## The inherited-file problem

You join the MIS team at a Nagpur FMCG distributor. The monthly branch report has a cell containing:

```excel
=IFERROR(SUMPRODUCT((Data!$C$2:$C$5000=$A5)*(TEXT(Data!$B$2:$B$5000,"mmm-yy")=C$3)*(Data!$H$2:$H$5000)),0)
```

The person who built it has moved to Hyderabad. The number in that cell looks low this month. Where do you start?

## Step 1: Ask for a plain-English explanation

```text
Explain this Excel formula step by step in simple English, as if to a new MIS executive.
Then tell me what assumptions it makes about the data, and what could make it return a wrong number without showing an error.

=IFERROR(SUMPRODUCT((Data!$C$2:$C$5000=$A5)*(TEXT(Data!$B$2:$B$5000,"mmm-yy")=C$3)*(Data!$H$2:$H$5000)),0)

Context: A5 has a branch name, C3 has a month label like "Oct-26", Data!B is invoice date, C is branch, H is net sales.
```

A good explanation will tell you:

1. It checks each row where branch equals A5 (gives 1 or 0).
2. It converts each date to "mmm-yy" text and checks it equals C3 (1 or 0).
3. It multiplies those with net sales, so only matching rows contribute, and sums them.
4. IFERROR turns any error into 0.

The "silent failure" part is where the real value lies. Expect points like:

- **Fixed range ends at row 5000.** If the data now has 5,400 rows, the last 400 are ignored. *This is very likely why the number looks low.*
- **IFERROR hides problems.** If any cell in column H contains text (like "NA"), the whole formula errors and IFERROR shows 0 instead of warning you.
- **Text dates.** If some dates in column B are text, TEXT won't format them as expected and those rows won't match.
- **Branch spelling.** "Nagpur " with a trailing space won't match "Nagpur".

You've gone from "the number looks low" to four testable hypotheses in two minutes.

## Step 2: Test the hypotheses yourself

Don't take the AI's word for it — check:

- Press **Ctrl + End** on the Data sheet to see the last used row. If it's beyond 5000, hypothesis 1 is confirmed.
- `=COUNTA(Data!B:B)-1` tells you how many data rows exist.
- `=SUMPRODUCT(--ISTEXT(Data!H2:H6000))` counts text cells in the sales column.
- `=SUMPRODUCT(--ISTEXT(Data!B2:B6000))` counts text "dates".

The double minus `--` converts TRUE/FALSE into 1/0 so SUMPRODUCT can add them.

## Step 3: Ask for a more robust rewrite

```text
Rewrite this formula so that:
- it doesn't break when rows are added,
- it doesn't hide errors,
- a colleague can understand it.
I'm on Excel 365. I can convert the data into a Table named Data.
```

A likely answer, once the data is a Table and the month cell C3 holds a real date (the first of the month) instead of text:

```excel
=SUMIFS(Data[Net Sales], Data[Branch], $A5, Data[Invoice Date], ">="&C$3, Data[Invoice Date], "<="&EOMONTH(C$3,0))
```

Shorter, faster, grows with the data, and an error in the source will now show up instead of becoming a silent zero. That's a better report, not just a fixed cell.

## Using Excel's built-in tools alongside AI

AI explanations work best combined with Excel's own auditing features:

- **Evaluate Formula** (Formulas tab > Evaluate Formula) steps through a formula one calculation at a time on your real data. Use it to confirm what the AI described.
- **Trace Precedents / Dependents** draws arrows showing which cells feed a formula and which cells use it.
- **F9 inside the formula bar** — select part of a formula and press F9 to see what that part evaluates to. Press **Esc** afterwards, or the result replaces your formula.
- **Show Formulas** (Ctrl + `) displays formulas instead of results across the sheet, useful for spotting one cell that's hard-coded while its neighbours are formulas.

In Google Sheets, clicking a formula cell shows a preview tooltip of the result for parts of the formula, and Sheets' built-in AI help (where available) can also explain formulas.

## Common error codes, decoded

| Error | Usual meaning | Typical fix |
|---|---|---|
| `#N/A` | Lookup value not found | TRIM, check types, add missing master data |
| `#VALUE!` | Wrong data type, e.g. text in maths | Find the text cell; use VALUE or clean source |
| `#REF!` | Formula points to a deleted cell or sheet | Rebuild the reference |
| `#DIV/0!` | Dividing by zero or blank | IFERROR or IF(denominator=0, ...) |
| `#NAME?` | Misspelt function or function not in your version | Check spelling; use an older alternative |
| `#SPILL!` | Dynamic array output blocked | Clear cells in the spill range |

A useful prompt when you're stuck:

```text
Cell F12 shows #VALUE!. Formula: [paste]. 
The referenced cells contain: [paste the values, e.g. D12 = "1,200", E12 = 5%].
What's causing it and what's the smallest fix?
```

## Build a formula documentation habit

When you finish a complex workbook, ask the AI to help you write a "Read Me" sheet:

```text
Here are the key formulas in my monthly MIS workbook, with their cell addresses and purpose.
Write a short README sheet for the next person: what each sheet does, where the inputs go,
which cells must never be overwritten, and how to refresh for a new month.
[paste formulas]
```

This is one of the most underrated career moves for MIS professionals. Managers notice when your files can be handed over without a two-hour call.

## When AI explanations are wrong

AI assistants sometimes misread argument order (especially SUMIF vs SUMIFS), confuse Excel and Sheets behaviour, or describe a function your version doesn't have. Protect yourself:

- Test the explanation on two or three rows where you know the answer.
- Use Evaluate Formula to confirm intermediate steps.
- If the AI says something surprising, ask it "Are you sure? Show me what this returns for row 7" and check against the sheet.

## Try it yourself

About 15 minutes.

1. Find the longest formula in any workbook you use at work (or ask an AI to generate a "messy legacy MIS formula using SUMPRODUCT and nested IFs" for practice).
2. Ask an AI for a step-by-step explanation and a list of silent-failure risks.
3. Pick two risks and test them yourself using Ctrl + End, ISTEXT checks or Evaluate Formula.
4. Ask for a more robust rewrite and compare its result with the original on the same data.
5. Write a three-line README note for that formula.

## Key takeaways

- Ask AI not just "what does this do" but "what could make it silently wrong".
- Turn the AI's explanation into hypotheses and test them on the real data.
- Combine AI with Evaluate Formula, Trace Precedents and F9 to confirm what's happening.
- Rewrite fragile formulas with Tables and SUMIFS so they grow with the data and surface errors.
- Document key formulas in a README sheet — it makes your work easy to hand over.
