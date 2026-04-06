#!/usr/bin/env python3
"""
Calls the running Git Agent server via HTTP.
No venv or imports needed — only uses Python stdlib (urllib).

Usage:
  python git_agent.py "commit my changes and push"
  python git_agent.py "stage only .py files, commit with a good message, push"
"""
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

AGENT_URL  = "http://localhost:8000/agent/run"
THIS_REPO  = str(Path(__file__).parent.resolve())


def run(goal: str) -> bool:
    payload = json.dumps({
        "repo_path": THIS_REPO,
        "goal":      goal,
    }).encode()

    req = urllib.request.Request(
        AGENT_URL,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            result = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = json.loads(e.read())
        print(f"\n[FAILED] HTTP {e.code}")
        print(json.dumps(error_body, indent=2))
        return False
    except urllib.error.URLError:
        print("\n[ERROR] Cannot reach agent server at http://localhost:8000")
        print("        Start it with: uvicorn app.main:app --reload  (in d:/git_agent_perosnal)")
        return False

    # Print execution trace
    print(f"\n{'='*60}")
    for step in result.get("steps", []):
        icon = "✅" if step["success"] else "❌"
        args = ", ".join(f"{k}={v!r}" for k, v in step["tool_args"].items())
        print(f"  {icon} iter {step['iteration']}  {step['tool_called']}({args})")
        if not step["success"]:
            print(f"       Error: {step['tool_result'].get('error')}")

    status = "SUCCESS" if result["success"] else "FAILED"
    print(f"\n[{status}] {result['final_summary']}")
    print(f"Iterations: {result['total_iterations']}")
    return result["success"]


if __name__ == "__main__":
    goal = " ".join(sys.argv[1:]) or "stage all changes, commit with a meaningful message, and push"
    print(f"Repo : {THIS_REPO}")
    print(f"Goal : {goal}")
    ok = run(goal)
    sys.exit(0 if ok else 1)
