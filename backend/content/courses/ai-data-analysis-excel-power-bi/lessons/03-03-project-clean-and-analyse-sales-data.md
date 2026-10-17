Time to put Modules 2 and 3 together. In this project you'll take a messy 1,000-row sales dataset from raw export to a clean table and a set of answered business questions — the same workflow you'd follow on your first week in an MIS role.

## The brief

Pink City Fabrics' owner, Mr. Agarwal, wants to understand the last quarter (July–September 2026) before planning Diwali stock. He has sent you the billing export and five questions:

1. What were total sales (incl. GST) and taxable sales each month?
2. Which categories contribute most to sales, and which grew fastest?
3. How do the three channels — MI Road store, Vaishali store, Online — compare?
4. What share of payments comes via UPI, Card, Cash and COD, and is COD rising online?
5. What is the average invoice value, and how many invoices were above ₹10,000?

## Step 1: Generate the dataset

Since you shouldn't practise on real customer data, generate a realistic file. Use this prompt with an assistant that can create files (many can output a CSV or Excel download); otherwise ask for a smaller sample and the Python or formula approach to expand it.

```text
Create a CSV with 1,000 rows of sales line items for "Pink City Fabrics", a Jaipur clothing retailer,
for 1 July 2026 to 30 September 2026.
Columns: Invoice No, Date, Store, Customer City, Category, Item, Qty, Rate, Amount incl GST, GST Rate, Payment Mode.
- Stores: "Jaipur MI Road", "Jaipur Vaishali", "Online"
- Categories: Sarees, Kurtis, Dupattas, Bedsheets, Lehengas
- GST Rate: 5% for items with Rate up to ₹1,000, 12% above (simplified rule for practice)
- Amount incl GST = Qty x Rate x (1 + GST Rate)
- Payment modes: UPI, Card, Cash (stores only), COD (online only)
- Customer City: mostly Jaipur, some Delhi, Mumbai, Ahmedabad, Bengaluru for online orders
Add realistic messiness: about 25 duplicate rows, city variants (JPR, jaipur, Bangalore),
about 40 dates stored as DD-MM-YYYY text, a few amounts with "Rs" prefix, 3 blank Payment Modes,
and 2 obvious typo outliers.
No real names, phone numbers or IDs.
```

(The 5%/12% split by price is a simplified rule for practice; actual GST rates depend on the product and current notifications.)

If your assistant can't produce the full file, ask it for Python code to generate it and run that in Google Colab (Lesson 4.4 shows how).

## Step 2: Profile and clean

Work through the cleaning routine from Lesson 3.1. Create sheets named `Raw`, `Clean`, `CityMap` and `Cleaning Log`.

Your checklist:

```text
[ ] Row count of Raw recorded
[ ] Duplicates flagged with COUNTIFS on Invoice No + Item, reviewed, removed (count logged)
[ ] Customer City trimmed, proper-cased and mapped via CityMap
[ ] All dates converted to real dates; MIN and MAX fall within Jul-Sep 2026
[ ] Amounts converted to numbers; "Rs" removed
[ ] Blank Payment Modes flagged (not guessed) and logged
[ ] Outliers investigated: recalculated Qty x Rate x (1+GST) vs Amount
[ ] Clean data formatted as Table "Sales"
```

For the outlier check, add a column:

```excel
=ROUND([@Qty]*[@Rate]*(1+[@[GST Rate]]),0) - [@Amount]
```

Any row where this isn't close to zero is suspect. The `[@Column]` syntax refers to the same row inside a Table. Decide with "the owner" (you, in this case) whether to correct or exclude, and log it.

## Step 3: Add helper columns

In the Sales table:

```excel
Month:          =EOMONTH([@Date],-1)+1
Taxable:        =ROUND([@Amount]/(1+[@[GST Rate]]),2)
GST:            =[@Amount]-[@Taxable]
Channel Type:   =IF([@Store]="Online","Online","Store")
```

Format Month as `mmm-yy` so it displays nicely while staying a real date.

## Step 4: Answer the five questions

Use whichever technique fits each question:

| Question | Suggested tool |
|---|---|
| 1. Monthly sales and taxable sales | Pivot: Month in Rows, Sum of Amount and Sum of Taxable |
| 2. Category share and growth | Pivot: Category in Rows, Month in Columns, % of Column Total and % Difference From |
| 3. Channel comparison | Pivot or SUMIFS grid by Store and Month |
| 4. Payment mix and COD trend | Pivot with Store slicer; Payment Mode in Rows, Month in Columns, % of Column Total |
| 5. Avg invoice value, invoices above ₹10,000 | Need invoice-level totals — see below |

### Invoice-level questions

Your data is at item-line level, but question 5 is about invoices. You need to total each invoice first. Two options:

- **Pivot:** Invoice No in Rows, Sum of Amount in Values. Then copy the result to a new sheet and use `=AVERAGE()` and `=COUNTIF(range, ">10000")`.
- **Excel 365 formulas:**

```excel
=UNIQUE(Sales[Invoice No])                       // in A2 of a new sheet
=SUMIFS(Sales[Amount], Sales[Invoice No], A2#)   // in B2; A2# refers to the whole spilled list
```

Then `=AVERAGE(B2#)` and `=COUNTIF(B2#, ">10000")`.

This "grain" issue — line level versus invoice level — trips up many analysts. Whenever someone asks for "average order value", confirm what an order is.

## Step 5: Check with AI, then verify

Once you've got your answers, try a second route. Upload the **clean** file to an AI assistant with data analysis capability and ask the same five questions (Lesson 4.1 covers this in depth). Compare its numbers with yours.

If they match, good. If they don't, find out why — different duplicate handling, date parsing, or line-vs-invoice confusion are the usual suspects. Resolving the gap is excellent practice and builds the verification habit.

## Step 6: Write it up

Create a `Findings` sheet with:

- A small table answering each question.
- One sentence per question in plain English, e.g. "Kurtis grew from ₹X in July to ₹Y in September, the fastest of any category, driven mainly by Online."
- A "Data notes" box: rows removed, items excluded, assumptions made.

Keep this file. You'll reuse the clean dataset for the dashboard project and the executive summary in Module 5.

## Try it yourself

This whole lesson is the exercise; allow 60–90 minutes in one or two sittings. If you're short on time, do Steps 1–3 now and Steps 4–6 tomorrow. The minimum to call it done:

1. A clean `Sales` table with a Cleaning Log.
2. Answers to all five questions, each backed by a pivot or formula.
3. A one-page Findings sheet with data notes.

## Key takeaways

- Separate Raw, Clean, mapping and log sheets keep your work auditable.
- Recalculate amounts from Qty, Rate and GST to catch typo outliers.
- Watch the grain: line-level data needs aggregating before invoice-level metrics.
- Cross-check your answers with an AI analysis, and investigate any gap.
- Always end with plain-English findings and documented assumptions.
