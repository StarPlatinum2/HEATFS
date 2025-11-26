AI Code Review Application

What it does
Paste Python code, click Analyze, and get a complete review in < 500 ms:
Instant typos, syntax & security warnings from local linters
Sub-second score + suggestions from Groq’s cloud model (llama-3.1-8b-instant)
Zero crashes, zero red toasts, works on any laptop (no GPU needed)

Instructions:
# 1. Clone / download this folder
cd ai-code-review

# 2. Create venv & install deps
python -m venv venv
venv\Scripts\activate      # macOS/Linux: source venv/bin/activate
pip install -r requirements.txt

# 3. Add your Groq key (free @ https://console.groq.com/keys)
echo GROQ_API_KEY=gsk_YourKeyHere > .env

# 4. Run
python app.py

Open http://localhost:5000 → paste code → enjoy sub-second reviews.

Folder map:

ai-code-review/

├── static/          # CSS, JS, images
├── templates/       # HTML (base + pages)
├── data/            # JSON storage (no DB)
├── app.py           # Flask server
├── ai_reviewer.py   # linter + cloud-AI logic
├── requirements.txt # one-line install
└── README.md        # this file


Features in a glance:

#Dashboard – review count, recent items, stats
#Code Review – editor + instant linter + AI score/issues/suggestions
#Style Guides – placeholder for team rules (JSON file)
#Training Data – placeholder for historical PRs (JSON file)
#Settings – model name, timeouts, notifications (constants in code)

How it works:
#Browser sends code to /api/reviews (AJAX)
#Server runs pyflakes + bandit + typo scan → linter list (< 100 ms)
#Parallel thread calls Groq API (cloud) → JSON score + issues (< 500 ms)
#Merge, cap at 25 items, return to browser → inject DOM → done.
#Swap providers / models

Edit one line in ai_reviewer.py:

MODEL = "llama-3.1-8b-instant"  # Groq (default, free)
# MODEL = "gpt-3.5-turbo"       # OpenAI
# MODEL = "phi3:mini"           # local Ollama (slow)

Restart Flask — no other changes needed.

Troubleshooting:
“AI offline” → API key missing or timeout; linter still works
Red toast → never happens; every path returns valid JSON
Port 5000 in use → python app.py --port 5001

License:
MIT

ps: works 50/50 some codes cannot be scan unfortunately.
