# 📚 데이터 인류학 살롱 (Data Anthropology Salon)

> **"숫자 너머의 사람을 읽는 분석가들을 위한 독서 아카이브"**


## 데이터 인류학 살롱 — 최종 프로젝트 보고서

> **프로젝트명**: 데이터 인류학 살롱 (Data Humanists Book Club)  
> **보고서 목적**: 아키텍처 구조, 코딩 설계, 수정 이력 정리  
> **저장소**: https://github.com/kuroMJ-rider/bookclub

---

## 1. 프로젝트 개요

### 1.1 목적

- **숫자 너머의 사람을 읽는 분석가들**을 위한 독서·지식 아카이브 웹앱
- 인상 깊은 문장, 면접 답변 매칭, 함께 읽은 도서, 영감 공유를 **한 앱**에서 기록·관리
- Supabase에 저장 + 선택 시 **Notion 데이터베이스로 내보내기**로 지식 자산화

### 1.2 핵심 가치

- **Burden Zero**: 완독 필수 아님, 문장 단위 기록
- **Output First**: 포트폴리오·면접 답변으로 연결
- **Active Archiving**: 노션 등 외부 DB와 연동해 아카이빙

### 1.3 기술 스택

| 구분 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router), React 19 |
| 스타일 | Tailwind CSS v4 |
| DB | Supabase (PostgreSQL) |
| 외부 연동 | Notion API (v2025-09-03) |
| 아이콘 | lucide-react |
| 배포 | Vercel |
| 개발 | TypeScript, Cursor |

---

## 2. 아키텍처 구조

### 2.1 디렉터리 구조

```
VIBE CODING/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (폰트, 메타, body)
│   ├── page.tsx            # 단일 페이지: 4탭(홈/여정/저장소/영감) + 노션 설정 모달
│   ├── globals.css         # Tailwind, 테마 변수, 다크 모드 베이스
│   ├── favicon.ico
│   └── api/
│       └── notion/
│           └── route.ts     # Notion 내보내기 API (POST)
├── lib/
│   └── supabase.ts         # Supabase 브라우저 클라이언트 생성
├── public/                 # 정적 자산
├── next.config.ts          # 리다이렉트 (/page, /index → /)
├── package.json
├── SUPABASE_SCHEMA.md      # DB 스키마 및 RLS 정책 (실행용 SQL)
├── README.md
├── DOCUMENT.md
└── REPORT_FINAL.md         # 본 보고서
```

- **단일 페이지 SPA 구조**: 라우트는 `/` 하나, 탭 전환으로 홈/여정/저장소/영감 구분
- **API Route**: `/api/notion` 만 사용 (노션 페이지 생성)

### 2.2 데이터 흐름

```
[브라우저]
  │
  ├─ Supabase (CRUD)
  │    ├── archives (quote / interview)
  │    ├── books (함께 읽은 도서)
  │    └── insights (영감 공유)
  │
  ├─ localStorage
  │    └── 노션 설정 (API Key, Data source ID, Database ID, 제목 속성명)
  │
  └─ POST /api/notion
       └── Notion API (데이터베이스 조회 → 페이지 생성, 2025-09-03)
```

- **읽기/쓰기**: Supabase 클라이언트로 직접 `from('archives')` 등 호출
- **노션**: API Key·DB/Data source ID는 클라이언트에서 보관, 서버 API에서만 Notion 호출

### 2.3 화면 구조 (탭)

| 탭 | 역할 | 데이터 소스 |
|----|------|-------------|
| **홈** | D-day 공지, 북클럽 3대 원칙, 노션 바로가기 링크 | 정적 + NOTION_URL 상수 |
| **여정** | OT·단계별 일정 및 도서 목록 | `journeySteps` 상수 |
| **저장소** | 인상 깊은 문장 / 면접 답변 매칭 / 함께 읽은 도서 | Supabase `archives`, `books` |
| **영감** | 영감 공유·필터·좋아요 | Supabase `insights` |

---

## 3. 코딩 설계

### 3.1 상태 관리

- **React useState / useCallback / useEffect** 만 사용 (전역 스토어 없음)
- **탭**: `activeTab` (home | journey | archive | insight)
- **저장소 서브탭**: `archiveSubTab` (quote | interview | books)
- **노션 설정**: `showNotionSettings` + 모달용 state, 저장 시 `localStorage` 반영
- **폼·리스트·로딩·에러**는 각 탭/기능별 state (quotes, interviews, books, insights 등)

### 3.2 컴포넌트 구성 (app/page.tsx)

- **한 파일**에 모든 탭 콘텐츠를 함수 컴포넌트로 분리:
  - `HomeTabContent`
  - `JourneyTabContent`
  - `ArchiveTabContent` (인상 깊은 문장, 면접 답변, 함께 읽은 도서)
  - `InsightTabContent`
- **루트**: `Page` — 헤더(로고·노션 설정 버튼), 노션 설정 모달, 스크롤 영역(탭 콘텐츠), 하단 탭 바
- **공통**: Toast 메시지, 에러 문구, 버튼/카드 스타일은 Tailwind 클래스로 통일

### 3.3 Notion API 설계 (app/api/notion/route.ts)

- **역할**: 저장소 카드에서 «노션으로 내보내기» 시 호출
- **입력**: `apiKey`, `databaseId`(선택), `dataSourceId`(선택), `type`(quote | interview), `payload`, `titleProperty`
- **처리**:
  1. `dataSourceId`가 있으면 해당 ID로 페이지 생성
  2. 없으면 `databaseId`로 `GET /v1/databases` 호출 후 `data_sources[0].id` 사용
  3. `POST /v1/pages` — `parent: { data_source_id }`, `Notion-Version: 2025-09-03`
