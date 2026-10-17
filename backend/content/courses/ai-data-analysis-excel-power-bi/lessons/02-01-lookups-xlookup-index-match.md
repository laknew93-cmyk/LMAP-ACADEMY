Lookups are the formulas that join one table to another — pulling a product's GST rate into a sales sheet, or a sales owner's region into a leads list. This lesson covers XLOOKUP, INDEX-MATCH and VLOOKUP, with AI as your guide.

## The problem lookups solve

Pink City Fabrics has two sheets:

**Sales** (one row per invoice line)

| Invoice No | Date | Item Code | Qty | Amount |
|---|---|---|---|---|
| PCF-1041 | 03-10-2026 | SR-102 | 2 | 4,200 |
| PCF-1042 | 03-10-2026 | KR-215 | 1 | 1,150 |

**Products** (one row per item)

| Item Code | Item Name | Category | GST Rate |
|---|---|---|---|
| SR-102 | Bandhej Silk Saree | Sarees | 5% |
| KR-215 | Cotton Printed Kurti | Kurtis | 5% |

You want Category in the Sales sheet so you can summarise by category. That's a lookup: find the Item Code in Products, return the Category from the same row.

## XLOOKUP: the modern default

Available in Microsoft 365, Excel 2021 and later, and Google Sheets.

```excel
=XLOOKUP(C2, Products!A:A, Products!C:C, "Not found")
```

Read it as: *look for C2 in the Item Code column of Products, return the matching value from the Category column, and show "Not found" if there's no match.*

The full syntax:

```text
XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])
```

The last three arguments are optional. `match_mode` 0 (default) means exact match; `search_mode` -1 searches from the bottom up, which is handy for "latest entry" problems.

Why XLOOKUP beats VLOOKUP:

- The return column can be to the **left** of the lookup column.
- Inserting a column doesn't break it (no column index number to go stale).
- Exact match is the default — VLOOKUP's default is approximate, a classic source of wrong answers.
- Built-in "not found" text instead of wrapping in IFERROR.

### Returning several columns at once

In Excel 365, XLOOKUP can return multiple adjacent columns in one go:

```excel
=XLOOKUP(C2, Products!A:A, Products!B:D)
```

This spills Item Name, Category and GST Rate into three cells. If the cells to the right aren't empty, you'll see `#SPILL!` — clear them and it works.

## INDEX-MATCH: for older Excel

If your office uses Excel 2016 or 2019, XLOOKUP shows `#NAME?`. The classic equivalent is INDEX with MATCH:

```excel
=INDEX(Products!C:C, MATCH(C2, Products!A:A, 0))
```

- `MATCH(C2, Products!A:A, 0)` finds the row position of the item code (the `0` means exact match — never leave it out).
- `INDEX(Products!C:C, position)` returns the value at that position in the Category column.

To handle missing codes:

```excel
=IFERROR(INDEX(Products!C:C, MATCH(C2, Products!A:A, 0)), "Not found")
```

## VLOOKUP: know it, avoid it for new work

You'll inherit files full of VLOOKUP, so you need to read it:

```excel
=VLOOKUP(C2, Products!A:D, 3, FALSE)
```

This looks for C2 in the **first** column of A:D and returns the **3rd** column (Category). The `FALSE` forces an exact match. If someone inserts a column in Products, the 3 now points at the wrong data — and nothing warns you.

## Two-condition lookups

LeadLoop's target sheet has one row per **Owner and Month**. To fetch Priya's target for October:

Excel 365 / Google Sheets:

```excel
=XLOOKUP(1, (Targets!A:A=B2)*(Targets!B:B=C2), Targets!C:C, 0)
```

The multiplication creates an array of 1s and 0s that is 1 only where both conditions are true; XLOOKUP finds the first 1. On large sheets, use exact ranges (like `Targets!A2:A500`) rather than whole columns to keep this fast.

A simpler, version-proof alternative is a **helper column** in Targets that joins the two keys: `=A2&"|"&B2` gives "Priya|Oct-2026". Then do a normal lookup on `B2&"|"&C2`. Helper columns are easy for colleagues to understand — don't be shy about them.

## Why lookups fail (and what to ask AI)

Most `#N/A` errors come from one of these:

| Cause | Example | Fix |
|---|---|---|
| Extra spaces | "SR-102 " vs "SR-102" | Wrap in `TRIM()` or clean the source |
| Number stored as text | 1041 vs "1041" | Convert with `VALUE()` or Text to Columns |
| Genuinely missing | New item not in master | Add to master; use if_not_found |
| Approximate match | VLOOKUP without FALSE | Add FALSE / use XLOOKUP |

When a lookup fails, give the AI the specifics:

```text
This XLOOKUP returns #N/A for C15 even though I can see "KR-215" in Products!A:A.
=XLOOKUP(C15, Products!A:A, Products!C:C)
C15 was pasted from a billing software export. What could be wrong and how do I check?
```

A good assistant will suggest checks such as `=LEN(C15)` (to spot hidden spaces) and `=ISNUMBER(C15)` (to spot type mismatches), and `=C15=Products!A7` to test equality directly.

## Prompt to keep handy

```text
Excel version: [365/2019/Sheets]
I have [Sheet A] with key column [X] and [Sheet B] with key column [Y] and the value I want in column [Z].
Write a lookup that brings [Z] into Sheet A, shows "Not found" for missing keys, and is robust to extra spaces.
Give me an XLOOKUP version and an INDEX-MATCH version, and explain both.
```

## Try it yourself

About 15 minutes.

1. Create the Sales and Products sheets above with 10 sales rows and 5 products. Deliberately add one item code in Sales that isn't in Products, and one with a trailing space.
2. Write an XLOOKUP (or INDEX-MATCH if you're on older Excel) to bring in Category, with "Not found" for missing codes.
3. Note which rows fail. Ask an AI why, using the debugging prompt above.
4. Fix the trailing-space row using `TRIM` inside the lookup: `=XLOOKUP(TRIM(C2), Products!A:A, Products!C:C, "Not found")`.
5. Add a second lookup that brings in GST Rate, then a third column for GST amount on a GST-inclusive Amount: `=E2 - E2/(1+G2)`, where G2 is the GST rate.

## Key takeaways

- XLOOKUP is the modern default: exact match by default, works left or right, has built-in "not found".
- On Excel 2016/2019, use INDEX-MATCH with `0` as the match type.
- Read VLOOKUP in old files, but avoid it in new work — inserted columns silently break it.
- Most `#N/A` errors are spaces, text-vs-number mismatches, or genuinely missing keys.
- Use helper columns for multi-condition lookups when colleagues need to maintain the file.
