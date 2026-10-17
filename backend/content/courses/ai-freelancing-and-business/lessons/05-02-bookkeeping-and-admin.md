Bills, receipts, UPI notifications, stock notes and pending payments pile up quickly in any small business or freelance practice. AI won't replace your CA or accounting software, but it can help you organise, categorise and understand your numbers. This lesson shows how, safely.

**Note:** AI can make calculation and categorisation mistakes. Always check totals against your bank statement, and rely on your CA for tax filings and compliance.

## The goal: know your numbers every month

Many small business owners only look at their finances at year end. A monthly ten-minute review answers simple but important questions:

- How much came in? How much went out?
- Which products, services or clients brought the most income?
- Which expenses grew?
- Who still owes me money?

## Step 1: Get your data in one place

Create a simple Google Sheet or Excel file with these columns:

| Date | Description | Category | Income (₹) | Expense (₹) | Payment mode | Notes |
|---|---|---|---|---|---|---|

Sources to pull from:

- Bank and UPI statements (most banks let you download a statement as Excel or CSV)
- Cash memo books
- Invoices you've sent
- Receipts for purchases

If you're a freelancer, keep this separate from personal spending — the separate bank account from Lesson 4.3 makes this far easier.

## Step 2: Categorise with AI's help

Bank statement descriptions are often cryptic ("UPI/DR/4029.../RAJU TRADERS/..."). AI can suggest categories, but you need to verify them.

Before pasting, remove or mask account numbers and any personal details you don't need.

```text
Here are 30 transactions from my business bank statement (account
numbers removed). I run a [type of business]. Suggest a category for
each from this list: Raw material, Packaging, Rent, Electricity,
Internet & phone, Software, Travel, Marketing, Salary, Owner drawings,
Sales income, Other. If unsure, mark "CHECK". Return a table with
Date, Description, Amount, Suggested category.

[Paste transactions]
```

Go through the "CHECK" rows yourself. Over time, you'll notice patterns (e.g. "RAJU TRADERS" is always packaging) and can categorise quickly.

## Step 3: Let formulas do the totals

Ask AI to help you build formulas instead of doing the maths itself. Spreadsheet formulas are reliable and reusable; AI arithmetic on pasted data can be wrong.

```text
In Google Sheets, I have Date in column A, Category in C, Income in D,
Expense in E. Write formulas to:
1. Total income and total expenses for a given month (month in cell H1)
2. Total expense by category for that month
3. Net profit for the month
Explain each formula in one line.
```

Test each formula on a few rows where you know the answer.

## Step 4: Track who owes you

Unpaid invoices are a major cash-flow problem for freelancers and small businesses. Add a "Receivables" tab:

| Invoice no. | Client | Amount | Invoice date | Due date | Status | Last reminder |
|---|---|---|---|---|---|---|

A formula or conditional formatting can highlight overdue rows in red. Use the reminder messages from Lesson 4.3 for follow-ups.

## Step 5: Monthly review with AI

Once your sheet has a summary, AI can help you think through it:

```text
Here is my business summary for September and August (no personal data):
[paste summary table: income, expenses by category, top 5 clients/products]

1. What changed most between the two months?
2. Which 3 questions should I ask myself about these changes?
3. Suggest 2 practical, low-cost ideas to improve cash flow.
Do not make assumptions beyond the data.
```

Treat its answers as prompts for thinking, not financial advice. You know context the AI doesn't — maybe September was low because of Shraddh, or because a big client paid late.

## Other admin tasks AI can help with

- **Stock lists:** turning a messy handwritten stock count (typed in) into a clean table with reorder flags.
- **Supplier comparisons:** organising quotes from three suppliers into a comparison table.
- **Staff rosters:** drafting weekly schedules based on availability.
- **Price lists:** formatting a clean, printable rate card.
- **Meeting notes:** summarising a call with a supplier or client into action points.
- **Policy documents:** drafting a simple refund or cancellation policy for your shop — then checking it's fair and something you'll actually follow.

## What not to do

- Don't upload complete bank statements with account numbers, or customers' personal data, to AI tools without understanding the tool's privacy settings.
- Don't rely on AI for GST computations, return filing or tax advice — use proper accounting software and a CA.
- Don't let AI-generated summaries replace looking at the actual numbers.

## Try it yourself

About 20 minutes.

1. Download last month's bank or UPI statement (or use a sample set of 20 transactions you write yourself).
2. Mask account numbers and personal details.
3. Create the transaction sheet with the columns above.
4. Use the categorisation prompt and verify every "CHECK" row.
5. Use the formula prompt to add monthly totals and a category breakdown. Test that the totals match your statement.
6. Add a Receivables tab and enter any pending invoices.

## Key takeaways

- A simple monthly review of income, expenses and receivables keeps a small business healthy.
- Use AI to categorise transactions and write spreadsheet formulas, not to do final arithmetic.
- Mask sensitive data before using AI tools, and verify all outputs against your statements.
- Use AI as a thinking partner for monthly reviews; rely on a CA for tax and compliance.
