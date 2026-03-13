# 제미나이 버핏 (Gemini Buffett) 📈

**유튜브 '데이터가답이다'의 안티그래비티를 활용한 제미나이버핏 종목분석플랫폼 개발 프로젝트입니다.**

이 프로젝트는 구글의 최신 AI 모델인 **Gemini 2.5 Flash**와 **Google Search Grounding**, **Google File Search (RAG)** 기술을 활용하여, 전설적인 투자자 워렌 버핏의 페르소나로 실시간 주식 분석을 제공하는 웹 애플리케이션입니다.

![Doge Buffett Persona](public/dogebuffett.png)

## 🆕 v2 주요 업데이트

### RAG 시스템 구현
- **버크셔 해서웨이 주주 서한 통합**: 21년치 버핏의 주주 서한을 Google File Search Store에 인덱싱
- **실제 인용 기반 분석**: AI가 주주 서한에서 관련 내용을 검색하여 실제 인용과 함께 분석 제공
- **2단계 분석 아키텍처**: 
  1. RAG로 주주 서한에서 투자 철학 검색
  2. Google Search로 실시간 데이터를 가져와 통합 분석

### 심층 재무 분석
- **5가지 핵심 지표**: P/E Ratio, Market Cap, Dividend Yield, ROE, Free Cash Flow
- **버핏의 투자 원칙 적용**: 경제적 해자(Economic Moat), 경영진 정직성, 현금 흐름 중심 분석
- **한국어 분석 제공**: 모든 분석 결과가 한국어로 제공됩니다

## 🚀 v3 주요 업데이트

### MCP 서버 통합
- **GitHub API MCP 서버**: FastMCP 기반으로 저장소 정보, PR 목록, 릴리즈 조회 도구 제공
- **FastMCP Best Practices 적용**: timeout(15s), tags 분류, annotations(readOnlyHint 등) 설정
- **모듈 분리 구조**: `main.py` / `tools.py` / `github_client.py`로 책임 분리

### 웹 검색 에이전트
- **LangGraph ReAct 에이전트**: Claude API + Tavily 웹 검색 기반 멀티턴 대화 에이전트
- **스트리밍 응답**: 에이전트 실행 과정을 단계별로 실시간 출력
- **대화 메모리**: 멀티턴 컨텍스트 유지 및 대화 이력 관리

### Context7 MCP 연동
- **실시간 라이브러리 문서 조회**: Context7 MCP 서버를 통해 최신 라이브러리 문서 및 코드 예제 검색

## 프로젝트 구조

```
gemini-buffet/
├── app/                          # Next.js 14 메인 앱
│   ├── api/analyze/              # 주식 분석 API (Gemini + RAG + Search)
│   ├── api/web-search-agent/     # 웹 검색 에이전트 API
│   ├── agent/                    # 에이전트 채팅 UI
│   └── components/               # UI 컴포넌트 (3D Scene, GlassCard)
├── web-search-agent/             # LangGraph ReAct 에이전트 (Python)
│   ├── agents/                   # 에이전트 팩토리
│   ├── tools.py                  # 도구 정의 (web_search, calculator, file_save)
│   ├── agent_memory.py           # 대화 메모리 관리
│   └── agent_stream.py           # 스트리밍 응답 처리
├── github-mcp-server/            # GitHub API MCP 서버 (FastMCP)
│   ├── main.py                   # 서버 엔트리포인트
│   ├── tools.py                  # MCP 도구 (repo, PR, release 조회)
│   └── github_client.py          # GitHub REST API 클라이언트
├── scripts/                      # RAG 스토어 설정 스크립트
└── .mcp.json                     # MCP 서버 설정
```

## 🗺️ DDD 확장 로드맵

현재 `app/api/analyze/route.ts`에 RAG 호출, 검색, 프롬프트 조합, 응답 포맷팅이 모두 포함된 모놀리식 구조입니다. 향후 DDD(Domain-Driven Design) 패턴으로 리팩토링하여 테스트 가능성과 확장성을 높일 계획입니다.

### 바운디드 컨텍스트 (Bounded Contexts)

