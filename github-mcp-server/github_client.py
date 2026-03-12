"""GitHub API Client

httpx 기반 비동기 GitHub REST API v3 클라이언트.
공통 헤더, 인증, API 요청 로직을 관리.
"""

import os
from dotenv import load_dotenv
import httpx

load_dotenv()

_raw_token = os.environ.get("GITHUB_TOKEN", "")
GITHUB_TOKEN = _raw_token if _raw_token.startswith(("ghp_", "github_pat_")) else ""
GITHUB_API = "https://api.github.com"


def _headers() -> dict[str, str]:
    headers = {"Accept": "application/vnd.github.v3+json"}
    if GITHUB_TOKEN:
        headers["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return headers


async def fetch_repo(owner: str, repo: str) -> dict:
    """GET /repos/{owner}/{repo} — 저장소 메타데이터 조회."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}",
            headers=_headers(),
        )
        resp.raise_for_status()
        return resp.json()


async def fetch_open_prs(owner: str, repo: str, limit: int = 5) -> list[dict]:
    """GET /repos/{owner}/{repo}/pulls — 열린 PR 목록 조회."""
    limit = min(max(limit, 1), 30)
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/pulls",
            headers=_headers(),
            params={"state": "open", "per_page": limit, "sort": "created", "direction": "desc"},
        )
        resp.raise_for_status()
        return resp.json()


async def fetch_latest_release(owner: str, repo: str) -> dict | None:
    """GET /repos/{owner}/{repo}/releases/latest — 최신 릴리즈 조회.

    릴리즈가 없으면 None을 반환.
    """
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{GITHUB_API}/repos/{owner}/{repo}/releases/latest",
            headers=_headers(),
        )
        if resp.status_code in (404, 403):
            return None
        resp.raise_for_status()
        return resp.json()
