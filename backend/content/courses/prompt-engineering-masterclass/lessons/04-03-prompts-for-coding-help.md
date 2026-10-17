You don't need to be a developer to get real value from AI coding help. Analysts automate spreadsheets, marketers write small scripts, and aspiring developers learn faster. This lesson shows how to prompt for code that actually runs, and how to stay in control of it.

## The coding prompt formula

Good coding prompts include:

1. **Environment** — language, version if known, tool (Excel, Google Sheets, Python, SQL database).
2. **Goal** — what the code should achieve, in plain words.
3. **Inputs** — the shape of your data, with a small sample.
4. **Output** — what you expect to see.
5. **Constraints** — your skill level, libraries allowed, no internet access, etc.

### Before and after: spreadsheet formula

Before:

```text
Excel formula to find late payments
```

After:

```text
I use Google Sheets. Column A has invoice numbers, column B has invoice
dates (DD/MM/YYYY), column C has payment due days (e.g., 30), column D has
the payment date, or is blank if unpaid.

I want column E to show:
- "Paid on time" if paid on or before the due date
- "Paid late by X days" if paid after
- "Overdue by X days" if unpaid and today is past the due date
- "Not yet due" otherwise

Give me one formula for E2 that I can drag down, and explain each part in
simple words. I'm comfortable with IF but not with array formulas.
```

The sample columns and the four outcomes remove almost all guesswork.

## Explaining code

If you're learning, or inherited a script from a colleague who left:

```text
Explain this Python script to me as if I know basic Python (variables, loops)
but not pandas. Go block by block. For each block, tell me what it does,
why it might be written that way, and one thing that could go wrong.

<code>
[PASTE CODE]
</code>
```

## Debugging

Always include the exact error message and what you expected:

```text
This Python script should read sales.csv and print total sales per city,
but it crashes.

Error:
"""
KeyError: 'City'
"""

First 3 lines of sales.csv:
"""
city,amount,date
Pune,1200,01-10-2026
Nagpur,850,01-10-2026
"""

<code>
[PASTE CODE]
</code>

Explain the cause in one or two sentences, then give the corrected code.
Don't change anything unrelated to the bug.
```

The CSV sample is what lets the model spot the lowercase `city` header. Without the data sample, it can only guess.

## Writing small scripts

For new scripts, ask for a plan first, then code:

```text
I want a Python script that renames all PDF invoices in a folder from
names like "scan_0034.pdf" to "INV_<invoice number>_<vendor>.pdf",
reading the invoice number and vendor name from the first page.

Before writing code:
1. List the steps the script will take.
2. List the libraries you'd use and how to install them.
3. Tell me what could go wrong (scanned images, missing text).

Wait for my OK before writing the code.
```

"Wait for my OK" gives you a checkpoint to correct the approach before any code exists. Once agreed, ask for the code with comments, and request that it first runs in a "dry run" mode that prints planned renames without changing files.

## SQL for analysts

```text
I'm using PostgreSQL. Tables:
orders(order_id, customer_id, order_date, amount, city)
customers(customer_id, name, signup_date)

Write a query that shows, for each city, the number of customers who placed
their first order within 30 days of signup, in 2026 only.
Explain the query line by line. Use clear aliases.
```

Always share table and column names. Without them, the model invents plausible ones and the query fails.

## Staying safe and in control

- **Read before you run.** Ask the model "What does this code do to my files or data?" if you're not sure.
- **Test on copies.** Run new scripts on a copy of your data or a test folder first.
- **Never paste secrets.** Remove passwords, API keys and customer personal data from code before sharing it with any AI tool.
- **Check licences and company rules** before putting AI-written code into production work.
- **Understand enough to maintain it.** If you can't explain what the script does, ask the AI to explain it until you can.

## Using AI to learn, not just to copy

If you're building a developer career, AI can be a patient tutor:

```text
I'm learning Python. Give me a small exercise on dictionaries using an Indian
context (e.g., a kirana store's stock). Don't show the solution. When I paste
my attempt, review it like a senior developer: what's correct, what could be
cleaner, and one concept I should study next.
```

This builds real skill, which matters in interviews where you won't have an assistant.

## Try it yourself

Spend 15-20 minutes.

1. Pick a small, real problem: a spreadsheet formula, a data-cleaning step, a file-renaming task, or a SQL question.
2. Write a prompt with environment, goal, a 3-row data sample, expected output and your skill level.
3. Run it. Test the result on a copy of your data.
4. If it fails, use the debugging template with the exact error message.
5. Ask the model to explain the final solution, and write a one-paragraph explanation in your own words.
6. Save the prompt structure as a template in your library.

## Key takeaways

- Coding prompts need environment, goal, sample input, expected output and constraints.
- Always include exact error messages and a data sample when debugging.
- Ask for a plan before code on anything non-trivial, and add a dry-run mode for file changes.
- Test on copies, never paste secrets, and follow your company's rules.
- Use AI as a tutor so your own skills grow, not just your output.
