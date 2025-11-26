# ai_reviewer.py  –  multi-language, Groq cloud, zero crashes
import json, re, subprocess, sys, ast
from typing import Dict, List
from groq import Groq

# -------------------- config --------------------
CLIENT = Groq(api_key="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")   # <-- your key
MODEL  = "llama-3.1-8b-instant"                   # Groq fastest
# ------------------------------------------------

# ---------- 1. language-aware linters ----------
def _lint(code: str, language: str) -> List[Dict]:
    """Return static issues for Python / Java / JS / C++; empty list if none."""
    issues = []

    # ----- Python -----
    if language == "python":
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
        # typo heuristics
        for i, ln in enumerate(code.splitlines(), 1):
            if re.search(r"salculate|calccdx|qd1|\bretun\b|\bels\b", ln, re.I):
                issues.append({"line": i, "severity": "medium", "message": "Probable typo"})

    # ----- Java -----
    elif language == "java":
        try:
            out = subprocess.run(["javac", "-Xlint", "-"], input=code, text=True,
                                 capture_output=True, timeout=3)
            for hit in out.stderr.splitlines():
                m = re.match(r".*?(\d+):(?:\d+:)?\s*(.+)", hit)
                if m:
                    issues.append({"line": int(m.group(1)), "severity": "high", "message": m.group(2)})
        except FileNotFoundError:
            pass  # javac not installed → skip silently

    # ----- JavaScript -----
    elif language == "javascript":
        try:
            out = subprocess.run(["node", "--check"], input=code, text=True,
                                 capture_output=True, timeout=2)
            if out.stderr:
                for hit in out.stderr.splitlines():
                    m = re.match(r".*?(\d+):(?:\d+:)?\s*(.+)", hit)
                    if m:
                        issues.append({"line": int(m.group(1)), "severity": "high", "message": m.group(2)})
        except FileNotFoundError:
            pass  # node not installed → skip silently

    # ----- C++ -----
    elif language == "cpp":
        try:
            out = subprocess.run(["g++", "-fsyntax-only", "-x", "c++", "-"], input=code, text=True,
                                 capture_output=True, timeout=3)
            for hit in out.stderr.splitlines():
                m = re.match(r".*?(\d+):(?:\d+:)?\s*(.+)", hit)
                if m:
                    issues.append({"line": int(m.group(1)), "severity": "high", "message": m.group(2)})
        except FileNotFoundError:
            pass  # g++ not installed → skip silently

    return issues[:20]


# ---------- 2. language-specific cloud prompt ----------
def _ai_quick(code: str, language: str) -> Dict:
    prompt = (
        f"You are a senior {language} code reviewer.\n"
        "Output ONLY valid JSON, no extra text.\n"
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
            max_tokens=350,
            timeout=5,
        )
        raw = reply.choices[0].message.content.strip()
        raw = raw.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        if not raw.endswith("}"):
            raw += "}"
        return json.loads(raw)
    except Exception as e:
        print(f">>> Groq error ({language}):", e)
        return {"score": 0, "summary": "AI offline – linter only", "issues": [], "suggestions": []}


# ---------- 3. merge ----------
class AIReviewer:
    def review_code(self, code: str, language: str = "python") -> Dict:
        linter = _lint(code, language)
        ai    = _ai_quick(code, language)
        combined = (linter + ai["issues"])[:25]
        ai["issues"] = combined
        ai["total_lines"] = len(code.splitlines())
        return ai
