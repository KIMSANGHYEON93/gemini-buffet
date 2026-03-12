"""GitHub API MCP Server

FastMCP로 구현한 GitHub API MCP 서버.
도구: get_repo_info, list_open_prs, get_latest_release.
"""

import os
from dotenv import load_dotenv
import httpx
from fastmcp import FastMCP

load_dotenv()

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_API = "https://api.github.com"

mcp = FastMCP("GitHub MCP Server")


def _headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


@mcp.tool()
async def get_repo_info(owner: str, repo: str) -> str:
    """Get basic information about a GitHub repository.

    Use this tool to retrieve a repository's description, star count,
    fork count, language, and other metadata.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=_headers(),
        )
        resp.raise_for_status()
        data = resp.json()

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


@mcp.tool()
async def list_open_prs(owner: str, repo: str, limit: int = 5) -> str:
    """List open pull requests for a GitHub repository.

    Use this tool to see the most recent open PRs with their title,
    author, and creation date.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
        limit: Maximum number of PRs to return (default 5, max 30).
    """
    limit = min(max(limit, 1), 30)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/pulls",
            headers=_headers(),
            params={"state": "open", "per_page": limit, "sort": "created", "direction": "desc"},
        )
        resp.raise_for_status()
        prs = resp.json()

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


@mcp.tool()
async def get_latest_release(owner: str, repo: str) -> str:
    """Get the latest release of a GitHub repository.

    Use this tool to find the most recent release version, release date,
    and release notes.

    Args:
        owner: The repository owner (user or organization), e.g. "facebook".
        repo: The repository name, e.g. "react".
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/releases/latest",
            headers=_headers(),
        )
        if resp.status_code == 404:
            return f"No releases found for {owner}/{repo}."
        resp.raise_for_status()
        data = resp.json()

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


if __name__ == "__main__":
    mcp.run()
