A command-line bot proves you can code; a web app is what a recruiter, a client or your manager will actually click. In this lesson you turn your chatbot into a streaming web app with Streamlit, a Python library that builds interfaces without HTML or JavaScript.

## Why Streamlit (and when to choose FastAPI)

You now know two ways to put an LLM behind a web interface:

| Option | Best for |
|---|---|
| **Streamlit** | Demos, internal tools, data apps, portfolio projects. One Python file, UI included. |
| **FastAPI** | APIs other software calls (mobile apps, a React frontend, other services). You built one in the invoice project. |

Many real teams use both: FastAPI for the production API, Streamlit for internal dashboards and quick prototypes. For your portfolio, a Streamlit front end on top of solid Python logic is perfectly respectable.

```bash
pip install streamlit anthropic python-dotenv
```

## How Streamlit thinks

Streamlit reruns your entire script from top to bottom every time the user interacts (types a message, clicks a button). That has one big consequence: normal variables are reset on every rerun. To keep the chat history, you store it in `st.session_state`, a dictionary that survives reruns for each browser session.

## The chat app

Create `app.py`:

```python
import os

import anthropic
import streamlit as st
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")

SYSTEM = """You are CareerSathi, a career guide for Indian students moving
into tech and GenAI roles. Give practical, honest advice in under 200 words.
Mention specific skills and free resources where useful."""


@st.cache_resource
def get_client() -> anthropic.Anthropic:
    return anthropic.Anthropic()


st.set_page_config(page_title="CareerSathi")
st.title("CareerSathi - GenAI career guide")

if "messages" not in st.session_state:
    st.session_state.messages = []

with st.sidebar:
    if st.button("New chat"):
        st.session_state.messages = []
        st.rerun()
    st.caption(f"Model: {MODEL}")

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])


def stream_answer(messages):
    with get_client().messages.stream(
        model=MODEL, max_tokens=16000, system=SYSTEM, messages=messages
    ) as stream:
        for text in stream.text_stream:
            yield text


if prompt := st.chat_input("Ask about skills, projects, interviews..."):
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    with st.chat_message("assistant"):
        try:
            reply = st.write_stream(stream_answer(st.session_state.messages))
        except anthropic.APIError as e:
            st.session_state.messages.pop()
            st.error(f"Something went wrong: {e}")
            st.stop()
    st.session_state.messages.append({"role": "assistant", "content": reply})
```

Run it with `streamlit run app.py`. A browser tab opens with a chat interface.

### Walking through it

- `@st.cache_resource` creates the API client once and reuses it across reruns and users, instead of creating a new client on every keystroke.
- `st.session_state.messages` is the same history list you used in the CLI, now stored per browser session.
- The `for msg in ...` loop redraws the whole conversation on each rerun. This looks wasteful but is how Streamlit works, and it is fast.
- `st.chat_input` returns the user's text when they press Enter, otherwise `None`. The walrus operator `:=` assigns and checks in one line.
- `stream_answer` is a generator: it yields text pieces as they arrive from the API.
- `st.write_stream(...)` displays those pieces live and returns the full text when done, which we store in history.
- On error we remove the unanswered user message, show a friendly message and stop this rerun, so history stays clean.

## Adding a document upload

A common upgrade: let users paste or upload a resume and ask questions about it. Add the uploader inside the existing sidebar block:

```python
with st.sidebar:
    uploaded = st.file_uploader("Upload your resume (.txt or .md)", type=["txt", "md"])
    if uploaded:
        st.session_state.resume = uploaded.read().decode("utf-8", errors="ignore")
        st.success("Resume loaded")
```

Then build the system prompt dynamically:

```python
def system_prompt() -> str:
    resume = st.session_state.get("resume")
    if not resume:
        return SYSTEM
    return SYSTEM + "\n\nThe user's resume is below. Refer to it when relevant.\n<resume>\n" + resume + "\n</resume>"
```

and pass `system=system_prompt()` in `stream_answer`. Wrapping the document in tags like `<resume>` clearly separates your instructions from user-provided content, a habit that pays off in the security lesson.

For PDF resumes, you can send the PDF as a `document` block, exactly as in the invoice project, instead of extracting text yourself.

## Making it feel professional

Small touches that make a demo look like a product:

- A short description under the title explaining what the app does and its limits.
- Three example questions as buttons, so first-time visitors know what to try.
- A footer note: "AI-generated advice. Verify important decisions with a mentor."
- A sensible cap on history length (reuse the trimming logic from Module 1).

### Example-question buttons

```python
examples = ["Which skills do I need for a GenAI engineer role?",
            "Review my project ideas for a fresher portfolio",
            "How should I prepare for an LLM interview at a product startup?"]
cols = st.columns(len(examples))
for col, q in zip(cols, examples):
    if col.button(q):
        st.session_state.pending = q
```

Then treat `st.session_state.pop("pending", None)` as an alternative source for `prompt`: `prompt = st.chat_input(...) or st.session_state.pop("pending", None)`. Wiring this up is part of your exercise.

## A note on secrets in Streamlit

Never call `st.text_input` to ask visitors for your API key, and never display the key anywhere. The key stays on the server in an environment variable. If you deploy publicly, anyone can use your app and spend your credits, so add basic limits (Module 5) before sharing the link widely.

## Try it yourself

About 20 minutes:

1. Build and run `app.py`.
2. Change the persona to something specific: a UPSC-prep study buddy, a guide for first-time GST filers, or a recipe assistant for a Kolkata cloud kitchen.
3. Add the three example-question buttons and make clicking one send it as a message.
4. Add the resume (or menu, or syllabus) upload and confirm the bot uses it in answers.
5. Open the app in two different browsers and confirm each has its own separate history.

## Key takeaways

- Streamlit reruns the script on every interaction; keep state in `st.session_state`.
- `st.write_stream` plus a generator over `stream.text_stream` gives you live streaming in a few lines.
- Cache the API client with `@st.cache_resource`.
- Wrap user documents in clear tags to separate them from your instructions.
- Keep API keys server-side and plan usage limits before sharing a public link.
