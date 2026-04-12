"""Buffett Web Search Agent - Tools

Three tools for the ReAct agent:
1. web_search: Tavily API web search (langchain-tavily)
2. save_to_file: @tool decorator for file saving
3. calculator: @tool + numexpr for math expression evaluation
"""

import os
import math
from datetime import datetime

import numexpr
from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_tavily import TavilySearch

# Load environment variables
load_dotenv()

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "output")

# --- Tool 1: Web Search (Tavily) ---

web_search = TavilySearch(
    name="web_search",
    max_results=5,
    topic="general",
)


# --- Tool 2: File Saver ---

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
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    filepath = os.path.join(OUTPUT_DIR, filename)

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"File saved successfully: {filepath} (at {timestamp})"


# --- Tool 3: Calculator ---

@tool
def calculator(expression: str) -> str:
    """Calculate a mathematical expression using Python's numexpr library.

    Expression should be a single line mathematical expression
    that solves the problem.

    Args:
        expression: A mathematical expression to evaluate.
                    Examples: "100 * 1.08 ** 10", "(250 - 180) / 180 * 100",
                    "50000 * 0.04 / 12"
    """
    try:
        local_dict = {"pi": math.pi, "e": math.e}
        result = numexpr.evaluate(expression, local_dict=local_dict).item()
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error evaluating '{expression}': {e}"


# All tools list
tools = [web_search, save_to_file, calculator]

if __name__ == "__main__":
    # Print registered tools
    print("=" * 50)
    print("Registered tools:")
    for t in tools:
        print(f"  - {t.name}")
    print("=" * 50)

    # Test web_search with a sample query
    print("\n[Test] web_search: '서울 날씨'")
    print("-" * 50)
    results = web_search.invoke("서울 날씨")
    print(results)

    # Test save_to_file
    print("\n[Test] save_to_file: 'test.txt'")
    print("-" * 50)
    result = save_to_file.invoke({"filename": "test.txt", "content": "테스트 내용"})
    print(result)

    # Test calculator
    print("\n[Test] calculator: '2 + 3 * 4'")
    print("-" * 50)
    result = calculator.invoke({"expression": "2 + 3 * 4"})
    print(result)

    print("\n[Test] calculator: '100 / 7'")
    print("-" * 50)
    result = calculator.invoke({"expression": "100 / 7"})
    print(result)
