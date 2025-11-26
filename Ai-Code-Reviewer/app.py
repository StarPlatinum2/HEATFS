# ai_reviewer.py  –  GROQ version
import json, re, subprocess, sys, ast
from typing import Dict, List
from groq import Groq

CLIENT = Groq(api_key="gsk_YOUR_REAL_KEY_HERE")  # <-- paste key here
MODEL  = "llama-3.1-8b-instant"                # 32 k ctx, sub-second

# ---------- 1. ultra-fast linter ----------
def _lint(code: str) -> List[Dict]:
    issues = []
    try:
        ast.parse(code)
    except SyntaxError as e:
        return [{"line": e.lineno or 1, "severity": "high", "message": f"Syntax: {e.msg}"}]
    try:
        out = subprocess.run([sys.executable, "-m", "pyflakes"], input=code, text=True,
                             capture_output=True, timeout=2)
        for hit in out.stdout.splitlines():
            m = re.match(r".*:(\d+):(?:\d+:)? (.+)", hit)
            if m:
                issues.append({"line": int(m.group(1)), "severity": "high", "message": m.group(2)})
    except Exception:
        pass
    # typo scan
    for i, ln in enumerate(code.splitlines(), 1):
        if re.search(r"salculate|calccdx|qd1|\bretun\b|\bels\b", ln, re.I):
            issues.append({"line": i, "severity": "medium", "message": "Probable typo"})
    return issues[:20]

# ---------- 2. GROQ API (sub-second) ----------
def _ai_quick(code: str) -> Dict:
    prompt = (
        "You are a senior Python reviewer. Output ONLY valid JSON, no extra text.\n"
        "{\n"
        '  "score": <1-10>,\n'
        '  "summary": "<brief>",\n'
        '  "issues": [{"line": <int>, "severity": "high|medium|low", "message": "<text>"}],\n'
        '  "suggestions": ["<text>", "<text>", "<text>"]\n'
        "}\n\n"
        f"Code:\n{code}"
    )
    try:
        reply = CLIENT.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=300,
            timeout=5,
        )
        raw = reply.choices[0].message.content.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        if not raw.endswith("}"):
            raw += "}"
        return json.loads(raw)
    except Exception as e:
        print(">>> Groq error:", e)
        return {"score": 0, "summary": "AI offline – linter only", "issues": [], "suggestions": []}

# ---------- 3. merge ----------
class AIReviewer:
    def review_code(self, code: str, language: str = "python") -> Dict:
        linter = _lint(code)
        ai = _ai_quick(code)
        combined = (linter + ai["issues"])[:25]
        ai["issues"] = combined
        ai["total_lines"] = len(code.splitlines())
        return ai
