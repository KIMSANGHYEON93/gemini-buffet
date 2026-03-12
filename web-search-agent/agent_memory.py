"""Multi-turn Agent with Conversation Memory

messages 리스트로 대화 히스토리를 관리하여 이전 맥락을 유지하는 에이전트.
"""

import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain.agents import create_agent
from tools import tools

load_dotenv()

# --- System Prompt ---

SYSTEM_PROMPT = """You are an AI research assistant with three tools:

1. **web_search**: Search the web for real-time information.
2. **save_to_file**: Save content to a file in the output/ directory.
3. **calculator**: Evaluate mathematical expressions.

Instructions:
- Use web_search when the user asks about current events or data.
- Use calculator for any numerical computation.
- Use save_to_file when the user asks to save or export results.
- Remember previous conversation context and refer to it when needed.
- Respond in the same language the user writes in.
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

# --- Conversation Memory ---
# Store raw LangChain message objects to preserve tool_use/tool_result pairs

messages = []


def chat(user_input: str) -> str:
    """Send a message to the agent, maintaining conversation history.

    The full message list (including tool calls and results) is preserved
    between turns so the LLM sees the complete context.

    Args:
        user_input: The user's message.

    Returns:
        The agent's final text response.
    """
    from langchain_core.messages import HumanMessage

    messages.append(HumanMessage(content=user_input))

    result = agent.invoke({"messages": messages})

    # Replace history with the full message list returned by the agent
    # This includes HumanMessage, AIMessage (with tool_use), ToolMessage, etc.
    messages.clear()
    messages.extend(result["messages"])

    # Extract the last AI response with text content
    ai_messages = [m for m in messages if m.type == "ai" and m.content]
    return ai_messages[-1].content if ai_messages else "(no response)"


if __name__ == "__main__":
    print("=" * 50)
    print("  Multi-turn Agent (with memory)")
    print(f"  Model: claude-sonnet-4-20250514")
    print(f"  Tools: {[t.name for t in tools]}")
    print("=" * 50)

    # Turn 1: Search
    q1 = "파이썬이란 무엇인지 검색해줘"
    print(f"\n[Turn 1] User: '{q1}'")
    print("-" * 50)
    a1 = chat(q1)
    print(f"Agent: {a1}")
    print(f"\n  (messages in history: {len(messages)})")

    # Turn 2: Save (relies on context from Turn 1)
    q2 = "방금 검색한 내용을 python_info.txt에 저장해줘"
    print(f"\n[Turn 2] User: '{q2}'")
    print("-" * 50)
    a2 = chat(q2)
    print(f"Agent: {a2}")
    print(f"\n  (messages in history: {len(messages)})")
