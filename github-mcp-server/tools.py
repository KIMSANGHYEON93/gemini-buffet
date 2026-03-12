"""MCP Tool Definitions

@mcp.tool() 데코레이터로 등록되는 GitHub API 도구 3개.
github_client 모듈의 fetch 함수를 호출하고 결과를 포맷팅하여 반환.
"""

from main import mcp
import github_client


@mcp.tool(
    tags={"github", "repository"},
    timeout=15.0,
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def get_repo_info(owner: str, repo: str) -> str:
    """Get basic information about a GitHub repository.

    Use this tool to retrieve a repository's description, star count,
    fork count, language, and other metadata.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
    """
    data = await github_client.fetch_repo(owner, repo)

    return (
        f"Repository: {data['full_name']}\n"
        f"Description: {data.get('description', 'N/A')}\n"
        f"Language: {data.get('language', 'N/A')}\n"
        f"Stars: {data['stargazers_count']:,}\n"
        f"Forks: {data['forks_count']:,}\n"
        f"Open Issues: {data['open_issues_count']:,}\n"
        f"Created: {data['created_at']}\n"
        f"Updated: {data['updated_at']}\n"
        f"URL: {data['html_url']}"
    )


@mcp.tool(
    tags={"github", "pull-request"},
    timeout=15.0,
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def list_open_prs(owner: str, repo: str, limit: int = 5) -> str:
    """List open pull requests for a GitHub repository.

    Use this tool to see the most recent open PRs with their title,
    author, and creation date.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
        limit: Maximum number of PRs to return (default 5, max 30).
    """
    prs = await github_client.fetch_open_prs(owner, repo, limit)

    if not prs:
        return f"No open pull requests in {owner}/{repo}."

    lines = [f"Open PRs in {owner}/{repo} ({len(prs)}):"]
    for pr in prs:
        lines.append(
            f"  #{pr['number']} {pr['title']}\n"
            f"    Author: {pr['user']['login']} | Created: {pr['created_at']}\n"
            f"    URL: {pr['html_url']}"
        )
    return "\n".join(lines)


@mcp.tool(
    tags={"github", "release"},
    timeout=15.0,
    annotations={
        "readOnlyHint": True,
        "destructiveHint": False,
        "idempotentHint": True,
        "openWorldHint": True,
    },
)
async def get_latest_release(owner: str, repo: str) -> str:
    """Get the latest release of a GitHub repository.

    Use this tool to find the most recent release version, release date,
    and release notes.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
    """
    data = await github_client.fetch_latest_release(owner, repo)

    if data is None:
        return f"No releases found for {owner}/{repo}."

    body = data.get("body", "") or ""
    if len(body) > 500:
        body = body[:500] + "..."

    return (
        f"Latest Release: {data['tag_name']}\n"
        f"Name: {data.get('name', 'N/A')}\n"
        f"Published: {data['published_at']}\n"
        f"Author: {data['author']['login']}\n"
        f"URL: {data['html_url']}\n"
        f"\nRelease Notes:\n{body}"
    )
