#!/usr/bin/env python3
"""Buffett Web Search Agent - LangGraph ReAct Agent with Tavily, Calculator, and File tools."""

import sys
import os

# Ensure the project root is in the path
sys.path.insert(0, os.path.dirname(__file__))

from dotenv import load_dotenv
from agents import create_react_agent


def main():
    load_dotenv()

    # Determine LLM provider from CLI arg or env
    provider = None
    if len(sys.argv) > 1 and sys.argv[1] in ("gemini", "claude"):
        provider = sys.argv[1]

    agent = create_react_agent(provider=provider)
    llm_name = provider or os.environ.get("DEFAULT_LLM", "gemini")

    print("=" * 60)
    print(f"  Buffett Web Search Agent  (LLM: {llm_name})")
    print("  Tools: web_search, calculator, file_save")
    print('  Type "quit" to exit')
    print("=" * 60)

    while True:
        try:
            question = input("\nYou: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break

        if not question:
            continue
        if question.lower() in ("quit", "exit", "q"):
            print("Goodbye!")
            break

        try:
            result = agent.invoke(
                {"messages": [{"role": "user", "content": question}]}
            )
            # Extract the last AI message from the graph result
            ai_messages = [
                m for m in result["messages"] if m.type == "ai" and m.content
            ]
            if ai_messages:
                print(f"\nAgent: {ai_messages[-1].content}")
            else:
                print("\nAgent: (no response)")
        except Exception as e:
            print(f"\nError: {e}")


if __name__ == "__main__":
    main()
