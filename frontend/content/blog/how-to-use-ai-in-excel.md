---
title: How to Use AI in Excel: Formulas, Copilot & Data Cleanup
description: Learn how to use AI in Excel: write formulas with ChatGPT, use Copilot in Excel, clean messy data and build pivot summaries, with worked examples.
date: 2026-10-17
keywords: how to use AI in Excel, Copilot in Excel, ChatGPT for Excel formulas, AI Excel formula generator, clean data in Excel with AI, AI pivot table, Excel AI tools, AI for spreadsheets
courses: ai-data-analysis-excel-power-bi, ai-essentials-chatgpt-gemini-copilot
---

You can use AI in Excel in two main ways: ask an AI assistant like ChatGPT, Gemini or Copilot to write and explain formulas for you, or use Copilot built into Excel to analyse, summarise and transform your data directly in the workbook. Both work best when you describe your data clearly and verify the result before trusting it. This guide shows you how, with ready-to-use formulas, prompts and a data-cleaning workflow.

## Two ways to use AI with Excel

| Approach | What you need | Best for |
|---|---|---|
| External AI assistant (ChatGPT, Gemini, Copilot chat) | Any version of Excel plus an AI chat tool | Writing formulas, explaining errors, planning analysis, writing VBA or Power Query steps |
| Copilot in Excel | A Microsoft 365 plan that includes Copilot | Asking questions about data in the sheet, generating formula columns, highlighting, quick charts and summaries |

If you do not have Copilot in Excel, you are not missing out on the most valuable part. Knowing how to ask any AI assistant for the right formula already saves hours every week.

## Method 1: Get Excel formulas from an AI assistant

The secret is describing your sheet precisely. AI cannot see your file unless you share it, so tell it the column letters, what each column contains, and the result you want.

### A good prompt template

> "In Excel, column A has customer names, column B has the city, column C has the order date and column D has the order amount in rupees. Data is in rows 2 to 500. Write a formula to calculate the total order amount for Pune in April 2026. Explain how it works."

A typical correct answer looks like this:

`=SUMIFS(D2:D500, B2:B500, "Pune", C2:C500, ">="&DATE(2026,4,1), C2:C500, "<"&DATE(2026,5,1))`

This adds amounts in column D where the city is Pune and the date is on or after 1 April 2026 and before 1 May 2026. Using "before 1 May" rather than "on or before 30 April" also catches dates that include a time.

### Useful formulas you can ask AI to build

Here are common tasks with formulas that work in Microsoft 365 / Excel 2021 or later (where noted, older versions need alternatives).

**Look up a price from another sheet**

`=XLOOKUP(A2, Products!A:A, Products!C:C, "Not found")`

Finds the product code in A2 within column A of the Products sheet and returns the matching value from column C. If there is no match, it shows "Not found". For older Excel, ask AI for the `INDEX`/`MATCH` equivalent: `=IFERROR(INDEX(Products!C:C, MATCH(A2, Products!A:A, 0)), "Not found")`.

**Calculate 18% GST on an amount, rounded to two decimals**

`=ROUND(B2*18%, 2)`

**Get the Indian financial year from a date**

`=IF(MONTH(A2)>=4, YEAR(A2)&"-"&RIGHT(YEAR(A2)+1,2), YEAR(A2)-1&"-"&RIGHT(YEAR(A2),2))`

A date of 15 May 2026 returns "2026-27", and 10 January 2026 returns "2025-26".

**Count orders above ₹10,000 for one salesperson**

`=COUNTIFS(E2:E500, "Ravi", D2:D500, ">10000")`

**Flag duplicate entries**

`=IF(COUNTIF($A$2:$A$500, A2)>1, "Duplicate", "")`

**Get a unique, sorted list of cities (Microsoft 365)**

`=SORT(UNIQUE(B2:B500))`

**Filter all orders above ₹50,000 into a new area (Microsoft 365)**

`=FILTER(A2:D500, D2:D500>50000, "No orders")`

### Use AI to fix formula errors

When you get `#N/A`, `#VALUE!` or `#SPILL!`, paste the formula and a description of your data into an AI assistant and ask why. Common answers it will give:

- `#N/A` in a lookup: the value does not exist, or has extra spaces or a different format (text "101" versus number 101)
- `#VALUE!`: a calculation is trying to use text as a number
- `#SPILL!`: a dynamic array formula needs empty cells below or beside it

### Always test AI formulas

AI assistants occasionally produce formulas with wrong ranges, functions that do not exist in your Excel version, or logic that does not match what you meant. Test every formula on a few rows where you already know the right answer before applying it to the whole sheet.

## Method 2: Use Copilot in Excel

Copilot in Excel lets you type requests in plain language in a side panel. Availability and features depend on your Microsoft 365 plan and are updated regularly. It has typically required files to be saved to OneDrive or SharePoint, and works best when your data is formatted as an Excel table (select the data and press **Ctrl + T**).

Things you can ask Copilot:

- "Add a column that calculates profit as Revenue minus Cost."
- "Which region had the highest sales last quarter?"
- "Highlight all rows where the payment status is Pending."
- "Show sales by month as a chart."
- "Summarise the key trends in this data."

