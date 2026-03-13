"""Buffett Web Search Agent - LangGraph ReAct Agent

Claude Sonnet 4 + tools (web_search, save_to_file, calculator)
"""

import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain.agents import create_agent
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
    model="claude-sonnet-4-20250514",
    anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"),
    temperature=0.3,
)

# --- Agent ---

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=SYSTEM_PROMPT,
)

def run_agent(query: str) -> str:
    """Run the agent with a query and return the final answer."""
    result = agent.invoke(
        {"messages": [{"role": "user", "content": query}]}
    )
    # Extract the last AI message with content
    ai_messages = [m for m in result["messages"] if m.type == "ai" and m.content]
    return ai_messages[-1].content if ai_messages else "(no response)"


if __name__ == "__main__":
    print("=" * 50)
    print("  Agent created successfully!")
    print(f"  Model: claude-sonnet-4-20250514")
    print(f"  Tools: {[t.name for t in tools]}")
    print("=" * 50)

    # Run agent: search weather and save to file
    query = "오늘 서울 날씨를 검색하고, 결과를 weather_report.txt에 저장해줘"
    print(f"\n[Run] Query: '{query}'")
    print("-" * 50)
    answer = run_agent(query)
    print(f"\n[Final Answer]\n{answer}")
