Real documents are not one-line FAQs. They are 40-page PDFs, policy manuals and meeting notes. Before you can search them, you must split them into chunks, embed each chunk, and store everything with metadata so you can cite sources later. This lesson builds that ingestion pipeline with Chroma.

## Why chunk at all?

- Embedding models have an input limit; text beyond it is ignored.
- A vector for a whole 40-page document is a blurry average of many topics, so it matches nothing well.
- At answer time you want to send the model only the few relevant paragraphs, not the whole file. Smaller, focused chunks mean lower cost and better answers.

Chunking is a trade-off:

| Chunk size | Pros | Cons |
|---|---|---|
| Small (a few sentences) | Precise matches | Loses surrounding context; answers may be incomplete |
| Medium (a few paragraphs) | Good balance for most docs | Needs tuning per document type |
| Large (pages) | Full context | Blurry embeddings, more tokens per answer |

A practical starting point: chunks of roughly 800-1,500 characters, split on paragraph boundaries, with a small overlap so sentences cut at a boundary still appear whole in one chunk. Then tune using the evaluation set you build in lesson 3.4.

## The chunker

```python
def chunk_text(text: str, max_chars: int = 1200, overlap: int = 200) -> list[str]:
    """Split text into chunks on paragraph boundaries, with overlap."""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, current = [], ""
    for para in paragraphs:
        if len(current) + len(para) + 2 <= max_chars:
            current = f"{current}\n\n{para}" if current else para
            continue
        if current:
            chunks.append(current)
            current = current[-overlap:] + "\n\n" + para  # carry overlap forward
        else:
            current = para
        while len(current) > max_chars:  # a single huge paragraph
            chunks.append(current[:max_chars])
            current = current[max_chars - overlap:]
    if current:
        chunks.append(current)
    return chunks
```

How it works:

- Split on blank lines to get paragraphs, which are natural units of meaning.
- Keep adding paragraphs to `current` until the next one would exceed `max_chars`.
- When a chunk is full, save it and start the next chunk with the last `overlap` characters of the previous one, so context flows across the boundary.
- The `while` loop handles a single paragraph longer than the limit by slicing it.

Libraries such as LangChain and LlamaIndex offer ready-made splitters. Writing your own once means you understand what they do, and it is a common take-home assignment.

## Reading PDFs and text files

```bash
pip install chromadb pypdf sentence-transformers
```

```python
from pathlib import Path

from pypdf import PdfReader


def load_documents(folder: str) -> list[dict]:
    """Return a list of {text, source, page} records."""
    records = []
    for path in sorted(Path(folder).iterdir()):
        if path.suffix.lower() == ".pdf":
            reader = PdfReader(str(path))
            for page_no, page in enumerate(reader.pages, start=1):
                text = page.extract_text() or ""
                if text.strip():
                    records.append({"text": text, "source": path.name, "page": page_no})
        elif path.suffix.lower() in {".txt", ".md"}:
            records.append({"text": path.read_text(encoding="utf-8"), "source": path.name, "page": 1})
    return records
```

We keep the **page number** with every piece of text. Without it you cannot tell users "see page 12 of the leave policy", and citations are the feature that makes people trust a RAG system.

Note that `pypdf` extracts text, not images. Scanned PDFs need OCR first, or you can send the PDF pages directly to a model that reads documents, as you did with invoices.

## Storing in Chroma

Chroma is an open-source vector database that runs inside your Python process and saves to a local folder. Create `ingest.py`:

```python
import chromadb
from sentence_transformers import SentenceTransformer

from chunker import chunk_text
from loader import load_documents

embedder = SentenceTransformer("all-MiniLM-L6-v2")
db = chromadb.PersistentClient(path="chroma_db")
collection = db.get_or_create_collection(name="docs", metadata={"hnsw:space": "cosine"})


def ingest(folder: str) -> None:
    ids, texts, metas = [], [], []
    for rec in load_documents(folder):
        for i, chunk in enumerate(chunk_text(rec["text"])):
            ids.append(f"{rec['source']}-p{rec['page']}-c{i}")
            texts.append(chunk)
            metas.append({"source": rec["source"], "page": rec["page"]})
    if not texts:
        print("No documents found.")
        return
    vectors = embedder.encode(texts, normalize_embeddings=True, batch_size=32)
    collection.upsert(ids=ids, documents=texts, embeddings=vectors.tolist(), metadatas=metas)
    print(f"Stored {len(texts)} chunks. Collection now has {collection.count()}.")


if __name__ == "__main__":
    ingest("docs")
```

Key points:

- `PersistentClient(path="chroma_db")` saves data to disk, so you ingest once and query many times.
- `hnsw:space: cosine` tells Chroma to use cosine distance, matching how we normalised vectors.
- We compute embeddings ourselves with the same model we will use for queries. Chroma can embed for you, but doing it explicitly keeps you in control of which model is used.
- **Deterministic IDs** (`file-page-chunk`) plus `upsert` mean re-running ingestion updates chunks instead of duplicating them. If a document shrinks, delete its old chunks first (`collection.delete(where={"source": name})`).
- `batch_size=32` keeps memory use reasonable on a laptop.

## Querying

```python
def retrieve(question: str, k: int = 4, source: str | None = None) -> list[dict]:
    q = embedder.encode([question], normalize_embeddings=True)[0]
    res = collection.query(
        query_embeddings=[q.tolist()],
        n_results=k,
        where={"source": source} if source else None,
    )
    return [
        {"text": doc, "source": meta["source"], "page": meta["page"], "distance": dist}
        for doc, meta, dist in zip(res["documents"][0], res["metadatas"][0], res["distances"][0])
    ]
```

Chroma returns lists of lists (one inner list per query), so we take index `[0]`. A lower **distance** means a closer match (distance is roughly 1 minus cosine similarity). The optional `where` filter restricts search to one file, which is useful when a user picks a specific document.

## Try it yourself

About 20 minutes:

1. Create a `docs/` folder with two or three documents: a public PDF such as a state government circular, your college's academic regulations, or a long policy you write yourself (leave policy for a 50-person Kochi startup).
2. Save the chunker, loader and ingestion code as `chunker.py`, `loader.py` and `ingest.py`, and put `retrieve()` in `retriever.py` (with `from ingest import embedder, collection` at the top). Then run `python ingest.py`.
3. Run `retrieve` for five questions and print source, page and the first 150 characters of each result.
4. Change `max_chars` to 400 and then 2,500, re-ingest (delete the `chroma_db` folder first), and compare the results for the same questions.
5. Note which size gave the most useful chunks. Keep the questions; they start your evaluation set.

## Key takeaways

- Chunk documents so each vector represents one focused idea; start around 800-1,500 characters with overlap.
- Keep source and page metadata with every chunk; you need it for citations.
- Use the same embedding model at ingestion and query time.
- Deterministic IDs and `upsert` make re-ingestion safe.
- Chunk size is a tuning knob; measure it rather than guess.
