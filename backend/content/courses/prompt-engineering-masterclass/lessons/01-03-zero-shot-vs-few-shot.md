Sometimes describing what you want is harder than showing it. This lesson covers zero-shot prompting (instructions only) and few-shot prompting (instructions plus examples), and when to use each.

## Zero-shot: instructions only

A zero-shot prompt gives the task with no examples:

```text
Classify this customer review as Positive, Negative or Mixed.

Review: "Delivery was quick but the kurta colour is nothing like the photo."
```

Modern models handle many tasks well zero-shot, especially common ones like summarising, translating or answering general questions. Zero-shot is fast to write and works when the task is well understood and the "right" answer is fairly obvious.

## Few-shot: show, don't just tell

A few-shot prompt includes two to five worked examples before the real input. The model picks up the pattern: the labels, the tone, the length, the edge cases.

Meera runs customer support for a Chennai electronics e-commerce store. She wants tickets tagged with her team's own categories, which don't match any textbook:

```text
Tag each support message with exactly one category:
DELIVERY, REFUND, WARRANTY, INSTALLATION, OTHER.
Reply with the category only.

Message: "Technician hasn't come to fix the AC stand yet, it's been 3 days."
Category: INSTALLATION

Message: "I returned the mixer on 2nd, when will money reach my UPI?"
Category: REFUND

Message: "Screen has a line after 8 months, is this covered?"
Category: WARRANTY

Message: "Courier says address not found, but I gave full address with landmark."
Category: DELIVERY

Message: "Can I change the colour of the fridge I ordered yesterday?"
Category:
```

Without the examples, the model might answer "Order modification" or write a full sentence. With them, it reliably follows the format and Meera's definitions.

## When few-shot is worth it

Use examples when:

- **You have a house style** — a brand voice, a report format, a specific way of writing LinkedIn posts.
- **Labels are custom** — your categories, priorities or scoring scale.
- **Format must be exact** — output will be pasted into Excel or another system.
- **The task is subtle** — "rewrite in a friendlier tone" means different things to different people.
- **Zero-shot keeps drifting** — if you correct the same issue twice, add an example instead.

Skip examples when the task is generic, when you don't yet know what good looks like, or when examples might box in creativity (brainstorming, for instance).

## Choosing good examples

Bad examples teach bad habits. A few rules:

1. **Make them representative.** Use realistic inputs, not toy ones.
2. **Cover the variety.** If messages can be in Hinglish, include one Hinglish example.
3. **Include a tricky case.** Show how to handle the edge case you care about, such as a message that fits two categories.
4. **Keep them consistent.** Same labels, same format, same length in every example. Models copy inconsistencies too.
5. **Don't let them be too similar to each other.** Three examples that all start "Dear Sir" will make every output start "Dear Sir".

### Before and after: brand voice

Before:

```text
Write a product description for our handloom cotton saree. Make it elegant.
```

After:

```text
Write a product description for the saree below in our brand voice.
Match the style, length and structure of these two examples exactly.

Example 1:
Product: Indigo dabu print dupatta
Description: Hand-block printed in Bagru with mud-resist dabu. Soft mul cotton
that drapes easily and softens with every wash. A quiet indigo for everyday wear.

Example 2:
Product: Kanchi cotton saree, mustard
Description: Woven on pit looms near Kanchipuram. Breathable cotton with a
contrast temple border. Light enough for a full working day in May.

Now write:
Product: Handloom cotton saree, sage green with zari border, from Chanderi
Description:
```

The examples quietly communicate three-sentence length, origin first, a tactile detail, and a practical use-case ending. Writing all of that as instructions would be longer and less effective.

## Describing plus showing

The strongest pattern combines both: a short instruction explaining the rule, then examples demonstrating it. If your instruction and examples ever conflict, the model usually follows the examples, so check them carefully.

You can also use **negative examples**, clearly labelled:

```text
Good subject line: "Your March GST summary is ready — 2 items need action"
Bad subject line: "URGENT!!! Important GST Update Inside"
Write subject lines like the good one, never like the bad one.
```

## How many examples?

There is no magic number. Two or three are usually enough for format and style. Classification tasks with many labels may need one per label. Beyond five or six, you often get diminishing returns and a longer, costlier prompt. Start small and add an example only when you see a specific failure.

## Try it yourself

Spend 15-20 minutes.

1. Pick a classification or rewriting task from your work: tagging emails, rating leads as Hot/Warm/Cold, rewriting notices for parents in simple English.
2. Collect 8 real (or realistic, anonymised) inputs.
3. Write a zero-shot prompt and run it on all 8. Note how many outputs are exactly right.
4. Now add 3 examples, including one tricky case, and run the same 8 inputs again.
5. Compare the scores. Record both prompts and results in your Prompt Journal.

## Key takeaways

- Zero-shot means instructions only; it works for common, well-defined tasks.
- Few-shot adds examples so the model copies your format, labels and style.
- Choose realistic, varied, consistent examples and include at least one edge case.
- Combine a short rule with examples; if they conflict, models tend to follow the examples.
- Add examples in response to specific failures rather than by default.
