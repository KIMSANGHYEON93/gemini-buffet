# ReAct Agent - 재사용 패턴 가이드

## @tool 데코레이터 기본 패턴

```python
from langchain_core.tools import tool

@tool
def my_tool(param1: str, param2: int) -> str:
    """Tool description (first line = LLM이 보는 설명).

    Args:
        param1: Description of param1.
        param2: Description of param2.
    """
    return f"result: {param1}, {param2}"
```

## @tool 좋은 Docstring 예시

```python
@tool
def save_to_file(filename: str, content: str) -> str:
    """Save content to a file in the output directory.

    Use this tool when the user asks to save analysis results, notes,
    or any text content to a file. The file will be saved under the
    output/ directory.

    Args:
        filename: Name of the file to save (e.g. "analysis.txt", "report.md").
        content: The text content to write to the file.
    """

@tool
def calculator(expression: str) -> str:
    """Calculate a mathematical expression using Python's numexpr library.

    Expression should be a single line mathematical expression
    that solves the problem.

    Args:
        expression: A mathematical expression to evaluate.
                    Examples: "100 * 1.08 ** 10", "(250 - 180) / 180 * 100"
    """
```

핵심 규칙:
1. **첫 줄**: LLM이 도구 선택 시 참고하는 핵심 설명
2. **추가 설명**: 언제 이 도구를 사용해야 하는지 구체적으로 안내
3. **Args**: 각 파라미터의 의미와 예시 — LLM이 올바른 값을 전달하도록 유도
4. 반환 타입은 `str` 권장 (LLM이 결과를 읽기 쉬움)

## 도구 호출 방식 (테스트 시)

```python
# @tool 도구는 dict로 invoke
result = save_to_file.invoke({"filename": "test.txt", "content": "내용"})

# TavilySearch 등 기본 도구는 str로 invoke
result = web_search.invoke("검색어")
```

## messages 리스트 기반 멀티턴 패턴

LangChain 메시지 객체를 그대로 보존해야 `tool_use`/`tool_result` 쌍이 유지된다.
dict로 변환하면 도구 호출 정보가 유실되어 다음 턴에서 400 에러 발생.

```python
from langchain_core.messages import HumanMessage

messages = []  # LangChain 메시지 객체 저장

def chat(user_input: str) -> str:
    messages.append(HumanMessage(content=user_input))

    result = agent.invoke({"messages": messages})

    # 전체 메시지 리스트를 그대로 교체 (tool_use/tool_result 포함)
    messages.clear()
    messages.extend(result["messages"])

    ai_messages = [m for m in messages if m.type == "ai" and m.content]
    return ai_messages[-1].content if ai_messages else "(no response)"
```

주의: `messages`에 `{"role": "assistant", "content": ...}` dict로 변환하면 안 됨.
`AIMessage`, `ToolMessage` 등 원본 객체를 그대로 유지해야 함.

## stream() 실시간 출력 패턴

```python
for chunk in agent.stream(
    {"messages": [{"role": "user", "content": query}]}
):
    for node_name, node_output in chunk.items():
        msgs = node_output.get("messages", [])

        for msg in msgs:
            # 도구 호출
            if msg.type == "ai" and hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    print(f"도구 사용: {tc['name']}")
                    print(f"입력값: {tc.get('args', {})}")

            # 관찰 결과 (도구 실행 결과)
            elif msg.type == "tool":
                content = str(msg.content)
                print(f"관찰 결과: {content[:100]}...")

            # 최종 답변 (도구 호출 없는 AI 메시지)
            elif msg.type == "ai" and msg.content:
                print(f"최종 답변:\n{msg.content}")
```

chunk 구조: `{node_name: {"messages": [BaseMessage, ...]}}` — node별로 메시지 배열.

## 에러 처리 패턴

```python
from anthropic import RateLimitError, APITimeoutError, APIError

for attempt in range(max_retries):
    try:
        result = agent.invoke({"messages": messages})
        return extract_answer(result)
    except RateLimitError:
        time.sleep(2 ** (attempt + 1))  # 지수 백오프
    except APITimeoutError:
        return "[Error] Request timed out."
    except APIError as e:
        return f"[Error] API error: {e.message}"
```

에러 시 미응답 `HumanMessage`를 `messages.pop()`으로 제거해야 히스토리 오염 방지.

## 프로젝트 도구 목록

| 도구 | 타입 | 용도 |
|------|------|------|
| `web_search` | TavilySearch | 실시간 웹 검색 |
| `save_to_file` | @tool | 파일 저장 (output/) |
| `calculator` | @tool + numexpr | 수식 계산 |
