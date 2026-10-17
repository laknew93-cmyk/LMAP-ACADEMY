Real-world sheets need decisions ("is this invoice overdue?"), text surgery ("pull the state code out of the GSTIN") and date arithmetic ("which financial year is this?"). This lesson covers the IF family, text functions and date functions — the everyday toolkit an AI can help you combine.

## IF, AND, OR

The basic shape:

```text
IF(condition, value_if_true, value_if_false)
```

Flag high-value orders at Pink City Fabrics:

```excel
=IF(I2>=10000, "High", "Regular")
```

Combine conditions with AND (all must be true) or OR (any can be true). Flag Online orders paid by COD above ₹5,000 for verification:

```excel
=IF(AND(C2="Online", K2="COD", I2>5000), "Verify", "")
```

### Several outcomes: IFS or nested IF

Categorise invoice size into bands. In Excel 2019+, Microsoft 365 and Google Sheets, IFS reads cleanly:

```excel
=IFS(I2>=25000, "Large", I2>=10000, "Medium", I2>=2000, "Small", TRUE, "Micro")
```

IFS checks conditions in order and stops at the first true one, so put the biggest threshold first. The final `TRUE` acts as "everything else".

In older Excel, the nested-IF version:

```excel
=IF(I2>=25000, "Large", IF(I2>=10000, "Medium", IF(I2>=2000, "Small", "Micro")))
```

When you inherit a monster nested IF, paste it into an AI with "Explain this formula as a decision table". You'll get something like:

| If amount is... | Result |
|---|---|
| ≥ 25,000 | Large |
| 10,000 – 24,999 | Medium |
| 2,000 – 9,999 | Small |
| below 2,000 | Micro |

That table is also great documentation to leave in the file for the next person.

### GST split: CGST/SGST vs IGST

For a Rajasthan-registered seller, intra-state sales attract CGST + SGST; inter-state sales attract IGST. If Amount (I2) includes GST, the GST rate is in J2 (e.g. 5%), and the customer state is in D2:

```excel
Taxable value:  =ROUND(I2/(1+J2), 2)
Total GST:      =I2 - ROUND(I2/(1+J2), 2)
CGST:           =IF(D2="Rajasthan", (I2 - ROUND(I2/(1+J2),2))/2, 0)
SGST:           =IF(D2="Rajasthan", (I2 - ROUND(I2/(1+J2),2))/2, 0)
IGST:           =IF(D2<>"Rajasthan", I2 - ROUND(I2/(1+J2),2), 0)
```

In practice you'd reference the Taxable column instead of repeating the calculation. This is illustrative logic for analysis — your accountant or billing software remains the authority on actual tax treatment.

## Text functions

Billing and CRM exports are full of text that needs trimming, splitting or standardising.

| Function | What it does | Example | Result |
|---|---|---|---|
| `TRIM(A2)` | Removes extra spaces | " Jaipur  " | "Jaipur" |
| `PROPER(A2)` | Capitalises Each Word | "PINK CITY" | "Pink City" |
| `UPPER` / `LOWER` | Changes case | "kr-215" | "KR-215" |
| `LEFT(A2,n)` | First n characters | "08ABCDE1234F1Z5", 2 | "08" |
| `MID(A2,start,n)` | Characters from the middle | GSTIN, 3, 10 | the embedded PAN |
| `RIGHT(A2,n)` | Last n characters | "9876543210", 4 | "3210" |
| `LEN(A2)` | Number of characters | "SR-102 " | 7 (spots a hidden space) |
| `SUBSTITUTE(A2,old,new)` | Replaces text | "Rs. 1,200" | "1,200" |

A GSTIN's first two digits are the state code (08 is Rajasthan, 29 is Karnataka, 27 is Maharashtra). To pull it out as a number:

```excel
=VALUE(LEFT(F2, 2))
```

Splitting "Priya Sharma" into first name — the classic formula:

```excel
=LEFT(A2, FIND(" ", A2) - 1)
```

In Microsoft 365, TEXTBEFORE and TEXTAFTER are simpler: `=TEXTBEFORE(A2, " ")`. In Google Sheets, `=SPLIT(A2, " ")` splits into separate cells, and REGEXEXTRACT handles harder patterns. Ask the AI for the version that matches your tool.

Converting "Rs. 1,200/-" text into a number:

```excel
=VALUE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(A2, "Rs.", ""), ",", ""), "/-", ""))
```

## Date functions

Dates in Excel are numbers (days since 1900) formatted to look like dates. That's why you can subtract them.

Days since a lead was created:

```excel
=TODAY() - B2
```

Month label for reports:

```excel
=TEXT(B2, "mmm-yy")
```

This returns text like "Oct-26" — good for display, but text sorts alphabetically (Apr before Jan). For grouping, prefer a real date such as the first of the month: `=EOMONTH(B2,-1)+1`.

Working days to close a deal (excluding weekends and a holiday list in H2:H20):

```excel
=NETWORKDAYS(B2, I2, $H$2:$H$20)
```

### Indian financial year label

For a date in B2, return "FY2026-27" style labels:

```excel
=IF(MONTH(B2)>=4, "FY"&YEAR(B2)&"-"&RIGHT(YEAR(B2)+1,2), "FY"&(YEAR(B2)-1)&"-"&RIGHT(YEAR(B2),2))
```

For 15-Oct-2026 this gives FY2026-27; for 10-Feb-2027 it also gives FY2026-27. Financial quarter (Q1 = Apr–Jun):

```excel
="Q"&(INT(MOD(MONTH(B2)-4, 12)/3) + 1)
```

It works (MOD shifts April to month 0), but it's hard to read at a glance. A version anyone can audit is:

```excel
=CHOOSE(MONTH(B2), "Q4","Q4","Q4","Q1","Q1","Q1","Q2","Q2","Q2","Q3","Q3","Q3")
```

When an AI gives you a clever one-liner, it's fine to ask, "Give me a simpler version a colleague can read." Readable beats clever in shared files.

## Try it yourself

About 20 minutes.

1. In a new sheet, add 10 rows with columns: Invoice Date, Customer State, Amount incl GST, GST Rate (5% or 12%), Customer GSTIN (make some up starting with 08, 29, 27).
2. Add columns for Taxable Value, CGST, SGST and IGST using the formulas above.
3. Add a "State Code" column using LEFT and VALUE on the GSTIN.
4. Add FY label and FY quarter columns. Check that a March date and an April date fall in different FYs.
5. Ask an AI to combine your IGST and CGST formulas into a single "Tax Type" column that returns "Intra-state" or "Inter-state", and verify it on three rows.

## Key takeaways

- Use IF with AND/OR for flags, and IFS (or nested IF in old Excel) for bands — biggest threshold first.
- Ask AI to turn nested IFs into decision tables for easy understanding and documentation.
- TRIM, PROPER, LEFT/MID/RIGHT, SUBSTITUTE and VALUE fix most messy text.
- Dates are numbers; use EOMONTH for month starts and a MONTH>=4 test for Indian financial years.
- Prefer readable formulas over clever ones in shared files.
