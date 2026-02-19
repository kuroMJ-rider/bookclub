# Supabase 테이블 스키마 (이 앱에서 사용)

Supabase 대시보드 → SQL Editor에서 아래 쿼리로 테이블을 만들 수 있습니다.

## 1. 저장소 통합 테이블 (`archives`)

**인상 깊은 문장**과 **면접 답변**을 하나의 `public.archives` 테이블에서 관리합니다.  
`type` 값으로 구분합니다: `'quote'` = 인상 깊은 문장, `'interview'` = 면접 답변.

필수 컬럼: `id`, `type`, `book_title`, `quote`, `thought`, `author`, `keyword`, `question`, `answer`, `created_at`

```sql
create table public.archives (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('quote', 'interview')),
  book_title text default '',
  quote text default '',
  thought text default '',
  author text default '',
  keyword text default '',
  question text default '',
  answer text default '',
  created_at timestamptz default now()
);

-- 이미 테이블이 있다면 저자 컬럼만 추가:
-- alter table public.archives add column if not exists author text default '';
```

alter table public.archives enable row level security (RLS);

create policy "Allow all for archives"
  on public.archives for all
  using (true)
  with check (true);
```

## 2. 영감 공유 (`insights`)

```sql
create table public.insights (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text default '',
  category text not null check (category in ('article', 'video', 'resource', 'other')),
  description text default '',
  author text default '분석가 동료',
  likes int4 default 0,
  created_at timestamptz default now()
);

alter table public.insights enable row level security (RLS);

create policy "Allow all for insights"
  on public.insights for all
  using (true)
  with check (true);
```

---

## 에러가 날 때 확인할 것

1. **"relation does not exist"**  
   → 위 테이블(`archives`, `insights`)이 아직 없습니다. SQL Editor에서 순서대로 실행하세요.

2. **"new row violates row-level security policy"**  
   → RLS 정책이 없거나 `with check (true)`가 없습니다. 위 `create policy`를 추가하세요.

3. **"Invalid API key" / 401**  
   → `.env.local`의 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 Supabase 대시보드의 **anon public** 키와 같은지 확인하세요. (Project Settings → API)

4. **환경 변수가 안 보임**  
   → `.env.local` 수정 후 **개발 서버를 재시작**해야 합니다. (`npm run dev` 다시 실행)

## 3. 함께 읽은 도서 목록 (`books`)

저장소 탭의 **함께 읽은 도서** 메뉴에서 사용합니다.  
"Could not find the table 'public.books'" 오류가 나면 아래 SQL을 **Supabase 대시보드 → SQL Editor**에서 실행하세요.

```sql
create table public.books (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author text default '',
  publisher text default '',
  url text default '',
  created_at timestamptz default now()
);

alter table public.books enable row level security (RLS);

create policy "Allow all for books"
  on public.books for all
  using (true)
  with check (true);
```

**이미 `books` 테이블을 만들었는데 "column books.url does not exist" 오류가 나는 경우**  
아래만 SQL Editor에서 실행해 `url` 컬럼을 추가하세요.

```sql
alter table public.books add column if not exists url text default '';
```
