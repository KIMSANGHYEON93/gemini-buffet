import os
from langgraph.prebuilt import create_react_agent as _create_react_agent
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from tools import web_search_tool, file_save_tool, calculator_tool

SYSTEM_PROMPT = (
    "You are Warren Buffett's AI research assistant with access to real-time web search, "
    "a calculator, and the ability to save files.\n\n"
    "You combine the Oracle of Omaha's timeless investment wisdom with current market data. "
    "Always ground your analysis in Buffett's principles: value investing, economic moats, "
    "margin of safety, management quality, and long-term compounding.\n\n"
    "When the user asks a question:\n"
    "1. Search the web for current data when needed\n"
    "2. Use the calculator for any numerical analysis\n"
    "3. Save results to a file when the user requests it\n"
    "4. Provide clear, actionable investment insights\n\n"
    "Respond in the same language the user writes in."
)

TOOLS = [web_search_tool, file_save_tool, calculator_tool]


def _get_llm(provider: str):
    """Return an LLM instance based on the provider name."""
    provider = provider.lower().strip()

    if provider in ("gemini", "google"):
        return ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=os.environ.get("GOOGLE_API_KEY"),
            temperature=0.3,
            convert_system_message_to_human=True,
        )
    elif provider in ("claude", "anthropic"):
        return ChatAnthropic(
            model="claude-sonnet-4-20250514",
            anthropic_api_key=os.environ.get("ANTHROPIC_API_KEY"),
            temperature=0.3,
        )
    else:
        raise ValueError(f"Unknown LLM provider: {provider}. Use 'gemini' or 'claude'.")


def create_react_agent(provider: str | None = None):
    """Create and return a LangGraph ReAct agent.

    Args:
        provider: LLM provider to use - "gemini" or "claude".
                  Defaults to the DEFAULT_LLM env var, or "gemini".
    """
    if provider is None:
        provider = os.environ.get("DEFAULT_LLM", "gemini")

    llm = _get_llm(provider)

    return _create_react_agent(
        model=llm,
        tools=TOOLS,
        prompt=SYSTEM_PROMPT,
    )
