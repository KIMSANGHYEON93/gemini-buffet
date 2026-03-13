# GitHub MCP Server

FastMCP 기반 GitHub REST API MCP 서버입니다. 저장소 정보, PR 목록, 최신 릴리즈를 조회할 수 있습니다.

## 제공 도구

| 도구 | 설명 | Tags |
|------|------|------|
| `get_repo_info` | 저장소 메타데이터 조회 (스타, 포크, 설명 등) | `github`, `repository` |
| `list_open_prs` | 열린 PR 목록 조회 (최대 30개) | `github`, `pull-request` |
| `get_latest_release` | 최신 릴리즈 정보 조회 | `github`, `release` |

모든 도구에 `timeout=15s`, `readOnlyHint=True`, `idempotentHint=True` 설정이 적용되어 있습니다.

## 프로젝트 구조

```
github-mcp-server/
├── main.py            # FastMCP 서버 엔트리포인트
├── tools.py           # @mcp.tool() 도구 정의 (3개)
├── github_client.py   # GitHub REST API 클라이언트 (httpx 비동기)
├── pyproject.toml     # 프로젝트 설정
└── .env               # GITHUB_TOKEN 환경변수
```

## 설치 및 실행

```bash
cd github-mcp-server

# 의존성 설치
uv sync

# 서버 실행
uv run python main.py
```

## 환경 변수

`.env` 파일을 생성하고 GitHub Personal Access Token을 설정합니다.

```env
GITHUB_TOKEN=ghp_your_token_here
```

토큰이 없어도 비인증 모드로 동작하지만, API rate limit이 적용됩니다.

## MCP 클라이언트 설정

`.mcp.json`에 아래와 같이 추가합니다:

```json
{
  "github-mcp-server": {
    "command": "uv",
    "args": ["run", "--directory", "github-mcp-server", "python", "main.py"]
  }
}
```
