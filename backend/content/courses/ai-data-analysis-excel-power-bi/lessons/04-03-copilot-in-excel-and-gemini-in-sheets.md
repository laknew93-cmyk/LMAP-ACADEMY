Microsoft and Google have built AI directly into their spreadsheets. Instead of copying data into a chat window, you can ask questions right inside the workbook. This lesson explains what these built-in assistants are good at, where they struggle, and how to work with them effectively.

## A note on availability

Copilot in Excel and Gemini in Google Sheets are evolving quickly, and what you can access depends on your licence, your organisation's admin settings and your region. Some features need the file saved to OneDrive or SharePoint; some need a particular business or personal plan; some appear first in preview. Rather than memorise menus that will move, learn the **kinds** of things these tools do and how to ask for them. If you don't see the feature at work, ask your IT team — many companies switch it on only for certain users.

## What built-in spreadsheet AI typically does

Both Copilot in Excel and Gemini in Sheets broadly offer:

| Capability | Example request |
|---|---|
| Suggest formulas and new columns | "Add a column with the GST amount, assuming Amount includes GST at the rate in column J" |
| Highlight, sort and filter | "Highlight invoices above ₹10,000 in orange" |
| Summarise and create pivots or charts | "Show total sales by category and store as a PivotTable" |
| Answer questions about the data | "Which store had the highest average invoice value in August?" |
| Spot trends and outliers | "Are there any unusual values in the Amount column?" |
| Generate tables or templates | "Create a monthly expense tracker for a small CA office" |
| Explain formulas | "Explain the formula in F2" |

Some Excel plans can also run Python-based analysis inside the workbook, which Copilot can use for deeper work like forecasting. Check what your version actually offers.

## The big advantage: context

The built-in assistants can see your sheet's structure — column headers, data types, the selected range. That removes much of the "describe your sheet" work from Lesson 1.2. Their output also lands directly in your workbook as a real formula, pivot or chart that you can inspect and keep.

## Preparing your sheet for built-in AI

These tools work best on tidy data. Before you ask anything:

1. **Format your data as a Table** in Excel (Ctrl + T). Copilot typically works best on data in a Table or a clearly structured range.
2. **Use clear, unique headers** — "Amount incl GST", not "Amt" or a blank.
3. **One header row, no merged cells, no blank rows or columns** in the middle.
4. **Real dates and numbers** — the cleaning from Module 3 still matters.

If Copilot or Gemini says it can't understand your data, the problem is almost always structure.

## How to phrase requests

The prompting principles are the same: be specific about columns, conditions and output.

Vague:

```text
Analyse sales.
```

Better:

```text
Create a PivotTable on a new sheet showing total Amount incl GST by Category (rows) and Month (columns) for Jul–Sep 2026, sorted by September sales, highest first.
```

For formulas:

```text
Add a column called "FY Quarter" that returns Q1 for April–June, Q2 for July–September, Q3 for October–December, and Q4 for January–March, based on the Date column.
```

For quick insight:

```text
What are the three biggest changes in sales by category between August and September? Show the numbers.
```

## Always inspect the output

Treat a suggested formula exactly as you would one from a chat assistant:

- **Read the formula** before accepting it. Does it reference the right columns?
- **Spot-check** two or three rows by hand.
- **For pivots and charts**, check the fields used and whether filters were applied.
- **For "insights"**, ask for the numbers behind them (Lesson 4.2).

When the assistant offers an "Insert" or "Add to sheet" button: preview, test, then insert. Undo (Ctrl + Z) and version history on OneDrive or Google Drive are your safety net.

## Where built-in assistants struggle

- **Messy layouts** — reports with merged headers, subtotal rows, or several tables on one sheet.
- **Multi-sheet logic** — questions that need joining several tables may not work as smoothly as a single-table question; you may still need XLOOKUP or Power Query.
- **Company-specific definitions** — it doesn't know your firm's definition of "active customer" or "net sales" unless you spell it out.
- **Very large or complex workbooks** — performance and accuracy can drop.
- **Reproducibility** — asking the same question twice may produce slightly different approaches. For recurring reports, convert the result into fixed formulas and pivots.

## Built-in AI vs chat assistant vs doing it yourself

| Situation | Best choice |
|---|---|
| Quick formula or highlight on a tidy table | Built-in assistant |
| Understanding a complex legacy formula | Either — chat assistants give longer explanations |
| Exploratory analysis of an exported file | Chat assistant with data analysis, or built-in Python features |
| Sensitive data, no approved tool | Do it yourself with formulas and pivots |
| Monthly recurring report | Build with formulas, pivots, Power Query — use AI to help design it |
| Learning a function for the long term | Ask for an explanation, then type it yourself |

If you only ever click "Insert", you'll struggle when the AI is unavailable or wrong.

## A Chennai CA firm example

Meena, an article assistant at a Chennai CA firm, receives a client's expense register in Excel: 600 rows with Date, Vendor, Ledger Head, Amount and GST Input. Using Copilot on the Table, she asks:

```text
Show total Amount and GST Input by Ledger Head for Q2 FY2026-27 (July to September 2026) as a PivotTable, sorted by Amount descending.
```

Then:

```text
Highlight rows where GST Input is more than 18% of Amount.
```

In this register, Amount is the taxable value, and most of the client's routine expenses attract GST at 18% or less, so a higher ratio is worth a closer look — it could be a data-entry error or a legitimately higher-rated item. Meena then reviews each highlighted row herself — the AI found candidates; the professional judgement stays with her.

## Try it yourself

About 15 minutes. If you don't have Copilot or Gemini in your spreadsheet, do the same steps with a chat assistant by pasting 15 sample rows.

1. Open your clean Pink City Fabrics Sales table (or any tidy table of 100+ rows).
2. Ask the built-in assistant to add a "Taxable" column. Read and test the formula on three rows.
3. Ask it to create a pivot of sales by Category and Month. Check the grand total against `=SUM(Sales[Amount])`.
4. Ask, "What's one unusual pattern in this data?" Then ask for the numbers and row count behind it.
5. Note one thing it did well and one thing you had to correct.

## Key takeaways

- Copilot in Excel and Gemini in Sheets add formulas, pivots, charts and Q&A inside your file; availability depends on licence and admin settings.
- They work best on tidy Tables with clear headers and real data types.
- Be specific in requests, and inspect every formula, pivot and insight before relying on it.
- They struggle with messy layouts, multi-table logic and company-specific definitions.
- Use them to speed up work, but keep learning the underlying functions yourself.
