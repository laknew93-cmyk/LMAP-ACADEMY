Your second portfolio project is a data analyst agent: upload a sales CSV, ask questions in plain English, and the agent explores the data with safe tools and does exact maths with a calculator. Business teams everywhere want "ChatGPT for our Excel sheets", and building it safely shows you understand both agents and risk.

## The design

The tempting shortcut is to let the model write and execute arbitrary pandas code. That is powerful and dangerous: generated code could read files, call the network or loop forever. Instead we give the agent **narrow, safe tools**:

| Tool | What it does |
|---|---|
| `describe_data` | Column names, types, row count and a few sample rows |
| `aggregate` | Optional filter, optional group-by, then sum/mean/count/min/max of a column |
| `calculator` | Evaluates arithmetic safely (no code execution) |

Narrow tools make the agent more reliable too: fewer ways to go wrong, and every step is easy to log and explain.

Sample data, `sales.csv`, for a fictional Surat textile wholesaler:

```text
date,city,product,units,revenue_inr
2026-07-03,Mumbai,Cotton Saree,40,52000
2026-07-05,Pune,Silk Saree,12,66000
2026-07-09,Mumbai,Silk Saree,8,44000
2026-08-02,Ahmedabad,Cotton Saree,55,71500
2026-08-14,Pune,Kurti Fabric,120,36000
2026-09-01,Mumbai,Kurti Fabric,90,27000
```

Add 20-30 more rows of your own so the answers are interesting.

## The tools

Create `data_tools.py`:

```python
import ast
import operator as op

import pandas as pd

df = pd.read_csv("sales.csv", parse_dates=["date"])
df["month"] = df["date"].dt.strftime("%Y-%m")

AGGS = {"sum", "mean", "count", "min", "max"}


def describe_data() -> str:
    info = {c: str(t) for c, t in df.dtypes.items()}
    return (f"Rows: {len(df)}\nColumns and types: {info}\n"
            f"Sample:\n{df.head(5).to_string(index=False)}")


def aggregate(column: str, agg: str, group_by: str | None = None,
              filter_column: str | None = None, filter_value: str | None = None) -> str:
    for c in [column, group_by, filter_column]:
        if c and c not in df.columns:
            raise ValueError(f"Unknown column '{c}'. Valid: {list(df.columns)}")
    if agg not in AGGS:
        raise ValueError(f"agg must be one of {sorted(AGGS)}")
    data = df
    if filter_column and filter_value is not None:
        data = data[data[filter_column].astype(str).str.lower() == filter_value.lower()]
    if data.empty:
        return "No rows match that filter."
    if group_by:
        result = data.groupby(group_by)[column].agg(agg).sort_values(ascending=False)
        return result.head(50).to_string()
    return str(data[column].agg(agg))


OPS = {ast.Add: op.add, ast.Sub: op.sub, ast.Mult: op.mul, ast.Div: op.truediv,
       ast.Mod: op.mod, ast.USub: op.neg, ast.UAdd: op.pos}


def calculator(expression: str) -> str:
    def ev(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](ev(node.left), ev(node.right))
        if isinstance(node, ast.UnaryOp) and type(node.op) in OPS:
            return OPS[type(node.op)](ev(node.operand))
        raise ValueError("Only numbers and + - * / % ( ) are allowed")
    return str(round(ev(ast.parse(expression, mode="eval").body), 4))
```

How it stays safe:

- `aggregate` checks every column name against the real columns and the aggregation against a whitelist. The model can only ask questions, never modify data.
- Errors list the valid options, so when the model guesses a wrong column ("revenue" instead of "revenue_inr"), it can correct itself on the next step.
- Results are capped at 50 rows, keeping tool output small.
- `calculator` parses the expression into a syntax tree and evaluates only numbers and basic operators. Never use Python's `eval()` on model output; it would execute any code.

## Tool definitions and the agent

Create `analyst.py`, reusing `run_agent` from the previous lesson:

```python
from agent import run_agent
from data_tools import aggregate, calculator, describe_data

TOOLS = [
    {"name": "describe_data",
     "description": "Show columns, types, row count and sample rows. Call this first.",
     "input_schema": {"type": "object", "properties": {}}},
    {"name": "aggregate",
     "description": ("Aggregate one numeric column, optionally filtered by an exact "
                     "match on one column and grouped by another. Use 'month' "
                     "(YYYY-MM) for monthly questions."),
     "input_schema": {"type": "object", "properties": {
         "column": {"type": "string"},
         "agg": {"type": "string", "enum": ["sum", "mean", "count", "min", "max"]},
         "group_by": {"type": "string"},
         "filter_column": {"type": "string"},
         "filter_value": {"type": "string"}},
         "required": ["column", "agg"]}},
    {"name": "calculator",
     "description": "Evaluate arithmetic like '(71500-52000)/52000*100'. Use for ALL maths.",
     "input_schema": {"type": "object", "properties": {"expression": {"type": "string"}},
                      "required": ["expression"]}},
]

SYSTEM = """You are a data analyst for a textile wholesaler.
Answer questions about sales.csv using only the tools.
- Start by calling describe_data if you have not seen the columns.
- Never estimate numbers; get them from aggregate and do maths with calculator.
- Format money as Indian rupees with lakh-style commas (e.g. ₹1,52,000).
- End with a one-line summary of how you computed the answer."""

FUNCTIONS = {"describe_data": describe_data, "aggregate": aggregate, "calculator": calculator}

if __name__ == "__main__":
    while (q := input("\nQuestion (blank to quit): ").strip()):
        print(run_agent(q, SYSTEM, TOOLS, FUNCTIONS, max_steps=10))
```

Try these questions:

```text
Which city had the highest total revenue?
What is the average revenue per unit for Silk Saree?
By what percentage did total revenue change from July to August 2026?
```

For the percentage question, watch the trace: the agent should describe the data, aggregate revenue by month, then call the calculator with the two totals. That multi-step chain, decided by the model, is exactly what makes this an agent rather than a fixed workflow.

## Why this design interviews well

When you present this project, highlight the decisions, not just the demo:

- **Safe tools instead of code execution**, and why.
- **Self-correction**: show a trace where a wrong column name is fixed after an error message.
- **Exact maths** via a calculator rather than trusting the model's arithmetic.
- **Limits**: step cap, output cap, read-only data access.
- **Evaluation**: a list of 10 questions with known answers (computed by you in pandas) and the agent's score.

If you later need more flexible analysis, hosted options exist, such as Anthropic's server-side code execution tool, which runs model-written code in a sandbox managed by the provider. Choose based on how much flexibility you need versus how much risk you can accept.

## Try it yourself

About 20 minutes:

1. Create `sales.csv` with at least 25 rows across 3-4 cities, 3 products and 3 months.
2. Run the analyst and ask the three questions above. Verify each answer with your own pandas code.
3. Ask a question that needs a filter and a group-by together: "Monthly units of Kurti Fabric in Pune."
4. Ask "Delete all Mumbai rows" and confirm the agent explains it cannot.
5. Write 8 test questions with correct answers and score the agent. Note any failure and its cause.

## Key takeaways

- Give agents narrow, validated, read-only tools instead of arbitrary code execution.
- Helpful error messages (listing valid columns) let agents self-correct.
- Use a safe calculator for maths; never `eval()` model output.
- Instruct the agent to start by inspecting the data and to explain how it computed answers.
- Present design decisions and evaluation results, not just a demo.
