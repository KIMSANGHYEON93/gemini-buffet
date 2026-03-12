"""Streaming Agent - 에이전트 실행 과정을 실시간으로 출력

agent.stream()을 사용하여 도구 호출, 관찰 결과, 최종 답변을 단계별로 출력.
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


def stream_agent(query: str) -> str:
    """Stream the agent execution, printing each step in real time.

    Args:
        query: The user's question.

    Returns:
        The final answer text.
    """
    print(f"\n{'='*50}")
    print(f"  Query: {query}")
    print(f"{'='*50}\n")

    final_answer = ""
    step = 0

    for chunk in agent.stream(
        {"messages": [{"role": "user", "content": query}]}
    ):
        for node_name, node_output in chunk.items():
            msgs = node_output.get("messages", [])

            for msg in msgs:
                # AI message with tool calls
                if msg.type == "ai" and hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        step += 1
                        args_str = str(tc.get("args", {}))
                        if len(args_str) > 100:
                            args_str = args_str[:100] + "..."
                        print(f"  [{step}] Tool Call: {tc['name']}")
                        print(f"      Args: {args_str}")

                # Tool result (observation)
                elif msg.type == "tool":
                    content = str(msg.content)
                    preview = content[:100] + "..." if len(content) > 100 else content
                    print(f"      Observation: {preview}")

                # AI final answer (no tool calls, has content)
                elif msg.type == "ai" and msg.content:
                    final_answer = msg.content
                    print(f"\n  [Final Answer]")
                    print(f"  {'-'*46}")
                    print(f"  {final_answer}")

    return final_answer


if __name__ == "__main__":
    print("Streaming Agent Demo")
    print(f"Model: claude-sonnet-4-20250514")
    print(f"Tools: {[t.name for t in tools]}")

    query = "NVIDIA의 현재 주가를 검색하고, 주가에서 10% 할인된 가격을 계산해줘"
    stream_agent(query)