Copilot shows you the formula or step it plans to use, so you can check it before inserting. Treat its answers as a strong first draft, not a final report — always sense-check numbers against your own understanding of the business.

Microsoft has also been introducing AI-powered functions that can be used directly in cells in some versions of Excel. These are useful for tasks like categorising or summarising text, but availability varies, so check what your version supports.

## Cleaning messy data with AI

Most real-world spreadsheets are messy: extra spaces, inconsistent capitals, mixed date formats, phone numbers with dashes. Here is a practical workflow.

### Step 1: Describe the mess to AI

> "My Excel column A has customer names with extra spaces and inconsistent capitalisation, like '  rAHUL   sharma'. Column B has phone numbers in formats like '+91 98765-43210' and '098765 43210'. Give me formulas to clean both."

### Step 2: Apply cleaning formulas

**Fix spaces and capitalisation in names**

`=PROPER(TRIM(A2))`

`TRIM` removes leading, trailing and repeated spaces; `PROPER` capitalises each word. "  rAHUL   sharma" becomes "Rahul Sharma".

**Keep only the last 10 digits of a phone number**

`=RIGHT(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(B2," ",""),"-",""),"+",""),10)`

This strips spaces, dashes and plus signs, then keeps the last 10 characters — the mobile number without the country code or leading zero.

**Split a full name into first and last name (Microsoft 365)**

`=TEXTBEFORE(A2, " ")` for the first name and `=TEXTAFTER(A2, " ", -1)` for the last word of the name.

For older Excel: `=IFERROR(LEFT(A2, FIND(" ", A2)-1), A2)` for the first name.

**Remove hidden non-printing characters (common in data copied from websites or software exports)**

`=TRIM(CLEAN(A2))`

### Step 3: Replace formulas with values

Once cleaned, copy the new column and use **Paste Special → Values** so you can delete the original messy column without breaking anything.

### Step 4: Let AI suggest Power Query steps for repeat jobs

If you clean the same type of export every week, ask AI: "Give me Power Query steps to trim spaces, fix capitalisation, remove duplicates and change column C to a date type." Power Query records the steps once and repeats them with a single refresh.

## Building pivot summaries faster with AI

Pivot tables are the fastest way to summarise large data, and AI helps you decide what to build.

### Ask AI what to analyse

> "I have sales data with columns Date, Region, Salesperson, Product, Quantity and Amount. What are five useful pivot table summaries a sales manager would want?"

You will typically get suggestions like sales by region and month, top products by revenue, salesperson performance, and quantity versus amount trends.

### Build the pivot

1. Click inside your data and press **Ctrl + T** to format it as a table.
2. Go to **Insert → PivotTable**.
3. Drag **Region** to Rows, **Date** to Columns (group by months), and **Amount** to Values.
4. Change the Values summary to Sum, and format numbers in the Indian number format if needed.

### Ask AI to explain the results

Copy the summarised pivot (not raw customer data) into an AI assistant and ask: "What are the three most important insights in this summary, and what questions should I investigate next?" This is a great way to turn numbers into a short written report for your manager.

If you want to take this further into dashboards and Power BI, [AI for Data Analysis: Excel, Google Sheets & Power BI](/courses/ai-data-analysis-excel-power-bi) covers formulas, cleaning, pivots, charts and dashboards step by step with practice files.

## Data privacy: what not to paste into AI

Before pasting spreadsheet data into a public AI tool, remove or mask sensitive information such as customer names, phone numbers, PAN or Aadhaar numbers, bank details and salaries. Often you only need to share column headings and a few made-up example rows to get the right formula. Follow your company's policy on approved AI tools — many organisations allow Copilot within their Microsoft 365 environment but restrict public chatbots.

## Getting started

If you are new to AI tools altogether, [the free AI in 60 Minutes course](/courses/ai-in-60-minutes) is a quick introduction. For using ChatGPT, Gemini and Copilot across Excel, Word, email and everyday office work, [AI Essentials: ChatGPT, Gemini & Copilot for Everyday Work](/courses/ai-essentials-chatgpt-gemini-copilot) is a practical next step.

## Frequently asked questions

### Can ChatGPT write Excel formulas?

Yes. ChatGPT, Gemini and Copilot can write, explain and fix Excel formulas if you describe your columns, data range and desired result clearly. Always test the formula on a few rows where you know the correct answer, because AI can occasionally use wrong ranges or functions your Excel version does not support.

### Do I need Copilot to use AI in Excel?

No. Any AI chat assistant can help you write formulas, plan analysis, and generate Power Query or VBA steps, which you then paste into Excel. Copilot in Excel adds the convenience of working directly with your data inside the workbook, but it requires a Microsoft 365 plan that includes it.

### Is it safe to upload my Excel file to an AI tool?

It depends on the data and the tool. Avoid uploading personal, financial or confidential business data to public AI tools. Share only column headings or anonymised sample rows, and use tools your organisation has approved for work data.

### Which Excel skills should I learn alongside AI?

Learn the core functions — `SUMIFS`, `COUNTIFS`, `XLOOKUP`, `IF`, `TEXT` functions — plus tables, pivot tables and basic charts. Understanding these lets you judge whether AI's suggestions are correct, which is what turns AI from a guessing tool into a genuine productivity boost.
