Before you write a single line of code, you need a working mental model of what a large language model (LLM) actually does. This lesson gives you the engineer's version: no maths degree required, but precise enough that you can reason about cost, speed and failure modes.

## What an LLM really does

An LLM is a function that takes a sequence of text and predicts what text should come next. It does this one small piece at a time, appending each piece to the input and predicting again, until it decides to stop or hits a limit you set.

That one sentence explains a lot of behaviour you will see in this course:

- The model has no memory between API calls. If you want it to "remember" the earlier part of a chat, you send the whole conversation again every time.
- The model does not look things up unless you give it tools or documents. When it does not know something, it can still produce fluent text that sounds right. That is what people call a hallucination.
- Output is generated piece by piece, which is why you can stream the answer to a user as it is being written.

## Tokens: the unit of everything

Models do not read characters or words. They read **tokens**, which are chunks of text produced by a tokenizer. A common English word is often one token; a long or rare word may be split into several. Hindi, Tamil or other Indic scripts usually take more tokens per word than English, which matters if you build for Indian-language users.

Why engineers care about tokens:

| What | Why tokens matter |
|---|---|
| Cost | API providers bill per input token and per output token. Output tokens usually cost more. |
| Speed | Each output token takes time to generate, so long answers are slow answers. |
| Limits | Every request has a maximum number of output tokens you allow (`max_tokens`). |
| Context | The total input you can send is measured in tokens, not pages. |

A useful habit: for every feature, estimate tokens in and out per request, then multiply by requests per day. That catches most billing surprises early.

## The context window

The **context window** is the maximum number of tokens the model can consider in one request: your system prompt, the conversation history, any documents you paste in, tool definitions and the answer it writes. Modern models have large context windows, enough to hold long reports or a sizeable codebase.

Large does not mean free. Every token you send is billed on every request, and stuffing irrelevant text in can distract the model. This is the main reason **retrieval-augmented generation (RAG)** exists: instead of sending all 400 pages of a company's HR policy, you search for the five most relevant paragraphs and send only those. You will build exactly this in Module 3.

## Temperature and randomness

At each step, the model produces a probability for every possible next token. Something has to pick one. **Sampling settings** such as temperature control how adventurous that pick is:

- Low randomness: the model mostly picks the most likely token. Good for extraction, classification, code.
- High randomness: the model picks less likely tokens more often. Good for brainstorming taglines for a Pune bakery's Instagram.

You will see `temperature` in many tutorials and in other providers' APIs. Be aware that the newest Claude models manage sampling themselves and reject a custom `temperature` value, so in this course we control output quality with clear prompts, examples and structured output rather than by turning a randomness knob. The concept is still worth knowing for interviews and for working with other models.

The practical lesson is the same either way: **the same prompt can give different answers on different runs.** Your application must be designed for that, which is why we will validate outputs and build test sets.

## Reasoning and "thinking"

Many current models reason internally before answering. In the Claude API this is called adaptive thinking, and on the latest models it is on by default. Reasoning tokens are billed as output, and an **effort** setting (low, medium, high and above) trades depth for cost: low for simple classification, higher for multi-step agent tasks.

## Embeddings: meaning as numbers

An **embedding** is a list of numbers (a vector) that represents the meaning of a piece of text. Texts with similar meaning get vectors that point in similar directions. For example:

```text
"How do I reset my UPI PIN?"          -> [0.12, -0.48, 0.33, ...]
"I forgot my UPI PIN, how to change?" -> [0.11, -0.45, 0.35, ...]   (very close)
"Best biryani in Hyderabad"           -> [-0.62, 0.20, -0.07, ...]  (far away)
```

Embeddings are produced by a separate, smaller kind of model. They power semantic search: you embed your documents once, embed the user's question at query time, and find the documents whose vectors are closest. That is the "retrieval" in RAG. Module 3 covers this hands-on, including running an embedding model on your own laptop.

## Where the API fits

We use the official Anthropic Python SDK. The same ideas exist in OpenAI, Gemini and open-source models served through Ollama, so what you learn transfers directly.

## Try it yourself

Spend 15 minutes building intuition, no code needed yet.

1. Open any chat assistant you have access to.
2. Ask the same question three times in fresh chats: "Suggest a name for a chai stall near a Bengaluru tech park." Note how the answers differ.
3. Ask a factual question it cannot know, such as "What did my manager say in yesterday's stand-up?" Observe whether it admits it does not know.
4. Paste a 300-word paragraph and ask "Summarise this in one line." Then paste only one sentence of it and ask the same. Notice how the answer depends entirely on what is in the context.
5. Write three sentences in your notes explaining tokens, context window and embeddings in your own words, as if explaining to a junior colleague. You will reuse this in interview prep in Module 6.

## Key takeaways

- An LLM predicts the next token repeatedly; it has no memory between calls and no knowledge beyond its training and your input.
- Tokens drive cost, speed and limits, so estimate tokens in and out for every feature you design.
- The context window is large but not free; RAG exists to send only what is relevant.
- Outputs vary between runs, so production apps need validation and test sets.
- Embeddings turn meaning into vectors and make semantic search possible.
