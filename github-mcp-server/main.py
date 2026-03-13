"""GitHub API MCP Server

FastMCP로 구현한 GitHub API MCP 서버.
도구: get_repo_info, list_open_prs, get_latest_release.
"""

from fastmcp import FastMCP

mcp = FastMCP("GitHub MCP Server")

# tools.py를 import하면 @mcp.tool() 데코레이터가 실행되어 도구가 등록됨
import tools  # noqa: E402, F401

if __name__ == "__main__":
    mcp.run()