- **속성**: 제목(book_title/keyword), 본문은 quote 블록 + paragraph(나의 생각/답변). quote 타입 시 properties에 `quote`, `thought`(rich_text) 추가
- **에러**: 403/404/401 등에 대해 한글 안내 메시지 반환, 서버 로그에 상세 출력

### 3.4 Supabase 스키마 요약

| 테이블 | 용도 | 주요 컬럼 |
|--------|------|-----------|
| **archives** | 인상 깊은 문장 + 면접 답변 | type(quote|interview), book_title, quote, thought, author, keyword, question, answer |
| **books** | 함께 읽은 도서 | title, author, publisher, url |
| **insights** | 영감 공유 | title, url, category, description, author, likes |

- 모든 테이블 **RLS 활성화**, 정책은 `using (true)`, `with check (true)` 로 전체 허용 (프로젝트 규모에 맞춘 설정)

### 3.5 UI/UX 설계 원칙

- **다크 모드**: `dark:` 접두사로 전역 대응 (배경: slate-950/900, 텍스트: slate-100/400, 입력 필드 명암비 확보)
- **메인 컬러**: primary(다크 그린/틸) — 버튼, 강조, D-day·여정 카드
- **접근성**: WCAG AA 수준 가독성, placeholder·라벨 명확화
- **반응형**: 모바일 우선, 하단 탭 바 고정

---

## 4. 주요 수정·개선 이력

### 4.1 노션 연동

- **Discovery**: 사용자 Database ID로 `GET /v1/databases` 호출 후 `data_sources[0].id` 사용
- **페이지 생성**: `parent: { data_source_id }`, Notion-Version `2025-09-03`
- **Data source ID 직접 입력** 지원: DB 조회 생략, 404 방지
- **제목·본문**: book_title/keyword → 제목 속성; quote 블록 + paragraph; quote 타입 시 properties에 quote·thought(rich_text) 추가
- **에러 메시지**: 403(연결 추가), 404(DB/연동 확인) 등 한글 안내 + 서버 로그 상세화

### 4.2 저장소 탭

- **함께 읽은 도서** 메뉴 추가: 제목·저자·출판사·URL 입력, Supabase `books` 테이블 사용
- **테이블/컬럼 없음** 시 안내: schema cache·relation 오류일 때 «SUPABASE_SCHEMA.md 3번 SQL 실행» 메시지
- **SUPABASE_SCHEMA.md**: `books` 생성 및 `url` 등 컬럼 추가용 `ALTER` 예시 보강

### 4.3 UI/UX

- **다크 모드**: 배경/카드/텍스트/입력 전반에 `dark:` 적용, placeholder 명암비 조정
- **여정 탭**: 단계 제목 `font-extrabold`, 크기 확대; 다가오는 일정(OT) 카드 컬러를 amber → primary(다크 그린)로 통일
- **홈 탭**: D-day 카드 블루 → primary 계열로 통일
- **메인 페이지**: «북클럽 3대 운영 원칙» 문구·가운데 정렬, 번호 리스트·노션 바로가기 버튼 스타일 정리

### 4.4 기타

- **노션 내보내기** 버튼: 클릭/터치 미동작 대응 — div→button 복귀, `onTouchEnd`·throttle·z-index 조정
- **디버깅**: 내보내기 시 localStorage·버튼 클릭 로그, API 오류 시 alert
- **라우팅**: `next.config.ts`에서 `/page`, `/index` → `/` 리다이렉트

---

## 5. 배포 및 운영

### 5.1 환경 변수

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local`)
- **노션**: API Key·Data source ID·Database ID·제목 속성명은 **localStorage** (클라이언트만)

### 5.2 배포 (Vercel)

- **연동**: GitHub 저장소 `kuroMJ-rider/bookclub`, Production 브랜치 `main`
- **흐름**: `git push origin main` → Vercel 자동 빌드·배포
- **로컬**: `npm run dev` (포트 3002)

### 5.3 문서

- **SUPABASE_SCHEMA.md**: 테이블 생성·RLS·에러 대응, books 테이블/컬럼 추가 SQL
- **README.md**: 프로젝트 소개, 기술 스택, 실행 방법
- **DOCUMENT.md**: (프로젝트별 추가 문서)
- **REPORT_FINAL.md**: 본 최종 보고서

---

## 6. 요약

| 항목 | 내용 |
|------|------|
| **아키텍처** | Next.js App Router 단일 페이지, Supabase + Notion API, localStorage(노션 설정) |
| **코딩 설계** | 탭별 컴포넌트 분리, 로컬 state, Notion 2025-09-03·data_source_id 기반 내보내기 |
| **DB** | archives(quote/interview), books, insights — RLS 적용 |
| **수정 초점** | 노션 연동 안정화, 다크 모드·컬러 통일, 도서 목록·에러 안내, 버튼 동작 보완 |
| **배포** | Vercel, main 푸시 시 자동 배포 |

이 문서는 프로젝트의 **아키텍처, 코딩 설계, 수정 이력**을 한곳에 정리한 최종 보고서입니다.  
추가 기능이나 스키마 변경 시 이 보고서와 `SUPABASE_SCHEMA.md`를 함께 업데이트하는 것을 권장합니다.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
