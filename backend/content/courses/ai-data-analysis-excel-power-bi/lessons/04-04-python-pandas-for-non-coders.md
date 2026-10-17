This lesson is optional, but it may surprise you. With AI writing the code, people who have never programmed can use Python to clean and summarise files that are too big or too repetitive for Excel. You won't become a programmer here — you'll learn enough to run, read and adapt AI-written code safely.

## Why bother when you have Excel?

Excel is excellent up to a point. Python with the pandas library helps when:

- Files are large (hundreds of thousands of rows) and Excel slows down.
- You receive 12 monthly CSVs and need to combine them every time.
- The same 15 cleaning steps happen every month.
- You want a record of exactly what was done, step by step.

Power Query (Lesson 3.1) also solves many of these, and for many MIS roles it's enough. Python is worth knowing because it's widely used in analyst roles and AI writes it very fluently.

## Your setup: Google Colab

You don't need to install anything. Go to **colab.research.google.com**, sign in with a Google account, and click **New notebook**. A notebook is a page of "cells"; you paste code into a cell and press **Shift + Enter** to run it. pandas is already available.

To upload a file, click the folder icon on the left and the upload button, or run:

```python
from google.colab import files
uploaded = files.upload()
```

The same privacy rules apply: Colab runs on Google's servers, so use masked or practice data unless your organisation has approved it.

## Reading AI-written code: the 10 lines you'll see most

Here's a typical script an AI might write to clean and summarise Pink City Fabrics' sales. Read the comments (lines starting with `#`) — they explain each step in plain English.

```python
import pandas as pd

# 1. Read the CSV file into a table called df ("data frame")
df = pd.read_csv("pcf_sales_jul_sep_2026.csv")

# 2. Look at the first 5 rows and the column types
print(df.head())
print(df.dtypes)

# 3. Clean city names: remove spaces, fix capitals, map variants
df["Customer City"] = df["Customer City"].str.strip().str.title()
df["Customer City"] = df["Customer City"].replace({"Jpr": "Jaipur", "Bangalore": "Bengaluru"})

# 4. Convert dates; dayfirst=True because Indian dates are DD-MM-YYYY
df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")

# 5. Remove "Rs" and commas from Amount, then make it a number
df["Amount incl GST"] = (
    df["Amount incl GST"].astype(str)
    .str.replace("Rs", "", regex=False)
    .str.replace(",", "", regex=False)
    .str.strip()
)
df["Amount incl GST"] = pd.to_numeric(df["Amount incl GST"], errors="coerce")

# 6. Remove duplicate rows based on Invoice No + Item
before = len(df)
df = df.drop_duplicates(subset=["Invoice No", "Item"])
print("Removed duplicates:", before - len(df))

# 7. Add a Month column
df["Month"] = df["Date"].dt.to_period("M")

# 8. Summary: total sales by Category and Month (like a pivot table)
summary = df.pivot_table(
    index="Category", columns="Month",
    values="Amount incl GST", aggfunc="sum", fill_value=0
)
print(summary)

# 9. Save the clean data and summary to Excel
with pd.ExcelWriter("pcf_clean_output.xlsx") as writer:
    df.to_excel(writer, sheet_name="Clean", index=False)
    summary.to_excel(writer, sheet_name="Summary")
```

After running, download `pcf_clean_output.xlsx` from the Colab file panel.

### Things worth noticing

- **`dayfirst=True`** — the same DD/MM issue from Module 3. Always check that the AI included it for Indian dates.
- **`errors="coerce"`** turns unparseable values into blanks (`NaT` for dates, `NaN` for numbers) instead of crashing. Useful — but it can hide problems. Add a check:

```python
print("Unparsed dates:", df["Date"].isna().sum())
print("Unparsed amounts:", df["Amount incl GST"].isna().sum())
```

- **`pivot_table`** is pandas' pivot table. `index` = Rows, `columns` = Columns, `values` + `aggfunc` = Values.
- **`groupby`** is the other summarising tool you'll see often:

```python
df.groupby("Store")["Amount incl GST"].sum().sort_values(ascending=False)
```

Read it as: group by Store, take the Amount column, sum it, sort largest first.

## How to ask AI for pandas code

Give the same context you'd give for an Excel formula, plus your environment:

```text
I'm a beginner using Google Colab. Write pandas code to:
1. Read "leads_oct26.csv" with columns Lead_ID, Created_On (DD-MM-YYYY), Source, Owner, Stage, Deal_Value.
2. Print row count, and count of blank values per column.
3. For each Source, calculate total leads, Won, Lost and win rate = Won / (Won + Lost).
4. Save the result to "source_summary.xlsx".
Add a comment above every line explaining it in simple English.
Print the row counts at each step so I can verify nothing was lost.
```

The last instruction is the key to safe beginner use: **row counts at every step**.

## When it errors

You will see errors. That's normal. Copy the **entire** error message (the last line is usually the most important) and paste it back:

```text
I ran your code and got this error on step 4:
KeyError: 'Created_On'
Here are my actual column names: ['Lead ID', 'Created On', 'Source', ...]
```

Most beginner errors are column names that don't match exactly (spaces, capitals) or a file name typo. Running `print(df.columns.tolist())` early shows you the exact names.

## Combining monthly files

Here's where Python shines for MIS work. If you have twelve files named like `sales_2026_04.csv`, `sales_2026_05.csv` and so on, uploaded to Colab:

```python
import pandas as pd
import glob

files = sorted(glob.glob("sales_2026_*.csv"))
print("Files found:", files)

df = pd.concat([pd.read_csv(f) for f in files], ignore_index=True)
print("Total rows:", len(df))
```

Two lines of real work, and every month you just add the new file and run it again.

## Safety rules for running AI code

- Only run code you've asked for, on data you're allowed to use.
- Read the comments; if a step does something you didn't ask for (deleting files, sending data to a website), don't run it — ask why.
- Work on copies; never point code at your only copy of a file.
- Verify outputs with control totals, exactly as in Lesson 4.2.

## Try it yourself

About 20 minutes.

1. Open Google Colab and create a new notebook.
2. Upload your practice sales CSV from the Lesson 3.3 project (the raw, messy version).
3. Ask an AI for commented pandas code that cleans it the way you did in Excel, printing row counts at each step.
4. Run it cell by cell. Fix at least one error by pasting it back to the AI.
5. Compare the final row count and total amount with your Excel-cleaned version. Investigate any difference.

## Key takeaways

- Python with pandas handles large files and repeated cleaning that strains Excel; Google Colab needs no installation.
- You don't need to write code from scratch — you need to read comments, run cells and verify results.
- Check for `dayfirst=True` on Indian dates and count values that failed to parse.
- Ask for comments on every line and row counts at every step.
- Paste full error messages back to the AI; most beginner errors are mismatched column names.
