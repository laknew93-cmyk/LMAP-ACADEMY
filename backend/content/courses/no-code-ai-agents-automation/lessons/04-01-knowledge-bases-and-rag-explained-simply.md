A chatbot that answers customer questions is only useful if it answers from *your* information – your prices, policies and product details – rather than from whatever the AI happens to have learned. This lesson explains, without jargon overload, how that works.

## The problem with a plain chatbot

Ask a general AI model "What is the cancellation policy of Green Leaf Homestay, Coorg?" and one of two things happens: it says it doesn't know, or worse, it invents a plausible-sounding policy. Models are trained on public internet data up to a certain date. They know nothing about your private documents, your latest price list or the policy you changed last month.

So how do businesses build bots that answer correctly about their own products? There are three broad approaches.

## Approach 1: Put everything in the prompt

If your information is short – a one-page FAQ, a price list, opening hours – you can simply include it in the bot's instructions:

```text
You are the assistant for Green Leaf Homestay, Coorg.
Answer only using the information below. If the answer is not here,
say you'll check with the owner and ask for the guest's phone number.

INFORMATION:
- Check-in 1 pm, check-out 11 am.
- Cancellation: full refund up to 7 days before arrival; 50% within 7 days.
- Pets allowed with prior approval.
...
```

This works well and is surprisingly common. Its limits: long documents make every message expensive and slower, and models can lose track of details buried in very long instructions.

## Approach 2: Retrieval-augmented generation (RAG)

When you have lots of material – a 200-page product manual, 50 policy documents, years of support tickets – you use **RAG**, which stands for retrieval-augmented generation. The name sounds complex; the idea is simple:

> Before answering, **look up** the few most relevant pieces of your documents, then give *only those* to the AI along with the question.

It's like an open-book exam. The student (the AI) doesn't memorise the textbook; for each question they flip to the right pages and answer from them.

### How RAG works, step by step

**Preparation (done once, and again when documents change):**

1. **Collect** your documents: PDFs, Google Docs, web pages, FAQs.
2. **Split** them into chunks – a few paragraphs each.
3. **Embed** each chunk: an embedding model turns the text into a list of numbers that represents its *meaning*. Chunks about similar topics get similar numbers.
4. **Store** the chunks and their numbers in a **vector store** (a database designed to find "closest meaning").

**At question time:**

5. The user's question is also turned into numbers.
6. The vector store finds the chunks whose meaning is closest to the question.
7. Those chunks plus the question go to the AI, with instructions to answer only from them.
8. The AI writes the answer, ideally mentioning which document it came from.

The key insight: search by **meaning**, not keywords. A question like "can I bring my dog?" finds the chunk saying "pets allowed with prior approval" even though the word "dog" isn't in it.

### Why RAG reduces (but doesn't eliminate) errors

Giving the model the right source text makes accurate answers much more likely. But it can still go wrong:

- **Retrieval misses:** the right chunk wasn't found (poorly written documents, bad chunking, or the answer simply isn't there).
- **Outdated sources:** two versions of the price list exist, and the bot found the old one.
- **Over-confident answers:** the model fills gaps instead of saying "I don't know".

Most of the quality in a RAG bot comes from **clean, current, well-structured documents**, not from clever technology.

## Approach 3: Fine-tuning (usually not what you need)

Fine-tuning means further training a model on your examples. People often assume they need it for a company chatbot. Usually they don't – fine-tuning is better for teaching a *style or format* than for teaching *facts*, and facts change. For business FAQ bots, the prompt approach or RAG is the normal answer.

## Where you'll meet RAG in no-code tools

You rarely build RAG from scratch. It is built into many tools under friendlier names:

- **Custom assistants in chat apps:** ChatGPT's custom GPTs, Claude Projects, Gemini Gems and similar features let you upload files as "knowledge". Behind the scenes, the tool decides whether to include files directly or retrieve relevant parts. Great for internal team assistants.
- **Chatbot builders:** many website and WhatsApp chatbot platforms let you upload documents or point to your website URL and handle the retrieval for you.
- **Automation tools:** n8n has vector store, embeddings and document loader nodes you can wire together; Make and Zapier increasingly offer knowledge or AI chatbot features. These give the most control.

## Preparing documents for a knowledge base

Whatever tool you use, the same document rules apply:

- **One source of truth.** Delete or archive old versions. Two price lists = wrong answers.
- **Write in question-friendly form.** Clear headings ("Cancellation policy", "Delivery to Tier-2 cities") help retrieval.
- **Spell out the obvious.** Things everyone in the office "just knows" are often written nowhere.
- **Turn tables and scanned images into clean text** where possible; scanned PDFs often extract badly.
- **Date your documents** ("Price list – updated October 2026") so humans can spot stale content.

## Try it yourself

Spend 15–20 minutes:

1. Pick a small business you know (yours, a family shop, a client) and write a one-page FAQ: 10–15 questions with clear answers about timings, prices, delivery, refunds and contact.
2. Create a custom assistant in any chat tool that supports knowledge files (a custom GPT, a Claude Project or similar) and upload the FAQ.
3. Add an instruction: answer only from the document; if not found, say so and suggest contacting the business.
4. Ask it 10 questions: five answered in the FAQ, three phrased differently from the FAQ wording, and two that are *not* covered.
5. Note any wrong or invented answers. Is the cause the document, the instruction or retrieval?

## Key takeaways

- General AI models don't know your private business information and may invent answers.
- Short information can go directly in the prompt; large document sets need RAG.
- RAG = find the most relevant chunks by meaning, then answer only from them.
- Document quality – one current source of truth, clear headings – drives most of a bot's accuracy.
- Fine-tuning is rarely the right tool for teaching a bot business facts.
