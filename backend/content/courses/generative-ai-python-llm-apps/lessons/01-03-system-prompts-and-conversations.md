A single question and answer is a demo. Real products need a consistent persona, rules the model always follows, and conversations that span many turns. This lesson covers system prompts and multi-turn conversation state, the two building blocks of every chatbot.

## The system prompt

The `system` parameter holds instructions that apply to the whole conversation. Users never see it, and it carries more weight than ordinary user messages. Use it for:

- **Role and audience**: who the assistant is and who it is talking to.
- **Rules**: what it must and must not do.
- **Format**: length, tone, language, structure.
- **Context**: facts about the business that every answer needs.

Here is a system prompt for a support assistant at a fictional Chennai CA firm:

```python
import os

import anthropic
from dotenv import load_dotenv

load_dotenv()
MODEL = os.environ.get("CLAUDE_MODEL", "claude-opus-5-5")
client = anthropic.Anthropic()

SYSTEM_PROMPT = """You are the client-support assistant for Iyer & Associates,
a chartered accountancy firm in Chennai serving small businesses.

Audience: shop owners and freelancers who are not finance experts.

Rules:
- Explain GST, TDS and ITR topics in simple English, max 150 words.
- Never give a final tax figure for a specific client. Instead say a CA
  from the firm will confirm it, and suggest booking a call.
- If the question is unrelated to tax or accounting, politely say you
  can only help with those topics.
- Office hours: Mon-Sat, 10am-6pm IST. Phone: provided on request only."""

response = client.messages.create(
    model=MODEL,
    max_tokens=4000,
    system=SYSTEM_PROMPT,
    messages=[{"role": "user", "content": "Do I need GST registration? I sell sarees online."}],
)
print(next(b.text for b in response.content if b.type == "text"))
```

Notice the structure: role, audience, explicit rules, and concrete facts. Vague prompts like "be helpful and professional" add little. Specific rules ("max 150 words", "never give a final tax figure") are testable, and testable rules are what you need for evaluation in Module 3.

### Writing good system prompts

- **Explain why**, not only what. "Never give a final tax figure, because only a CA who has seen the client's books can do that" helps the model handle edge cases you did not anticipate.
- **Prefer positive instructions.** "Answer in plain English" works better than a long list of things not to say.
- **Keep it stable.** A system prompt that never changes between requests can be cached, which cuts cost (Module 5). Do not put timestamps or user IDs in it.
- **Version it.** Store prompts in files or constants under Git, not scattered across code. When quality changes, you want to know which prompt change caused it.

## Multi-turn conversations

The API is stateless. The model does not remember your previous request. To hold a conversation, you keep the history in your own code and send all of it every time, alternating `user` and `assistant` messages:

```python
messages = [
    {"role": "user", "content": "My name is Priya and I run a home bakery in Pune."},
    {"role": "assistant", "content": "Nice to meet you, Priya! How can I help with your bakery?"},
    {"role": "user", "content": "What's my name and city?"},
]
```

The model answers "Priya, Pune" only because that information is in the list you sent.

### A reusable conversation class

Let us wrap this in a small class you will reuse for the CLI and web app:

```python
class Conversation:
    """Keeps chat history and sends it with every request."""

    def __init__(self, system: str, max_turns: int = 20):
        self.system = system
        self.max_turns = max_turns
        self.messages: list[dict] = []

    def ask(self, user_text: str) -> str:
        self.messages.append({"role": "user", "content": user_text})
        response = client.messages.create(
            model=MODEL,
            max_tokens=4000,
            system=self.system,
            messages=self.messages,
        )
        reply = "".join(b.text for b in response.content if b.type == "text")
        self.messages.append({"role": "assistant", "content": reply})
        self._trim()
        return reply

    def _trim(self) -> None:
        # Keep the last N user+assistant pairs so cost doesn't grow forever.
        excess = len(self.messages) - self.max_turns * 2
        if excess > 0:
            self.messages = self.messages[excess:]


chat = Conversation(SYSTEM_PROMPT)
print(chat.ask("Hi, I'm Karthik. I'm a freelance designer in Coimbatore."))
print(chat.ask("Is TDS deducted on my payments from clients?"))
print(chat.ask("Remind me, what city did I say I'm in?"))
```

What each part does:

- `self.messages` is the single source of truth for the conversation.
- `ask` appends the user turn, sends everything, then appends the assistant's reply so the next call includes it.
- We join all text blocks rather than taking the first one, which is safer when responses contain several blocks.
- `_trim` caps the history. Because history is resent every turn, a 100-turn conversation costs far more per message than a 5-turn one. Trimming always removes from the start, in pairs, so the list still begins with a `user` message.

Trimming is the simplest strategy. Others you will meet in real projects:

| Strategy | When to use |
|---|---|
| Keep last N turns | Casual chat, support bots |
| Summarise old turns into a short note | Long advisory sessions where early details matter |
| Store facts in a database and inject them | Apps that remember user profile across sessions |
| Retrieve relevant past messages (RAG over history) | Very long-running assistants |

## Where do conversations live in a real app?

In a script, a Python list is fine. In a web app with many users, you store each conversation in a database (PostgreSQL, Redis, or even SQLite for a prototype) keyed by a session ID, load it at the start of each request, and save it at the end. Never keep it only in server memory: when your app restarts or runs on two servers, users lose their history.

## System prompt versus user message

A common interview question: "Where should instructions go?" A clean rule of thumb:

- **System prompt**: anything true for every turn (role, rules, format, business facts).
- **User message**: the current task and any data for it (the document, the question).

Keeping data in user messages and rules in the system prompt also helps security, because it is clearer to the model which text is an instruction from you and which is untrusted content. You will build on this in the prompt-injection lesson.

## Try it yourself

About 15-20 minutes:

1. Write a system prompt for a support assistant for a business you know: a coaching institute in Kota, a two-wheeler service centre in Lucknow, or your own college placement cell. Include role, audience, three rules and two facts.
2. Plug it into the `Conversation` class.
3. Have a five-turn conversation. In turn 1 give your name; in turn 5 ask for it back.
4. Ask an off-topic question and check that your rule about scope is respected.
5. Set `max_turns=2`, repeat the test, and observe the model "forget" your name. Write one line on when you would accept that trade-off.

## Key takeaways

- The system prompt holds role, rules, format and fixed context; make rules specific and testable.
- The API is stateless: your code stores the history and resends it every turn.
- Long histories cost more on every request, so trim or summarise them.
- In production, store conversations in a database keyed by session, not in memory.
- Keep instructions in the system prompt and data in user messages.
