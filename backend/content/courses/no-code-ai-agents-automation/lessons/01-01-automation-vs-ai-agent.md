Everyone is talking about "AI agents", but most people who say the word mean very different things. In this first lesson we will pin down exactly what an automation is, what an AI agent is, and how to decide which one a task actually needs.

## Start with a real example

Meet Priya, who runs operations for a 12-person interior design studio in Pune. Every day she does the same things:

- Copies new enquiries from the website form into a Google Sheet.
- Reads each enquiry and decides whether it is a serious project or a "just checking prices" message.
- Sends a WhatsApp message to serious leads with the studio's portfolio link.
- Every Friday, compiles a short report for the founder: how many leads came in, how many were serious, which ones converted.

Some of this work is pure copying. Some of it needs judgement. That split is the whole story of this course.

## What a simple automation is

An **automation** is a fixed recipe: *when this happens, do these steps, in this order, every time.*

```text
WHEN a new form submission arrives
THEN add a row to the "Leads" Google Sheet
AND send an email to priya@studio.in
```

Automations are predictable. The same input always produces the same output. They are cheap, fast and easy to test. Tools like Zapier, Make and n8n were built for exactly this, and they have been doing it reliably for years.

The limitation: an automation cannot *understand* anything. It can check "does the budget field say more than ₹5,00,000?", but it cannot read "we're redoing our 3BHK in Baner, budget flexible, want to start after Diwali" and decide that this is a hot lead.

## Adding an AI step

The moment you put a large language model (LLM) such as ChatGPT, Claude or Gemini into the middle of an automation, it gains a new ability: reading and writing language. Now one step in the recipe can be:

```text
Read this enquiry. Classify it as HOT, WARM or COLD.
Return the category and a one-line reason.
```

The workflow is still a fixed recipe. The AI step is just a very smart "function" inside it. This is what most businesses actually need, and it is the bulk of this course. We will call these **AI-powered workflows**.

## What makes something an agent

An **AI agent** is different in one important way: *the AI decides what steps to take*, not you. A useful working definition:

> **Agent = LLM + tools + memory + goal**

| Ingredient | What it means | Priya's example |
|---|---|---|
| LLM | The "brain" that reads, reasons and writes | A chat model |
| Tools | Actions it is allowed to take | Search the Leads sheet, look up the calendar, draft an email |
| Memory | Context it can refer back to | Past conversations, notes on each client |
| Goal | What it is trying to achieve | "Prepare this week's lead report for the founder" |

Given the goal, an agent might decide: "First I'll read the Leads sheet. Hmm, three leads have no status. Let me check the email inbox for replies from them. Now I'll write the summary." You did not hard-code those steps. The model chose them, one at a time, by calling tools and looking at the results.

## The spectrum, not a binary

It helps to think of a spectrum:

1. **Plain automation** – fixed steps, no AI. ("Copy form to sheet.")
2. **AI-powered workflow** – fixed steps, one or more AI steps inside. ("Copy form to sheet, AI scores the lead, send WhatsApp if HOT.")
3. **Agentic workflow** – a fixed outer structure, but inside one step an agent chooses which tools to use. ("Every Friday, an agent gathers data from three tools and drafts a report, then a human approves it.")
4. **Fully autonomous agent** – the AI runs open-ended tasks with little supervision.

For small and medium businesses, levels 2 and 3 deliver most of the value. Level 4 is exciting in demos but risky in production: it is harder to test, its costs are less predictable and its mistakes are harder to spot. Throughout this course, we will lean towards the simplest level that does the job.

## How to choose

Ask three questions about any task:

- **Are the steps always the same?** If yes, use an automation, maybe with an AI step.
- **Does it need reading or writing language?** If yes, add an LLM step.
- **Do the steps change depending on what is found along the way?** Only then consider an agent.

A Chennai CA firm forwarding GST invoices from email to a Drive folder needs level 1. Tagging each invoice by vendor type needs level 2. Answering a client's question like "Did we file my GSTR-3B for August, and was there any late fee?" by looking across email, a tracker sheet and a portal export is closer to level 3.

## What you will build in this course

By the end you will have built four working projects:

1. A **lead-qualification automation**: form → AI scoring → Google Sheet/CRM → WhatsApp or email follow-up.
2. An **inbox triage assistant** that labels, summarises and drafts replies.
3. A **document-grounded FAQ bot** that answers only from your own documents.
4. A **weekly report agent** that gathers data with tools and waits for human approval before sending.

You will also learn the unglamorous parts that separate hobby projects from paid client work: API key safety, cost control, error handling, monitoring and how to sell this as a service to Indian SMBs.

## Try it yourself

Spend 15 minutes on this:

1. Write down five repetitive tasks you (or a client) do every week. Be specific: "copy Razorpay payment emails into the accounts sheet", not "accounts work".
2. For each task, place it on the spectrum: plain automation, AI-powered workflow, agentic workflow or autonomous agent.
3. Next to each, write the one sentence that justifies the level. For example: "Level 2, because the steps are fixed but someone has to read the message to classify it."
4. Circle the task that is most frequent *and* lowest level. That is probably your first build.

Keep this list. We will use it in the next lesson.

## Key takeaways

- An automation follows fixed steps; an AI agent decides its own steps using tools.
- A useful definition: agent = LLM + tools + memory + goal.
- Most business value comes from AI-powered workflows (fixed steps with an AI step inside), not fully autonomous agents.
- Always pick the simplest level on the spectrum that solves the problem.
