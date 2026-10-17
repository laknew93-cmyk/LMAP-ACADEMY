Every analysis is only as good as the data underneath it. This lesson gives you a repeatable cleaning routine for the mess Indian business data usually comes with — duplicate invoices, five spellings of the same city, and dates that are secretly text.

## Rule zero: never clean the original

Make a copy of the raw file and keep it untouched. Do all cleaning on the copy, ideally in a new sheet called `Clean`. If something goes wrong, you can always go back. Many analysts also keep a short `Cleaning Log` sheet listing what they changed — useful when your manager asks why your total differs from the billing software's.

## Step 1: Profile before you fix

Before changing anything, understand what's there. For each important column, ask:

- How many rows? Any completely blank rows?
- How many unique values? (Five stores is plausible; 23 "stores" means spelling chaos.)
- Are numbers really numbers? Are dates really dates?
- Any obvious outliers — a ₹0 invoice, a ₹99,99,999 typo?

Quick profiling formulas:

```excel
=COUNTA(Sales[Store])               // non-blank entries
=COUNTBLANK(Sales[Store])           // blanks
=ROWS(UNIQUE(Sales[Store]))         // number of distinct values (Excel 365 / Sheets)
=SUMPRODUCT(--ISTEXT(Sales[Date]))  // dates stored as text
=MIN(Sales[Amount]) / =MAX(Sales[Amount])
```

A faster trick: click the filter dropdown on a column. The list of values shows spelling variants instantly.

You can also paste the column's distinct values into an AI and ask for a profile:

```text
Here are the distinct values in the "Customer City" column of a Jaipur retailer's sales data.
Group the ones that are probably the same city and suggest one standard spelling for each.
Flag anything you're unsure about rather than guessing.
[paste list]
```

## Step 2: Remove duplicates — carefully

Duplicates appear when a billing export is run twice, or two branch files overlap. But not every repeated row is a duplicate: two customers can buy the same saree on the same day for the same price.

Decide what makes a row unique. For Pink City Fabrics it's **Invoice No + Item Code** (one invoice can have several items).

Flag duplicates before deleting anything. Add a helper column:

```excel
=COUNTIFS($A$2:A2, A2, $D$2:D2, D2)
```

where A is Invoice No and D is Item Code. The expanding range (`$A$2:A2`) counts how many times this combination has appeared **so far**, so the first occurrence shows 1 and repeats show 2, 3… Filter for values greater than 1, review them, then delete.

Alternatively, use **Data > Remove Duplicates** and tick only the key columns. Note the count Excel reports in your Cleaning Log ("Removed 37 duplicate invoice lines").

## Step 3: Standardise text

Typical fixes, in order:

1. **Remove extra spaces:** `=TRIM(B2)`. Text pasted from websites can contain non-breaking spaces that TRIM misses; use `=TRIM(SUBSTITUTE(B2, CHAR(160), " "))`.
2. **Fix case:** `=PROPER(TRIM(B2))` turns " jaipur" into "Jaipur".
3. **Map variants to a standard name.** Build a small two-column mapping table:

| Raw | Standard |
|---|---|
| JPR | Jaipur |
| Jaipur City | Jaipur |
| Bangalore | Bengaluru |
| Bengaluru Urban | Bengaluru |
| Gurgaon | Gurugram |

Then:

```excel
=XLOOKUP(PROPER(TRIM(B2)), CityMap[Raw], CityMap[Standard], PROPER(TRIM(B2)))
```

If the cleaned value is in the map, it returns the standard name; otherwise it keeps the cleaned value. Note that the Raw column must contain the PROPER-cased versions ("Jpr" rather than "JPR") for this to match — or apply PROPER to the map too. An AI is great at drafting this mapping table from your list of distinct values, but **review every row** — it might merge "Raipur" into "Jaipur" if they look like a typo.

Also use **Find & Replace** (Ctrl + H) for quick one-off fixes, and **Flash Fill** (Ctrl + E) in Excel to extract patterns — type the desired result in the first two cells, press Ctrl + E, and Excel fills the rest.

## Step 4: Fix dates

Date problems are the most dangerous because they often look fine.

**Spot text dates:** real dates align right by default; text aligns left. `=ISNUMBER(B2)` returns FALSE for text dates.

**DD/MM vs MM/DD confusion:** Indian files use DD/MM/YYYY, but a system set to US format may read "05/10/2026" as 10 May instead of 5 October. Symptoms: no dates after the 12th of any month appear in some months, or "13/10/2026" stays as text while "12/10/2026" converts.

Fixes:

- **Text to Columns:** select the column, Data > Text to Columns > Delimited > Next > Next > choose **Date: DMY** > Finish. This converts DD/MM text into real dates correctly.
- **Formula for fixed-format text** like "05-10-2026":

```excel
=DATE(RIGHT(B2,4), MID(B2,4,2), LEFT(B2,2))
```

- **Mixed formats** — if a column has some real dates and some text, combine:

```excel
=IF(ISNUMBER(B2), B2, DATE(RIGHT(B2,4), MID(B2,4,2), LEFT(B2,2)))
```

After converting, format the column as a date and check: are all values within the expected period? `=MIN()` and `=MAX()` on the column catch strays like 1900 or 2062.

## Step 5: Fix numbers

- Remove currency text: `=VALUE(SUBSTITUTE(SUBSTITUTE(J2,"₹",""),",",""))`.
- Numbers stored as text show a small green triangle; select them, click the warning icon, choose **Convert to Number**.
- Decide what blanks mean. A blank discount probably means zero; a blank amount means something is wrong. Don't fill blanks blindly.

## Step 6: Handle outliers thoughtfully

Sort by Amount descending and look at the top 10 and bottom 10. A ₹4,50,000 invoice from a retailer whose average bill is ₹2,500 could be a wholesale order or a typo. **Ask, don't delete.** Flag it in a column and note it in your Cleaning Log.

## Power Query: cleaning you only do once

If you receive the same messy export every month, use **Power Query** (Data > Get Data, in Excel 2016 and later on Windows). Every cleaning step — trim, replace, change type, remove duplicates — is recorded. Next month, drop in the new file and click **Refresh**. You'll use this in the automated report lesson. AI assistants can also explain or write Power Query (M) steps if you describe what you need.

## Try it yourself

About 20 minutes.

1. Ask an AI to generate 40 rows of messy sales data: city spelling variants (Jaipur/JPR/jaipur), 3 duplicate invoice lines, dates mixing DD-MM-YYYY text and real dates, and amounts like "Rs 1,250".
2. Profile it: count distinct cities, text dates and min/max amount.
3. Flag and remove duplicates using the COUNTIFS helper column.
4. Build a city mapping table and apply it with XLOOKUP.
5. Convert all dates to real dates and amounts to numbers.
6. Write a 5-line Cleaning Log of what you changed.

## Key takeaways

- Never clean the original; work on a copy and keep a Cleaning Log.
- Profile first: distinct values, text dates, blanks, min and max.
- Define what makes a row unique before removing duplicates.
- Use a mapping table for name variants — let AI draft it, but review every row.
- Check dates for DD/MM vs MM/DD problems; Text to Columns with DMY is your friend.
