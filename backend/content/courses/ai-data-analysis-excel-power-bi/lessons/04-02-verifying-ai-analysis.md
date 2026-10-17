An AI-generated number that's wrong is worse than no number at all, because it looks authoritative. This lesson gives you a practical verification system so you can use AI speed without staking your reputation on unchecked figures.

## How AI analysis goes wrong

With real business data, the errors are rarely bad arithmetic. They're usually one of these:

| Failure | What it looks like | Example |
|---|---|---|
| Misparsed dates | Sales appear in months with no business | "05-08-2026" read as 8 May instead of 5 August |
| Wrong grain | Averages too low, counts too high | Average "order" value computed per item line |
| Silent filtering | Totals slightly low | Rows with blank Store dropped without mention |
| Duplicates included | Totals slightly high | Re-exported rows counted twice |
| Wrong definition | Ratio differs from your company's | Conversion = Won / All leads instead of Won / Closed |
| Units confusion | Numbers off by 100,000 | Lakhs vs rupees, or GST-inclusive vs taxable |
| Invented numbers | Figures with no calculation behind them | A chat reply quoting totals without running code |
| Plausible over-reading | Strong claims from weak patterns | "Tuesdays drive sales" from 12 data points |

Your job isn't to re-do everything. It's to run quick checks that would catch each of these.

## The five-check routine

### Check 1: Control totals

Before trusting any breakdown, confirm the grand total and row count match an independent source.

- Row count: in Excel, `=ROWS(Sales)` or the status bar count.
- Grand total: `=SUM(Sales[Amount])`.
- Ask the AI for both. If they don't match, stop and resolve before going further.

For finance-adjacent data, also compare to the source system: the billing software's monthly sales register or the GSTR-1 summary your accountant prepared. Small, explainable differences (cancelled invoices, credit notes) are normal — but you need to be able to explain them.

### Check 2: Spot-check one cell by hand

Pick one number from the AI's table — say, "Kurtis, Vaishali store, August: ₹1,84,250". Filter your Excel table for exactly those conditions and look at the status bar Sum. Or write the SUMIFS:

```excel
=SUMIFS(Sales[Amount], Sales[Category], "Kurtis", Sales[Store], "Jaipur Vaishali", Sales[Date], ">="&DATE(2026,8,1), Sales[Date], "<="&DATE(2026,8,31))
```

If one random cell matches, the logic is probably right. If it doesn't, the whole table is suspect.

### Check 3: Parts add up to the whole

Breakdowns should sum to the total. Category totals should add to monthly totals; percentage shares should add to 100%. If the AI's category table sums to ₹48.2 lakh but total sales are ₹51.0 lakh, some rows were dropped — often blanks or an unexpected spelling.

### Check 4: Sense check against the business

Ask yourself:

- Is this plausible given what I know? A 300% jump in Bedsheets in one month for a stable retailer needs an explanation (a bulk hotel order?) before it goes in a report.
- Are the signs right? Returns should reduce sales, not increase them.
- Are the magnitudes right? A Jaipur two-store retailer with ₹50 crore monthly sales would be very unusual; that's probably a units error.

### Check 5: Re-ask from a different angle

Ask the same question a different way, or in a fresh chat, and see if you get the same answer. For example: "What's total Online COD amount in September?" and separately "Show Payment Mode × Month for Online only." If the two disagree, dig in.

## Verifying claims, not just numbers

AI assistants also produce interpretations: "Online growth is driven by Bengaluru customers." Treat each claim as a hypothesis and ask:

- **What's the evidence?** "Show me the numbers behind that statement."
- **How big is the effect?** "Bengaluru online sales grew 40%" might mean ₹12,000 to ₹16,800 — not material for the business.
- **Could it be chance?** With small samples (a few dozen orders), patterns appear and vanish month to month. Ask, "How many orders is this based on?"
- **Correlation vs cause.** "Customers paying by UPI spend more" doesn't mean pushing UPI will raise bill sizes.

A good follow-up prompt:

```text
For each insight you just gave me, show:
(a) the exact numbers it's based on,
(b) the number of rows/orders behind it,
(c) one alternative explanation I should rule out.
Mark any insight based on fewer than 30 orders as "low confidence".
```

(30 is a rough rule of thumb, not a statistical law — the point is to make the sample size visible.)

## Keep an audit trail

When AI-assisted analysis goes into a report, keep a short note with it:

```text
Analysis: Q2 FY27 category performance
Source file: PCF_sales_Jul-Sep26_clean.csv (975 rows, total ₹51,02,340)
Tool: [assistant name], data analysis feature, 16-Oct-2026
Checks: control total ✔  spot-check (Kurtis/Vaishali/Aug) ✔  parts=whole ✔
Assumptions: duplicates removed on Invoice+Item; amounts incl. GST; 3 blank payment modes excluded from payment-mix only
```

This takes two minutes and protects you completely if someone questions the numbers later.

## When to rebuild instead of verify

If a number will be used for something consequential — a bonus calculation, a board deck, a tax figure, a pricing decision — don't rely on the AI's output at all. Use the AI to *find* the insight, then rebuild the key figures in your own workbook with formulas or pivots you control. The AI was your scout; your spreadsheet is the evidence.

## Try it yourself

About 15 minutes.

1. Take the AI analysis you did in Lesson 4.1 (or run a quick one now on your project file).
2. Run all five checks: control totals, one spot-check by SUMIFS, parts-sum-to-whole, a sense check, and a re-ask from a different angle.
3. Deliberately test the date trap: upload a small file with DD-MM-YYYY text dates without mentioning the format. Does the AI parse them correctly? Ask it to show the min and max date.
4. Use the "evidence, sample size, alternative explanation" prompt on the AI's insights.
5. Write an audit-trail note for your analysis.

## Key takeaways

- AI analysis errors are usually logic errors — dates, grain, filtering, definitions — not arithmetic.
- Always match control totals and row counts before trusting any breakdown.
- One SUMIFS spot-check and a parts-sum-to-whole check catch most problems.
- Treat AI interpretations as hypotheses; ask for evidence, sample size and alternatives.
- For consequential numbers, rebuild them in your own workbook and keep an audit note.
