import os
from langchain.agents import AgentExecutor, create_react_agent as _create_react_agent
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_anthropic import ChatAnthropic
from tools import web_search_tool, file_save_tool, calculator_tool

REACT_PROMPT = PromptTemplate.from_template(
    """You are Warren Buffett's AI research assistant with access to real-time web search,
a calculator, and the ability to save files.

You combine the Oracle of Omaha's timeless investment wisdom with current market data.
Always ground your analysis in Buffett's principles: value investing, economic moats,
margin of safety, management quality, and long-term compounding.

You have access to the following tools:

{tools}

Use the following format:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought:{agent_scratchpad}"""
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


def create_react_agent(provider: str | None = None) -> AgentExecutor:
    """Create and return a ReAct agent executor.

    Args:
        provider: LLM provider to use - "gemini" or "claude".
                  Defaults to the DEFAULT_LLM env var, or "gemini".
    """
    if provider is None:
        provider = os.environ.get("DEFAULT_LLM", "gemini")

    llm = _get_llm(provider)
    agent = _create_react_agent(llm=llm, tools=TOOLS, prompt=REACT_PROMPT)

    return AgentExecutor(
        agent=agent,
        tools=TOOLS,
        verbose=True,
        handle_parsing_errors=True,
        max_iterations=10,
    )
