"""Buffett Web Search Agent - LangGraph ReAct Agent

Claude Sonnet 4.6 + tools (web_search, save_to_file, calculator)
"""

import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langgraph.prebuilt import create_react_agent
from tools import tools

load_dotenv()

# --- System Prompt ---

SYSTEM_PROMPT = """You are an AI research assistant with three tools:

1. **web_search**: Search the web for real-time information (stock prices, news, market data, weather, etc.)
2. **save_to_file**: Save analysis results or any text content to a file in the output/ directory.
3. **calculator**: Evaluate mathematical expressions (P/E ratios, percentage changes, compound interest, etc.)

Instructions:
- Use web_search when the user asks about current events, prices, or data.
- Use calculator for any numerical computation.
- Use save_to_file when the user asks to save or export results.
- Respond in the same language the user writes in.
- Be concise and provide actionable insights.
"""

# --- LLM ---

llm = ChatAnthropic(
    model="claude-sonnet-4-6-20250527",
    anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"),
    temperature=0.3,
)

# --- Agent ---

agent = create_react_agent(
    model=llm,
    tools=tools,
    prompt=SYSTEM_PROMPT,
)

if __name__ == "__main__":
    print("=" * 50)
    print("  Agent created successfully!")
    print(f"  Model: claude-sonnet-4-6-20250527")
    print(f"  Tools: {[t.name for t in tools]}")
    print("=" * 50)

    # Test agent with a simple query
    print("\n[Test] Agent invoke: '3 + 5는 뭐야?'")
    print("-" * 50)
    result = agent.invoke(
        {"messages": [{"role": "user", "content": "3 + 5는 뭐야?"}]}
    )
    # Print the last AI message
    ai_messages = [m for m in result["messages"] if m.type == "ai" and m.content]
    if ai_messages:
        print(f"Agent: {ai_messages[-1].content}")
