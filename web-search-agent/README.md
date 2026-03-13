# Buffett Web Search Agent

LangChain ReAct 에이전트 - 웹 검색, 계산기, 파일 저장 도구를 갖춘 AI 투자 분석 에이전트.

## 아키텍처

```
ReAct Agent (Thought → Action → Observation 루프)
├── LLM: Gemini 2.0 Flash 또는 Claude Sonnet
├── Tool: web_search (Tavily API) - 실시간 웹 검색
├── Tool: calculator (numexpr) - 수학 계산
└── Tool: file_save - 분석 결과 파일 저장
```

## 설치

```bash
cd web-search-agent
pip install -r requirements.txt
```

## 환경 변수 설정

```bash
cp .env.example .env
# .env 파일에 API 키 입력
```

| 변수 | 설명 |
|------|------|
| `TAVILY_API_KEY` | Tavily 검색 API 키 |
| `GOOGLE_API_KEY` | Google Gemini API 키 |
| `ANTHROPIC_API_KEY` | Anthropic Claude API 키 |
| `DEFAULT_LLM` | 기본 LLM (`gemini` 또는 `claude`) |

## 실행

```bash
# Gemini 사용 (기본값)
python main.py

# Claude 사용
python main.py claude

# Gemini 명시적 지정
python main.py gemini
```

## 사용 예시

```
You: NVIDIA의 현재 P/E ratio를 검색하고 적정 주가를 계산해줘
Agent: (웹 검색 → 계산 → 분석 결과 제공)

You: 분석 결과를 nvidia_analysis.md로 저장해줘
Agent: (파일 저장 완료)
```

## 도구 설명

- **web_search**: Tavily API를 통한 실시간 웹 검색 (주가, 뉴스, 재무 데이터)
- **calculator**: 수학 표현식 계산 (P/E, ROE, 복리 수익률 등)
- **file_save**: 분석 결과를 `output/` 디렉토리에 파일로 저장
