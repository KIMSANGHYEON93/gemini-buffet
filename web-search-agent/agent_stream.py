"""Streaming Agent - 에이전트 실행 과정을 실시간으로 출력

agent.stream()을 사용하여 도구 호출, 관찰 결과, 최종 답변을 단계별로 출력.
각 단계마다 step 번호와 경과 시간을 표시하여 진행 상황을 추적.
"""

import os
import time
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
    print(f"\n{'='*60}")
    print(f"  질문: {query}")
    print(f"{'='*60}")
    print(f"\n에이전트 실행 시작...\n")

    final_answer = ""
    step = 0
    start_time = time.time()

    for chunk in agent.stream(
        {"messages": [{"role": "user", "content": query}]}
    ):
        for node_name, node_output in chunk.items():
            msgs = node_output.get("messages", [])

            for msg in msgs:
                elapsed = time.time() - start_time

                # AI message with tool calls
                if msg.type == "ai" and hasattr(msg, "tool_calls") and msg.tool_calls:
                    for tc in msg.tool_calls:
                        step += 1
                        print(f"[Step {step}] ({elapsed:.1f}s) 🔧 도구 호출: {tc['name']}")
                        args = tc.get("args", {})
                        for key, value in args.items():
                            val_str = str(value)
                            if len(val_str) > 80:
                                val_str = val_str[:80] + "..."
                            print(f"         ├─ {key}: {val_str}")
                        print(f"         └─ 실행 중...")

                # Tool result (observation)
                elif msg.type == "tool":
                    content = str(msg.content)
                    preview = content[:200] + "..." if len(content) > 200 else content
                    print(f"         ✅ 결과 수신 ({elapsed:.1f}s)")
                    for line in preview.split("\n")[:5]:
                        print(f"         │ {line}")
                    if content.count("\n") > 5:
                        print(f"         │ ... (총 {content.count(chr(10))+1}줄)")
                    print()

                # AI final answer (no tool calls, has content)
                elif msg.type == "ai" and msg.content:
                    final_answer = msg.content
                    total = time.time() - start_time
                    print(f"{'─'*60}")
                    print(f"  최종 답변 (총 {total:.1f}s, {step}개 도구 호출)")
                    print(f"{'─'*60}")
                    print(final_answer)
                    print()

    return final_answer


if __name__ == "__main__":
    print("Streaming Agent Demo")
    print(f"Model: claude-sonnet-4-20250514")
    print(f"Tools: {[t.name for t in tools]}")

    query = "최근 AI 뉴스 3가지를 검색해서 요약해줘"
    stream_agent(query)
