# 제미나이 버핏 (Gemini Buffett) 📈

**유튜브 '데이터가답이다'의 안티그래비티를 활용한 제미나이버핏 종목분석플랫폼 개발 프로젝트입니다.**

이 프로젝트는 구글의 최신 AI 모델인 **Gemini 2.5 Flash**와 **Google Search Grounding** 기술을 활용하여, 전설적인 투자자 워렌 버핏의 페르소나로 실시간 주식 분석을 제공하는 웹 애플리케이션입니다.

![Gemini Buffett Persona](public/geminibuffett.png)

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

    브라우저에서 [http://localhost:3000](http://localhost:3000) (또는 터미널에 표시된 주소)으로 접속하여 종목명(예: 삼성전자, Apple)을 입력하고 분석 결과를 확인해보세요!

## 주요 기능

-   **실시간 데이터 분석**: Gemini의 검색 기능을 통해 최신 주가, 뉴스, 재무 정보를 실시간으로 가져옵니다.
-   **워렌 버핏 페르소나**: 딱딱한 분석 대신, 버핏 특유의 위트와 통찰력이 담긴 투자 의견을 들려줍니다.
-   **핀테크 다크 모드**: 눈이 편안하고 세련된 다크 테마 UI를 제공합니다.

## 기술 스택

-   **Framework**: Next.js 14 (App Router)
-   **AI Model**: Google Gemini 2.5 Flash
-   **Styling**: Tailwind CSS
-   **Language**: TypeScript

## 라이선스

이 프로젝트는 [MIT License](LICENSE)를 따릅니다.
