The difference between a useless AI answer and a brilliant one is usually the prompt. In this lesson you'll learn a simple five-part formula that works in every assistant, plus the art of follow-up messages.

## Why most prompts disappoint

Here's a typical first prompt:

```text
Write an email to my client.
```

The assistant has no idea who the client is, what the email is about, what tone you want or how long it should be. So it produces a generic template that you'll spend more time fixing than writing yourself.

Now compare:

```text
You are an experienced account manager at a digital marketing agency in Mumbai.
Write an email to Mr. Deshmukh, owner of a chain of 4 sweet shops, explaining that his Diwali ad campaign will launch 3 days late because the festive creatives need his approval.
Ask him to approve the attached designs by Thursday 5 pm.
Keep it under 120 words, polite but firm, and end with a clear next step.
```

Same assistant, completely different result. The second prompt took 40 seconds longer to write and saved 10 minutes of editing.

## The RTCFT formula

Good prompts usually have five parts. Remember them as **RTCFT**: Role, Task, Context, Format, Tone.

| Part | Question it answers | Example |
|---|---|---|
| **Role** | Who should the AI act as? | "You are a senior HR manager…" |
| **Task** | What exactly should it do? | "Write a job description for…" |
| **Context** | What background does it need? | "We are a 30-person CA firm in Chennai…" |
| **Format** | What should the output look like? | "Bullet points, under 200 words, with a table" |
| **Tone** | How should it sound? | "Warm, professional, no jargon" |

You don't need all five every time. A quick question needs only the task. But when the output matters, run through the checklist.

### Context is the most important part

If you remember only one thing: **context beats clever wording.** Tell the assistant who the audience is, why you're writing, what has already happened, and any constraints (word limits, deadlines, things to avoid). The assistant can't read your mind, but it uses every detail you give it.

## Give examples when style matters

If you want output in a particular style, show it an example. This is often called "few-shot" prompting.

```text
Here are two product descriptions from our online saree store that customers liked:

1. "Soft Chanderi silk in morning-sky blue, with a delicate zari border. Light enough for office, elegant enough for a sangeet."
2. "Hand-block printed Jaipur cotton in terracotta. Breathable, easy to drape, made for long summer days."

In the same style and length, write descriptions for:
- A maroon Kanjivaram silk with gold temple border
- A pastel green linen saree with a simple woven stripe
```

The assistant picks up length, rhythm and vocabulary from the examples far better than from a description like "elegant and short".

## Follow-ups are where the magic happens

Your first prompt rarely gives the perfect answer, and that's fine. The real skill is **iterating**. Useful follow-ups:

- `Make it shorter — under 80 words.`
- `More formal, this is going to a government department.`
- `Too salesy. Make it sound like a helpful friend.`
- `Give me 3 different versions so I can choose.`
- `Keep everything but rewrite the first line to be more attention-grabbing.`
- `Turn this into a table.`
- `What questions should you ask me to make this better?`

That last one is powerful. When you're not sure what context to give, let the assistant interview you:

```text
I need to write a proposal for a corporate client for our office catering service. Before you write anything, ask me the 5 most important questions you need answered to write a strong proposal.
```

## Five prompting habits that save time

1. **Start a new chat for a new topic.** Old conversation details can confuse unrelated tasks.
2. **Paste the actual material.** Instead of "summarise the meeting", paste the notes.
3. **Specify length in numbers.** "Under 100 words" or "5 bullet points" works far better than "short".
4. **Say what to avoid.** "No clichés like 'in today's fast-paced world'", "Don't use the word 'delve'".
5. **Ask for options.** Three versions to choose from is often faster than refining one.

## A reusable prompt template

Copy this into your notes. You'll use it all through the course:

```text
Act as [role].
I need you to [task].
Background: [who it's for, what's happened, why it matters, any constraints].
Format: [length, structure — bullets, table, email, etc.].
Tone: [e.g. warm and professional / simple and direct / formal].
Avoid: [anything you don't want].
```

## Try it yourself

Take about 15 minutes to feel the difference that structure makes.

1. Pick a real writing task from your week — a message to a colleague, a note to your child's school, a product post for your business, or a follow-up to a recruiter.
2. First, write a lazy one-line prompt and send it. Save the result.
3. Next, open a new chat and rewrite the prompt using the RTCFT template above. Include at least three lines of context.
4. Compare the two outputs. Which would you actually send?
5. Improve the better one with two follow-up messages (for example, "shorter" and "warmer").
6. Save your final RTCFT prompt in your notebook under the heading "Prompt Library — Prompt #1".

## Key takeaways

- Vague prompts produce generic answers; specific prompts produce usable drafts.
- Use RTCFT — Role, Task, Context, Format, Tone — for anything important.
- Context is the most valuable ingredient; examples are the best way to teach style.
- Treat prompting as a conversation: refine with short follow-ups.
- When unsure, ask the assistant to question you first.
