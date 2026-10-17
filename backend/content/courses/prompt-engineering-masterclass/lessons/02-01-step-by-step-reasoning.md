Asking a model to "think step by step" is one of the best-known prompting techniques. It genuinely helps on some tasks and is pointless on others. This lesson shows you how to use reasoning prompts deliberately.

## Why reasoning helps

A language model produces its answer one piece at a time. If you ask for the final answer immediately, it has to "jump" to a conclusion. If you ask it to lay out the steps first, each step becomes context for the next, which often makes multi-step problems more accurate. It also gives *you* something to check: you can see where the logic went wrong.

Many current assistants include a "thinking" or "reasoning" mode that does some of this automatically before answering. Even then, explicitly asking for the working is useful whenever you need to verify the logic yourself.

## When to ask for step-by-step reasoning

It helps most with:

- **Calculations with several steps** — pricing, GST, EMI comparisons, margin analysis.
- **Logic and rules** — "Is this employee eligible for leave encashment under our policy?"
- **Decisions with trade-offs** — choosing between two vendors or two job offers.
- **Diagnosis** — why a formula breaks, why sales dropped in a region.
- **Planning** — breaking a project into ordered tasks.

It adds little for simple lookups, rewriting, translation, or creative writing. There, it just makes answers longer.

## Before and after

Sneha, a freelance accountant in Indore, asks:

```text
A client sold goods worth ₹2,40,000 plus 18% GST, gave a 5% discount
on the base price, and paid ₹15,000 freight which is taxable at 18%.
What is the total invoice value?
```

A quick answer might mix up whether the discount applies before tax. Her better prompt:

```text
Calculate the total invoice value for the scenario below.

Work through it step by step:
1. State any assumption you are making (e.g., discount shown on the invoice
   and therefore reducing the taxable value).
2. Compute the taxable value of goods.
3. Compute GST on goods.
4. Compute freight and GST on freight.
5. Add everything up.
Show each step with the arithmetic, then give the final total on its own line
as "TOTAL: ₹____".

Scenario:
"""
Goods ₹2,40,000 (base price). 5% discount on base price, shown on invoice.
GST 18%. Freight ₹15,000, taxable at 18%.
"""
```

Two things improved: the model must state assumptions (where most errors hide), and the final answer sits on a separate line so Sneha can find it instantly. She should still verify the numbers herself; language models can make arithmetic slips, which is exactly why visible working is valuable.

## Useful reasoning patterns

### Plan, then do

```text
Before writing the proposal, list the sections you plan to include and one
line on what each will cover. Then write the proposal following that plan.
```

### Consider alternatives

```text
Give three possible explanations for the 20% drop in repeat orders in Nagpur
last quarter, using the data below. For each, say what evidence supports it
and what evidence would rule it out. Then say which is most likely and why.
```

### Pros, cons, recommendation

```text
I have two offers: ₹9 LPA at a Hyderabad startup (hybrid) and ₹8 LPA at a
large MNC in Pune (office 5 days). Compare them on growth, stability,
commute cost and learning. Show your reasoning in a table, then give a
recommendation with the two factors that matter most for someone in their
first job.
```

### Check your work

```text
After giving your answer, re-check each step and state "Verified" or
correct any mistake you find.
```

This is not a guarantee. A model can confidently "verify" a wrong answer. But it catches a useful share of slips, and you will learn stronger self-critique methods in Lesson 2.3.

## Separating reasoning from the answer

When the output goes to someone else, you rarely want the scratch work included. Ask for both, clearly separated:

```text
First, inside <thinking> tags, reason through the problem.
Then, inside <answer> tags, give only the final client-ready reply
in under 100 words.
```

You read the thinking to check it; you copy only the answer. If your tool has a built-in reasoning mode, you can often skip the tags and simply ask for a short "how I got here" note after the answer.

## Common traps

- **Using it everywhere.** "Think step by step" on a tweet request just gives a longer tweet.
- **Trusting the steps blindly.** Reasoning that sounds logical can still contain a wrong number or a misread fact. Spot-check.
- **Not giving the rules.** If eligibility depends on your company policy, paste the policy. Reasoning without the right inputs only produces confident guesses.

## Try it yourself

Spend 15-20 minutes.

1. Pick a real multi-step problem: a pricing calculation, a "which option should we choose" decision, or a policy eligibility question.
2. Ask it directly with no reasoning instructions. Save the answer.
3. Rewrite the prompt to require stated assumptions, numbered steps and a clearly labelled final answer.
4. Check both answers yourself (calculator, policy document, or a colleague).
5. Try the `<thinking>` / `<answer>` pattern and see whether the final answer becomes cleaner.
6. Note in your Prompt Journal which tasks benefited and which didn't.

## Key takeaways

- Step-by-step reasoning improves multi-step maths, logic, diagnosis and decisions.
- It adds little to simple rewriting or creative tasks, so don't use it everywhere.
- Ask the model to state assumptions; that is where many errors hide.
- Separate the reasoning from the final answer when output goes to others.
- Visible reasoning helps you verify, but you still need to check the numbers yourself.
