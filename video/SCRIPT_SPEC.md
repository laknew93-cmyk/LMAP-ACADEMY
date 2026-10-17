# Video narration scripts

One plain-text file per lesson: `video/scripts/<course-slug>/<lesson-file-stem>.txt`
(the stem is the lesson's markdown filename without `.md`, e.g. `01-02-anatomy-of-a-great-prompt`).

The script is read word-for-word by a HeyGen AI avatar presenter. It is a **full read-through** of the
written lesson, rewritten for the ear. The written lesson is shown below the video on the site, so
learners can always look at prompts, code and tables there.

## Rules

- Start with: "Welcome to <course short name>, module <n>, lesson <m>: <lesson title>." then go straight in.
- Cover every section and idea of the lesson, in the same order. Do not drop content; do not add new claims.
- Spoken style: short sentences, contractions, second person, natural transitions ("Here's the thing...",
  "Let's look at an example."). No markdown at all: no `#`, `*`, `-` bullets, backticks, tables or links.
- Lists become sentences: "There are three parts. First, ... Second, ... And third, ...".
- Prompts in ```text blocks: if under ~60 words, read them aloud introduced by "Here's the prompt:"; if longer,
  summarise what the prompt does and say "You'll find the full prompt in the lesson notes below this video."
- Code blocks (Python, formulas, DAX, JSON): never read code symbol by symbol. Explain what it does in
  plain words and say "the code is in the lesson notes below the video". Short Excel formulas may be spoken
  naturally, e.g. "equals SUMIFS, then the amount column, then the region column...". 
- Tables: describe the key comparison in a sentence or two and point to the notes.
- Write things the way they should be pronounced: "₹1,500" → "fifteen hundred rupees"; "%" → "percent";
  "e.g." → "for example"; "vs" → "versus"; "GSTIN" → "G S T I N"; "API" → "A P I"; "LLM" → "L L M";
  "RAG" → "rag"; "n8n" → "n eight n"; "CSV" → "C S V"; "URL" → "U R L"; "AI" stays "AI".
  Spell out URLs only if essential, otherwise say "the link in the lesson notes".
- For "Try it yourself": read the exercise steps clearly and encourage the learner to pause the video.
- For "Key takeaways": read them as a short recap: "Let's recap."
- End with: "That's it for this lesson. Mark it complete, and I'll see you in the next one." For the last
  lesson of the course, instead congratulate them and remind them to claim their certificate.
- Paragraph breaks (blank lines) between sections, used as natural pauses. Plain ASCII punctuation plus ₹ is fine,
  but avoid emoji and special characters.
- Length: roughly the same word count as the lesson prose (excluding code), typically 800-1,200 words
  (about 6-9 minutes spoken).
