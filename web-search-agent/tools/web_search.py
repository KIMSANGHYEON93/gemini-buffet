from langchain_community.tools.tavily_search import TavilySearchResults

web_search_tool = TavilySearchResults(
    name="web_search",
    description=(
        "Search the web for current information using Tavily. "
        "Use this for real-time stock prices, news, market data, "
        "company financials, or any recent events. "
        "Input should be a search query string."
    ),
    max_results=5,
)