| 컨텍스트 | 현재 상태 | 목표 |
|----------|----------|------|
| **Stock Analysis** | `route.ts`에 인라인 | 주식 분석 도메인 서비스로 분리 |
| **Buffett Wisdom** | RAG 호출이 route에 혼재 | RAG 전용 리포지토리 + 도메인 모델 |
| **Market Data** | Google Search 직접 호출 | 실시간 데이터 어댑터로 추상화 |
| **Chat Agent** | 단일 route 핸들러 | 에이전트 오케스트레이션 서비스 |

### 목표 구조

```
src/
├── domain/
│   ├── stock/                # 주식 분석 도메인
│   │   ├── entities/         # StockSymbol, AnalysisResult
│   │   ├── services/         # BuffettAnalysisService
│   │   └── repositories/     # RAG 조회 인터페이스
│   └── buffett/              # 버핏 페르소나 도메인
│       └── valueObjects/     # InvestmentPrinciple, Quote
├── application/
│   └── useCases/             # AnalyzeStockUseCase
├── infrastructure/
│   ├── gemini/               # Gemini API 클라이언트
│   ├── rag/                  # Google File Search 어댑터
│   └── search/               # Google Search Grounding 어댑터
└── presentation/
    ├── api/                  # Next.js route handlers
    └── components/           # React UI 컴포넌트
```

## 활용 방법 (Getting Started)

아래 가이드를 따라 직접 프로젝트를 실행해보세요.

### 필수 조건 (Prerequisites)

-   Node.js 18 버전 이상이 설치되어 있어야 합니다.
-   Google AI Studio에서 발급받은 API Key가 필요합니다.

### 설치 및 실행 (Installation)

1.  **저장소 복제 (Clone)**

    터미널을 열고 아래 명령어를 입력하여 프로젝트를 다운로드합니다.

    ```bash
    git clone https://github.com/melocream/gemini-buffet.git
    cd gemini-buffet
    ```

2.  **패키지 설치 (Install Dependencies)**

    필요한 라이브러리를 설치합니다.

    ```bash
    npm install
    ```

3.  **환경 변수 설정 (Environment Setup)**

    프로젝트 루트 경로에 `.env.local` 파일을 생성하고, 발급받은 구글 API 키를 입력해주세요.

    ```env
    GOOGLE_API_KEY=여기에_당신의_API_키를_입력하세요
    ```

4.  **개발 서버 실행 (Run Server)**

    아래 명령어로 서버를 실행합니다.

    ```bash
    npm run dev
    ```

5.  **앱 사용하기**

    브라우저에서 [http://localhost:3000](http://localhost:3000) (또는 터미널에 표시된 주소)으로 접속하여 종목명(예: AAPL, 삼성전자)을 입력하고 분석 결과를 확인해보세요!

## 주요 기능

-   **RAG 기반 인용 분석**: 버핏의 주주 서한에서 실제 내용을 검색하여 인용과 함께 분석 제공
-   **실시간 데이터 분석**: Gemini의 검색 기능을 통해 최신 주가, 뉴스, 재무 정보를 실시간으로 가져옵니다
-   **심층 재무 지표**: ROE, Free Cash Flow, Economic Moat 등 버핏이 중시하는 지표 중심 분석
-   **워렌 버핏 페르소나**: 버핏 특유의 위트와 통찰력이 담긴 투자 의견을 한국어로 제공
-   **핀테크 다크 모드**: 눈이 편안하고 세련된 다크 테마 UI

## 기술 스택

-   **Framework**: Next.js 14 (App Router)
-   **AI Model**: Google Gemini 2.5 Flash
-   **RAG**: Google File Search (21년치 버핏 주주 서한 인덱싱)
-   **Styling**: Tailwind CSS
-   **Language**: TypeScript
-   **Data Collection**: Python (pypdf, BeautifulSoup)

## 아키텍처

### 2단계 분석 프로세스
1. **RAG 쿼리**: Google File Search Store에서 관련 주주 서한 내용 검색
2. **실시간 통합**: Google Search로 현재 시장 데이터를 가져와 RAG 결과와 통합

### 데이터 파이프라인
- `download_letters.py`: 버크셔 해서웨이 주주 서한 자동 다운로드 및 병합
- `scripts/setup_rag.js`: File Search Store 생성 및 PDF 업로드 (1회 실행)
- `app/api/analyze/route.ts`: 2단계 분석 API 엔드포인트

## 라이선스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.
