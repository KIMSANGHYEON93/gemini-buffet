# ReAct Agent - @tool Decorator Pattern

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

## Docstring 작성 규칙

1. **첫 줄**: 도구 설명 — LLM이 이 도구를 언제 사용할지 판단하는 핵심 문장
2. **Args 섹션**: 각 파라미터 설명 — LLM이 올바른 값을 전달하도록 안내
3. 반환 타입은 `str` 권장 (LLM이 결과를 읽기 쉬움)

## 도구 호출 방식 (테스트 시)

```python
# @tool 도구는 dict로 invoke
result = my_tool.invoke({"param1": "hello", "param2": 42})

# TavilySearch 등 기본 도구는 str로 invoke
result = web_search.invoke("검색어")
```

## 프로젝트 도구 목록

| 도구 | 타입 | 용도 |
|------|------|------|
| `web_search` | TavilySearch | 실시간 웹 검색 |
| `save_to_file` | @tool | 파일 저장 (output/) |
| `calculator` | @tool + numexpr | 수식 계산 |
