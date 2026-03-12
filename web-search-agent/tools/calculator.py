import numexpr
from langchain.tools import tool


@tool
def calculator_tool(expression: str) -> str:
    """Evaluate a mathematical expression and return the result.

    Use this for any calculations: P/E ratios, percentage changes,
    portfolio returns, compound interest, unit conversions, etc.

    Args:
        expression: A mathematical expression to evaluate.
                    Examples: "100 * 1.08 ** 10", "(250 - 180) / 180 * 100",
                    "50000 * 0.04 / 12"
    """
    try:
        result = numexpr.evaluate(expression).item()
        return f"{expression} = {result}"
    except Exception as e:
        return f"Error evaluating '{expression}': {e}"
