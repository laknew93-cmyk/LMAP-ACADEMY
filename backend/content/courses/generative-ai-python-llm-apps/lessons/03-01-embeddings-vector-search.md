Keyword search fails when users and documents use different words for the same idea: "leave encashment" versus "getting paid for unused holidays". Embeddings solve this by searching on meaning. In this lesson you generate embeddings on your own laptop and build semantic search from scratch with NumPy, so nothing about vector databases will feel like magic later.

## Embeddings recap

An embedding model turns text into a fixed-length list of numbers (a vector). Texts with similar meaning produce vectors pointing in similar directions. To compare two vectors we usually use **cosine similarity**: 1.0 means the same direction (very similar meaning), around 0 means unrelated.

Important facts for engineers:

- Embedding models are different from chat models. They are smaller, faster and much cheaper per token.
- You must use the **same embedding model** for your documents and your queries. Vectors from different models are not comparable.
- Each model has a fixed dimension (for example 384 or 1,024 numbers per text) and a maximum input length. Longer text gets truncated, which is one reason we chunk documents (next lesson).

Anthropic does not provide its own embeddings endpoint; Claude apps typically pair with a dedicated embeddings provider (Anthropic's documentation points to Voyage AI) or with an open-source model. OpenAI and Google also offer embeddings APIs. In this course we use an open-source model that runs locally: free, private, and good enough for learning and many real projects.

## Install and embed

```bash
pip install sentence-transformers numpy
```

The first run downloads the model (roughly 100 MB), after which it works offline.

```python
import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")  # small, fast English model

sentences = [
    "How do I reset my UPI PIN?",
    "I forgot my UPI PIN and need to change it",
    "Best biryani places in Hyderabad",
]
vectors = model.encode(sentences, normalize_embeddings=True)

print(vectors.shape)          # (3, 384): 3 sentences, 384 numbers each
print(vectors @ vectors.T)    # similarity of every pair
```

What is happening:

- `SentenceTransformer(...)` loads a pretrained embedding model.
- `encode(..., normalize_embeddings=True)` returns a NumPy array and scales every vector to length 1. With normalised vectors, cosine similarity is just the dot product, which is fast to compute.
- `vectors @ vectors.T` is matrix multiplication: it computes all pairwise similarities at once. You should see the two UPI sentences scoring much higher with each other than with the biryani sentence.

For Hindi, Tamil or mixed Hinglish text, try a multilingual model such as `paraphrase-multilingual-MiniLM-L12-v2`. Always test on your real data; models vary a lot across languages.

## Semantic search from scratch

Let us build a mini FAQ search for a fictional Pune coworking space:

```python
FAQS = [
    "Day passes cost ₹499 and include Wi-Fi, tea and coffee.",
    "Monthly dedicated desks are available from ₹6,999 per month plus GST.",
    "The space is open 8am to 10pm, Monday to Saturday. Sunday is closed.",
    "Meeting rooms can be booked hourly through our app.",
    "We provide GST invoices for all memberships on request.",
    "Parking for two-wheelers is free; car parking is paid and limited.",
    "Pets are not allowed inside the workspace.",
]

faq_vectors = model.encode(FAQS, normalize_embeddings=True)


def search(query: str, k: int = 3) -> list[tuple[float, str]]:
    q = model.encode([query], normalize_embeddings=True)[0]
    scores = faq_vectors @ q                 # similarity with every FAQ
    top = np.argsort(scores)[::-1][:k]       # indices of highest scores
    return [(float(scores[i]), FAQS[i]) for i in top]


for score, text in search("Can I bring my scooter?"):
    print(f"{score:.3f}  {text}")
```

Line by line:

- We embed all FAQs once, up front. In a real system you store these vectors so you never recompute them.
- For each query we embed only the query, then one matrix-vector product scores every FAQ.
- `np.argsort(scores)[::-1][:k]` sorts indices by score, highest first, and keeps the top `k`.

Notice that "scooter" never appears in the FAQs, yet the parking answer should rank first, because the model knows scooters are two-wheelers. That is the power of semantic search.

## When NumPy is enough, and when it is not

This brute-force approach compares the query with every vector. That sounds slow, but NumPy handles tens of thousands of vectors comfortably on a laptop. Many internal tools (an HR policy bot, a product FAQ, a course notes assistant) never need more.

You need a **vector database** when you have:

| Need | Why a vector DB helps |
|---|---|
| Hundreds of thousands to millions of chunks | Approximate nearest-neighbour indexes keep search fast |
| Metadata filters ("only 2026 policies", "only Maharashtra branch") | Built-in filtering alongside similarity |
| Persistence and updates | Add, update and delete documents without rebuilding everything |
| Multiple services reading the same data | A shared server instead of a NumPy file per app |

Popular options include Chroma (simple, runs locally), pgvector (adds vector search to PostgreSQL, a favourite in Indian product companies already on Postgres), and managed services. Next lesson uses Chroma.

## Semantic search is not perfect

Embeddings capture meaning, but they are weak at exact matches: invoice numbers, product codes, names and specific numbers. A search for "INV-2026-0417" might return a different invoice that "looks" similar. Production systems therefore often use **hybrid search**: combine keyword search (such as BM25) with vector search and merge the results. Keep this in mind; it is a common interview discussion point.

Also remember that similarity scores are relative. A score of 0.45 might be a strong match for one model and weak for another. Do not hard-code thresholds without looking at real examples.

## Try it yourself

About 20 minutes:

1. Run the FAQ search and try five queries, including "is it open on Sunday", "do you give tax invoice", and "can my dog come".
2. Find one query where search gets it wrong. Write down why you think it failed.
3. Add five FAQs for a business you know (a gym in Lucknow, a coaching centre in Kota) and test again.
4. Try the multilingual model with a Hinglish query like "scooty parking free hai kya?" and compare results with the English-only model.
5. Save `faq_vectors` with `np.save("faq_vectors.npy", faq_vectors)`, reload it with `np.load`, and confirm search still works without re-encoding.

## Key takeaways

- Embeddings map text to vectors; similar meaning gives high cosine similarity.
- Use the same embedding model for documents and queries, and normalise vectors so similarity is a dot product.
- Brute-force NumPy search is enough for many apps; vector databases add scale, filters and persistence.
- Semantic search is weak on exact codes and names, so consider hybrid search.
- Test embedding models on your real language mix, especially for Indian languages.
