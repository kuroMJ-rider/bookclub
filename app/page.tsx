"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  Home,
  Map,
  Archive,
  Lightbulb,
  ExternalLink,
  FileText,
  Video,
  FolderOpen,
  Sparkles,
  Calendar,
  Settings,
  Rocket,
  Heart,
  PlusCircle,
  Loader2,
  Trash2,
  Check,
} from "lucide-react"

const NOTION_API_KEY_KEY = "notion_api_key"
const NOTION_DATABASE_ID_KEY = "notion_database_id"
const NOTION_DATA_SOURCE_ID_KEY = "notion_data_source_id"
const NOTION_TITLE_PROPERTY_KEY = "notion_title_property"

type Tab = "home" | "journey" | "archive" | "insight"

const tabs: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: "home", label: "홈", icon: Home },
  { id: "journey", label: "여정", icon: Map },
  { id: "archive", label: "저장소", icon: Archive },
  { id: "insight", label: "영감", icon: Lightbulb },
]

const NOTION_URL = "https://www.notion.so/304d40a761f480d6992ec0251eddd4c7" // 우리 모임 노션 링크로 교체하세요

const OT_KICKOFF_DATE = new Date(2026, 1, 22) // 2월 22일 (월 0-indexed)

function getDaysUntil(target: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(target)
  t.setHours(0, 0, 0, 0)
  return Math.ceil((t.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function HomeTabContent() {
  const daysLeft = getDaysUntil(OT_KICKOFF_DATE)
  const dDayText =
    daysLeft > 0
      ? `첫 모임 OT까지 D-${daysLeft} 남았습니다`
      : daysLeft === 0
        ? "오늘이에요! 첫 모임 OT: Kick-off"
        : "첫 모임 OT가 진행되었어요"
  const showEncouragement = daysLeft > 0 && daysLeft < 7

  return (
    <section className="space-y-6">
      {/* D-day 알림 카드 */}
      <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4 shadow-md dark:bg-primary/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-primary/20">
          <Calendar className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold leading-snug text-slate-900 dark:text-slate-100">
            {dDayText}
          </p>
          {showEncouragement && (
            <p className="mt-1.5 text-xs text-primary dark:text-primary-foreground/90">
              얼마 안 남았어요! 설레는 마음으로 준비해요!
            </p>
          )}
        </div>
      </div>

      <p className="text-center text-base font-medium leading-snug text-slate-900 dark:text-slate-100">
        숫자 너머의 사람을 읽는 분석가들의 공간
      </p>

      <div className="space-y-4 text-center">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">북클럽 3대 운영 원칙</h3>
        <ul className="space-y-4">
          <li className="text-center">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">1. Burden Zero</span>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              완독 못 해도 OK! 문장 하나면 충분해요.
            </p>
          </li>
          <li className="text-center">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">2. Output First</span>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              이 통찰을 내 포트폴리오에 어떻게 녹일까?
            </p>
          </li>
          <li className="text-center">
            <span className="text-sm font-medium text-slate-900 dark:text-slate-100">3. Active Archiving</span>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              정성 답변 데이터베이스 만들기.
            </p>
          </li>
        </ul>
      </div>

      <a
        href={NOTION_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 hover:shadow dark:border-slate-700"
      >
        우리 모임 노션 바로가기
        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
      </a>
    </section>
  )
}

const JOURNEY_YEAR = 2026

const journeySteps = [
  {
    type: "kickoff" as const,
    label: "OT: Kick-off",
    date: "2/22 (일)",
    dates: [new Date(JOURNEY_YEAR, 1, 22)],
  },
  {
    type: "stage" as const,
    stage: 1,
    name: "관찰과 맥락",
    date: "3/08",
    dates: [new Date(JOURNEY_YEAR, 2, 8)],
    books: [
      { title: "《씩 데이터》", main: true },
      { title: "《데이터 읽기의 기술》", main: false },
    ],
  },
  {
    type: "stage" as const,
    stage: 2,
    name: "세상을 보는 눈",
    date: "3/22, 4/05",
    dates: [new Date(JOURNEY_YEAR, 2, 22), new Date(JOURNEY_YEAR, 3, 5)],
    books: [
      { title: "《팩트풀니스》", main: true },
      { title: "《세대 감각》", main: false },
      { title: "《숫자에 속지 않고 숫자 읽는 법》", main: false },
    ],
  },
  {
    type: "stage" as const,
    stage: 3,
    name: "비판적 시각",
    date: "4/19, 5/03",
    dates: [new Date(JOURNEY_YEAR, 3, 19), new Date(JOURNEY_YEAR, 4, 3)],
    books: [
      { title: "《대량살상 수학무기》", main: true },
      { title: "《가장 인간적인 미래》", main: false },
      { title: "《데이터의 함정》 등", main: false },
    ],
  },
  {
    type: "stage" as const,
    stage: 4,
    name: "나만의 중심",
    date: "5/17, 5/31",
    dates: [new Date(JOURNEY_YEAR, 4, 17), new Date(JOURNEY_YEAR, 4, 31)],
    books: [{ title: "《그냥 하지 말라》", main: true }],
  },
]

function getStepStatus(dates: Date[]): "완료" | "진행 중" | "준비 중" {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastDate = dates[dates.length - 1]
  const firstDate = dates[0]
  const lastDateOnly = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
  const firstDateOnly = new Date(firstDate.getFullYear(), firstDate.getMonth(), firstDate.getDate())

  if (lastDateOnly < today) return "완료"
  if (firstDateOnly <= today && today <= lastDateOnly) return "진행 중"
  return "준비 중"
}

function JourneyTabContent() {
  return (
    <section className="space-y-2 pb-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">여정</h2>

      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700" aria-hidden />

        {journeySteps.map((step, index) => {
          const status = getStepStatus(step.dates)
          const isDone = status === "완료"
          const isActive = status === "진행 중"

          return (
            <div key={index} className={`relative flex gap-4 pl-0 ${isDone ? "opacity-60" : ""}`}>
              {/* Node */}
              <div
                className={`relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isDone
                    ? "border-slate-300 bg-slate-200 dark:border-slate-600 dark:bg-slate-700"
                    : isActive
                      ? "border-orange-400 bg-orange-100 dark:border-orange-400 dark:bg-orange-950"
                      : step.type === "kickoff"
                        ? "border-primary bg-primary/10"
                        : "border-primary bg-white dark:bg-slate-950"
                }`}
              >
                {isDone ? (
                  <Check className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                ) : step.type === "kickoff" ? (
                  <span className="text-xs" aria-hidden>🎯</span>
                ) : (
                  <span className={`text-[10px] font-bold ${isActive ? "text-orange-600 dark:text-orange-400" : "text-primary"}`}>
                    {step.stage}
                  </span>
                )}
              </div>

              {/* Content card */}
              <div className="min-w-0 flex-1 pb-6">
                {step.type === "kickoff" ? (
                  <div className={`rounded-lg border-2 p-3 ${
                    isDone
                      ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                      : isActive
                        ? "border-orange-400 bg-orange-50 ring-2 ring-orange-300 dark:border-orange-500 dark:bg-orange-950 dark:ring-orange-700"
                        : "border-primary/50 bg-primary/5 dark:bg-primary/10"
                  }`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {step.label}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        isDone
                          ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          : isActive
                            ? "bg-orange-200 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                            : "bg-primary/20 text-primary dark:text-primary-foreground/90"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{step.date}</p>
                  </div>
                ) : (
                  <div className={`rounded-lg border p-3 ${
                    isDone
                      ? "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                      : isActive
                        ? "border-orange-300 bg-orange-50 ring-2 ring-orange-300 shadow-md dark:border-orange-500 dark:bg-orange-950 dark:ring-orange-700"
                        : "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900"
                  }`}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span className={`text-xs font-bold ${isDone ? "text-slate-400 dark:text-slate-500" : isActive ? "text-orange-600 dark:text-orange-400" : "text-primary"}`}>
                        {step.stage}단계
                      </span>
                      <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                        {step.name}
                      </span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isDone
                          ? "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                          : isActive
                            ? "bg-orange-200 text-orange-700 dark:bg-orange-800 dark:text-orange-300"
                            : "bg-primary/10 text-primary/70"
                      }`}>
                        {status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{step.date}</p>
                    <ul className="mt-2 space-y-1">
                      {step.books.map((book, i) => (
                        <li
                          key={i}
                          className={`flex items-center gap-1.5 text-sm ${isDone ? "text-slate-500 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}
                        >
                          {book.main && (
                            <span className="text-base leading-none" aria-hidden>
                              {isDone ? "✅" : "📘"}
                            </span>
                          )}
                          <span className={isDone ? "line-through decoration-slate-300 dark:decoration-slate-600" : ""}>{book.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

type QuoteEntry = { id: string; bookTitle: string; quote: string; thought: string; author: string }
type InterviewEntry = { id: string; keyword: string; question: string; answer: string }
type BookEntry = { id: string; title: string; author: string; publisher: string; url: string }

function ArchiveTabContent() {
  const [archiveSubTab, setArchiveSubTab] = useState<"quote" | "interview" | "books">("quote")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [bookTitle, setBookTitle] = useState("")
  const [quote, setQuote] = useState("")
  const [thoughts, setThoughts] = useState("")
  const [author, setAuthor] = useState("")
  const [quotes, setQuotes] = useState<QuoteEntry[]>([])
  const [quotesLoading, setQuotesLoading] = useState(true)
  const [quotesError, setQuotesError] = useState<string | null>(null)
  const [quoteSaving, setQuoteSaving] = useState(false)

  const [keyword, setKeyword] = useState("")
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [interviews, setInterviews] = useState<InterviewEntry[]>([])
  const [interviewsLoading, setInterviewsLoading] = useState(true)
  const [interviewsError, setInterviewsError] = useState<string | null>(null)
  const [interviewSaving, setInterviewSaving] = useState(false)

  const [bookFormTitle, setBookFormTitle] = useState("")
  const [bookFormAuthor, setBookFormAuthor] = useState("")
  const [bookFormPublisher, setBookFormPublisher] = useState("")
  const [bookFormUrl, setBookFormUrl] = useState("")
  const [books, setBooks] = useState<BookEntry[]>([])
  const [booksLoading, setBooksLoading] = useState(true)
  const [booksError, setBooksError] = useState<string | null>(null)
  const [bookSaving, setBookSaving] = useState(false)

  const exportThrottleRef = useRef(0)

  const fetchQuotes = useCallback(async () => {
    setQuotesError(null)
    const { data, error } = await supabase
      .from("archives")
      .select("id, book_title, quote, thought, author")
      .eq("type", "quote")
      .order("created_at", { ascending: false })
    setQuotesLoading(false)
    if (error) {
      setQuotesError(error.message || "인상 깊은 문장을 불러오지 못했어요.")
      setQuotes([])
      return
    }
    setQuotes((data || []).map((r) => ({ id: r.id, bookTitle: r.book_title ?? "", quote: r.quote ?? "", thought: r.thought ?? "", author: r.author ?? "" })))
  }, [])

  const fetchInterviews = useCallback(async () => {
    setInterviewsError(null)
    const { data, error } = await supabase
      .from("archives")
      .select("id, keyword, question, answer")
      .eq("type", "interview")
      .order("created_at", { ascending: false })
    setInterviewsLoading(false)
    if (error) {
      setInterviewsError(error.message || "면접 답변을 불러오지 못했어요.")
      setInterviews([])
      return
    }
    setInterviews((data || []).map((r) => ({ id: r.id, keyword: r.keyword ?? "", question: r.question ?? "", answer: r.answer ?? "" })))
  }, [])

  useEffect(() => {
    setQuotesLoading(true)
    fetchQuotes()
  }, [fetchQuotes])

  useEffect(() => {
    setInterviewsLoading(true)
    fetchInterviews()
  }, [fetchInterviews])

  const booksTableMissing = (msg: string) =>
    /schema cache|relation.*does not exist|relation "public\.books"/i.test(msg)

  const fetchBooks = useCallback(async () => {
    setBooksError(null)
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, publisher, url")
      .order("created_at", { ascending: false })
    setBooksLoading(false)
    if (error) {
      const msg = error.message || ""
      setBooksError(
        booksTableMissing(msg)
          ? "도서 목록을 쓰려면 Supabase에 'books' 테이블이 필요해요. Supabase 대시보드 → SQL Editor에서 프로젝트 루트의 SUPABASE_SCHEMA.md 3번 '함께 읽은 도서 목록' SQL을 복사해 실행해 주세요."
          : msg || "도서 목록을 불러오지 못했어요."
      )
      setBooks([])
      return
    }
    setBooks((data || []).map((r) => ({
      id: r.id,
      title: r.title ?? "",
      author: r.author ?? "",
      publisher: r.publisher ?? "",
      url: r.url ?? "",
    })))
  }, [])

  useEffect(() => {
    if (archiveSubTab === "books") {
      setBooksLoading(true)
      fetchBooks()
    }
  }, [archiveSubTab, fetchBooks])

  const handleSaveBook = async () => {
    const title = bookFormTitle.trim()
    if (!title) return
    setBooksError(null)
    setBookSaving(true)
    try {
      const { error } = await supabase.from("books").insert({
        title,
        author: bookFormAuthor.trim(),
        publisher: bookFormPublisher.trim(),
        url: bookFormUrl.trim(),
      })
      if (error) {
        const msg = error.message || ""
        setBooksError(
          booksTableMissing(msg)
            ? "도서 목록을 쓰려면 Supabase에 'books' 테이블이 필요해요. SUPABASE_SCHEMA.md 3번 SQL을 Supabase SQL Editor에서 실행해 주세요."
            : msg || "저장에 실패했어요."
        )
        return
      }
      setBookFormTitle("")
      setBookFormAuthor("")
      setBookFormPublisher("")
      setBookFormUrl("")
      setToastMessage("도서가 저장되었습니다. 📚")
      setTimeout(() => setToastMessage(null), 3000)
      await fetchBooks()
    } finally {
      setBookSaving(false)
    }
  }

  const handleDeleteBook = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    const { error } = await supabase.from("books").delete().eq("id", id)
    if (error) {
      const msg = error.message || ""
      setBooksError(booksTableMissing(msg) ? "Supabase에 'books' 테이블을 먼저 생성해 주세요. SUPABASE_SCHEMA.md 3번 참고." : msg || "삭제에 실패했어요.")
      return
    }
    setBooks((prev) => prev.filter((b) => b.id !== id))
    setToastMessage("삭제가 완료되었습니다. 🗑️")
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveQuote = async () => {
    if (!bookTitle.trim() && !quote.trim()) return
    setQuotesError(null)
    setQuoteSaving(true)
    try {
      const { error } = await supabase.from("archives").insert({
        type: "quote",
        book_title: bookTitle.trim(),
        quote: quote.trim(),
        thought: thoughts.trim(),
        author: author.trim(),
      })
      if (error) {
        setQuotesError(error.message || "저장에 실패했어요. SUPABASE_SCHEMA.md를 확인해 주세요.")
        return
      }
      setBookTitle("")
      setQuote("")
      setThoughts("")
      setAuthor("")
      setToastMessage("성공적으로 저장되었습니다! 🎉")
      setTimeout(() => setToastMessage(null), 3000)
      await fetchQuotes()
    } finally {
      setQuoteSaving(false)
    }
  }

  const handleSaveInterview = async () => {
    if (!keyword.trim() && !question.trim() && !answer.trim()) return
    setInterviewsError(null)
    setInterviewSaving(true)
    try {
      const { error } = await supabase.from("archives").insert({
        type: "interview",
        keyword: keyword.trim(),
        question: question.trim(),
        answer: answer.trim(),
      })
      if (error) {
        setInterviewsError(error.message || "저장에 실패했어요. SUPABASE_SCHEMA.md를 확인해 주세요.")
        return
      }
      setKeyword("")
      setQuestion("")
      setAnswer("")
      setToastMessage("성공적으로 저장되었습니다! 🎉")
      setTimeout(() => setToastMessage(null), 3000)
      await fetchInterviews()
    } finally {
      setInterviewSaving(false)
    }
  }

  const [exportingId, setExportingId] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleDeleteQuote = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    const { error } = await supabase.from("archives").delete().eq("id", id)
    if (error) {
      setQuotesError(error.message || "삭제에 실패했어요.")
      return
    }
    setQuotes((prev) => prev.filter((q) => q.id !== id))
    setToastMessage("삭제가 완료되었습니다. 🗑️")
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleDeleteInterview = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    const { error } = await supabase.from("archives").delete().eq("id", id)
    if (error) {
      setInterviewsError(error.message || "삭제에 실패했어요.")
      return
    }
    setInterviews((prev) => prev.filter((i) => i.id !== id))
    setToastMessage("삭제가 완료되었습니다. 🗑️")
    setTimeout(() => setToastMessage(null), 3000)
  }

  const exportToNotion = async (type: "quote" | "interview", payload: Record<string, string>, id: string) => {
    console.log("버튼 클릭됨!")
    const apiKey = typeof window !== "undefined" ? localStorage.getItem(NOTION_API_KEY_KEY) : null
    const databaseId = typeof window !== "undefined" ? localStorage.getItem(NOTION_DATABASE_ID_KEY) : null
    const dataSourceId = typeof window !== "undefined" ? localStorage.getItem(NOTION_DATA_SOURCE_ID_KEY) : null
    const titleProperty = typeof window !== "undefined" ? localStorage.getItem(NOTION_TITLE_PROPERTY_KEY) : null
    console.log("localStorage 키:", NOTION_API_KEY_KEY, NOTION_DATABASE_ID_KEY, NOTION_DATA_SOURCE_ID_KEY, NOTION_TITLE_PROPERTY_KEY)
    console.log("localStorage 값:", {
      apiKey: apiKey ? "설정됨" : null,
      databaseId: databaseId ?? null,
      dataSourceId: dataSourceId ?? null,
      titleProperty: titleProperty ?? null,
    })
    const hasDb = databaseId != null && databaseId.trim().length > 0
    const hasDs = dataSourceId != null && dataSourceId.trim().length > 0
    if (!apiKey?.trim() || (!hasDb && !hasDs)) {
      setExportError("노션 설정에서 API Key와 (Database ID 또는 Data source ID) 중 하나를 입력해 주세요.")
      return
    }
    setExportError(null)
    setExportingId(id)
    try {
      const res = await fetch("/api/notion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          databaseId: hasDb ? databaseId : undefined,
          dataSourceId: hasDs ? dataSourceId : undefined,
          type,
          payload,
          titleProperty: titleProperty || "Name",
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || "내보내기 실패")
      setExportingId(null)
    } catch (e) {
      const message = e instanceof Error ? e.message : "내보내기 실패"
      setExportError(message)
      setExportingId(null)
      alert(message)
    }
  }

  const inputClass =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
  const labelClass = "mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400"

  return (
    <section className="relative space-y-4 pb-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">저장소</h2>
      {toastMessage && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
          {toastMessage}
        </div>
      )}
      {exportError && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{exportError}</p>
      )}

      {/* Sub-tabs */}
      <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/50">
        <button
          type="button"
          onClick={() => setArchiveSubTab("quote")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            archiveSubTab === "quote"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          인상 깊은 문장
        </button>
        <button
          type="button"
          onClick={() => setArchiveSubTab("interview")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            archiveSubTab === "interview"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          면접 답변 매칭
        </button>
        <button
          type="button"
          onClick={() => setArchiveSubTab("books")}
          className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
            archiveSubTab === "books"
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          }`}
        >
          함께 읽은 도서
        </button>
      </div>

      {archiveSubTab === "quote" && (
        <>
          {quotesError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{quotesError}</p>
          )}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <label className="block">
              <span className={labelClass}>도서명</span>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="읽은 책 제목" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>저자명</span>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="저자 이름" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>인상 깊은 문장</span>
              <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="마음에 남은 문장을 적어보세요" rows={4} className={inputClass + " resize-none"} />
            </label>
            <label className="block">
              <span className={labelClass}>나의 생각</span>
              <input type="text" value={thoughts} onChange={(e) => setThoughts(e.target.value)} placeholder="짧게 적기" className={inputClass} />
            </label>
            <button
              type="button"
              disabled={quoteSaving}
              onClick={handleSaveQuote}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-70 disabled:pointer-events-none"
            >
              {quoteSaving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  저장 중...
                </>
              ) : (
                "기록하기"
              )}
            </button>
          </div>
          <div className="space-y-2">
            {quotesLoading && quotes.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">불러오는 중...</p>
            ) : (
              quotes.map((item) => (
              <article
                key={item.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 pr-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteQuote(item.id)}
                  className="absolute right-2 top-2 rounded p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/30"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {(item.bookTitle || item.author) && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {[item.bookTitle, item.author].filter(Boolean).join(" · ")}
                  </p>
                )}
                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-900 dark:text-slate-100">{item.quote || "—"}</p>
                {item.thought && (
                  <p className="mt-2 border-t border-slate-200 pt-2 text-sm italic text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    {item.thought}
                  </p>
                )}
                <button
                  type="button"
                  className="relative z-10 mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 [&:disabled]:cursor-not-allowed"
                  disabled={exportingId === `quote-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const now = Date.now()
                    if (now - exportThrottleRef.current < 800) return
                    exportThrottleRef.current = now
                    console.log("버튼 클릭됨!")
                    if (!exportingId) exportToNotion("quote", { bookTitle: item.bookTitle, quote: item.quote, thoughts: item.thought, author: item.author }, `quote-${item.id}`)
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    const now = Date.now()
                    if (now - exportThrottleRef.current < 800) return
                    exportThrottleRef.current = now
                    console.log("버튼 터치됨!")
                    if (!exportingId) exportToNotion("quote", { bookTitle: item.bookTitle, quote: item.quote, thoughts: item.thought, author: item.author }, `quote-${item.id}`)
                  }}
                >
                  {exportingId === `quote-${item.id}` ? (
                    "전송 중..."
                  ) : (
                    <>
                      노션으로 내보내기 <Rocket className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </>
                  )}
                </button>
              </article>
              ))
            )}
          </div>
        </>
      )}

      {archiveSubTab === "interview" && (
        <>
          {interviewsError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{interviewsError}</p>
          )}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <label className="block">
              <span className={labelClass}>핵심 키워드</span>
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="예: 맥락, 데이터 윤리" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>예상 질문</span>
              <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="예: 왜 이 분석을 했나요?" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>나의 답변</span>
              <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="책의 인사이트를 녹여낸 답변" rows={4} className={inputClass + " resize-none"} />
            </label>
            <button
              type="button"
              disabled={interviewSaving}
              onClick={handleSaveInterview}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:opacity-70 disabled:pointer-events-none"
            >
              {interviewSaving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  저장 중...
                </>
              ) : (
                "답변 저장하기"
              )}
            </button>
          </div>
          <div className="space-y-2">
            {interviewsLoading && interviews.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">불러오는 중...</p>
            ) : (
              interviews.map((item) => (
              <article
                key={item.id}
                className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 pr-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteInterview(item.id)}
                  className="absolute right-2 top-2 rounded p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/30"
                  aria-label="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {item.keyword && (
                  <p className="text-xs font-medium text-primary">{item.keyword}</p>
                )}
                {item.question && (
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{item.question}</p>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-500 dark:text-slate-400">{item.answer || "—"}</p>
                <button
                  type="button"
                  className="relative z-10 mt-3 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 [&:disabled]:cursor-not-allowed"
                  disabled={exportingId === `interview-${item.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    const now = Date.now()
                    if (now - exportThrottleRef.current < 800) return
                    exportThrottleRef.current = now
                    console.log("버튼 클릭됨!")
                    if (!exportingId) exportToNotion("interview", { keyword: item.keyword, question: item.question, answer: item.answer }, `interview-${item.id}`)
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault()
                    const now = Date.now()
                    if (now - exportThrottleRef.current < 800) return
                    exportThrottleRef.current = now
                    console.log("버튼 터치됨!")
                    if (!exportingId) exportToNotion("interview", { keyword: item.keyword, question: item.question, answer: item.answer }, `interview-${item.id}`)
                  }}
                >
                  {exportingId === `interview-${item.id}` ? (
                    "전송 중..."
                  ) : (
                    <>
                      노션으로 내보내기 <Rocket className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </>
                  )}
                </button>
              </article>
              ))
            )}
          </div>
        </>
      )}

      {archiveSubTab === "books" && (
        <>
          {booksError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{booksError}</p>
          )}
          <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <label className="block">
              <span className={labelClass}>제목</span>
              <input type="text" value={bookFormTitle} onChange={(e) => setBookFormTitle(e.target.value)} placeholder="도서 제목" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>저자</span>
              <input type="text" value={bookFormAuthor} onChange={(e) => setBookFormAuthor(e.target.value)} placeholder="저자명" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>출판사</span>
              <input type="text" value={bookFormPublisher} onChange={(e) => setBookFormPublisher(e.target.value)} placeholder="출판사" className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>구매/참고 링크 (URL)</span>
              <input type="url" value={bookFormUrl} onChange={(e) => setBookFormUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </label>
            <button
              type="button"
              disabled={bookSaving}
              onClick={handleSaveBook}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 disabled:pointer-events-none disabled:opacity-70"
            >
              {bookSaving ? (
                <>
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                  저장 중...
                </>
              ) : (
                "도서 추가하기"
              )}
            </button>
          </div>
          <div className="space-y-2">
            {booksLoading && books.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">불러오는 중...</p>
            ) : books.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">아직 등록된 도서가 없어요.</p>
            ) : (
              books.map((item) => (
                <article
                  key={item.id}
                  className="relative rounded-lg border border-slate-200 bg-slate-50 p-4 pr-10 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <button
                    type="button"
                    onClick={() => handleDeleteBook(item.id)}
                    className="absolute right-2 top-2 rounded p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/30"
                    aria-label="삭제"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <h3 className="pr-6 text-base font-bold text-slate-900 dark:text-slate-100">{item.title}</h3>
                  {(item.author || item.publisher) && (
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {[item.author, item.publisher].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" aria-hidden />
                      링크 열기
                    </a>
                  )}
                </article>
              ))
            )}
          </div>
        </>
      )}
    </section>
  )
}

type InsightCategory = "article" | "video" | "resource" | "other"

type InsightEntry = {
  id: string
  title: string
  url: string
  category: InsightCategory
  description: string
  author: string
  likes: number
  likedByMe?: boolean
}

const INSIGHT_CATEGORIES: { id: InsightCategory; label: string }[] = [
  { id: "article", label: "아티클" },
  { id: "video", label: "영상" },
  { id: "resource", label: "도구" },
  { id: "other", label: "기타" },
]

const INSIGHT_FILTERS: { id: "all" | InsightCategory; label: string }[] = [
  { id: "all", label: "전체" },
  ...INSIGHT_CATEGORIES,
]

const categoryIcons: Record<InsightCategory, typeof FileText> = {
  article: FileText,
  video: Video,
  resource: FolderOpen,
  other: Sparkles,
}

const categoryLabels: Record<InsightCategory, string> = {
  article: "아티클",
  video: "영상",
  resource: "도구",
  other: "기타",
}

const INSIGHT_DEFAULT_AUTHOR = "익명의 분석가"

function InsightTabContent() {
  const [filter, setFilter] = useState<"all" | InsightCategory>("all")
  const [insights, setInsights] = useState<InsightEntry[]>([])
  const [insightsLoading, setInsightsLoading] = useState(true)
  const [insightsError, setInsightsError] = useState<string | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareSaving, setShareSaving] = useState(false)
  const [insightToastMessage, setInsightToastMessage] = useState<string | null>(null)
  const [shareTitle, setShareTitle] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [shareCategory, setShareCategory] = useState<InsightCategory>("article")
  const [shareDescription, setShareDescription] = useState("")

  const fetchInsights = useCallback(async () => {
    setInsightsError(null)
    const { data, error } = await supabase.from("insights").select("id, title, url, category, description, author, likes").order("created_at", { ascending: false })
    setInsightsLoading(false)
    if (error) {
      setInsightsError(error.message || "영감 목록을 불러오지 못했어요.")
      setInsights([])
      return
    }
    setInsights((data || []).map((r) => ({
      id: r.id,
      title: r.title ?? "",
      url: r.url ?? "",
      category: (r.category as InsightCategory) || "other",
      description: r.description ?? "",
      author: r.author ?? INSIGHT_DEFAULT_AUTHOR,
      likes: Number(r.likes) || 0,
    })))
  }, [])

  useEffect(() => {
    fetchInsights()
  }, [fetchInsights])

  const handleShareSubmit = async () => {
    const title = shareTitle.trim()
    if (!title) return
    setInsightsError(null)
    setShareSaving(true)
    try {
      const { error } = await supabase.from("insights").insert({
        title,
        url: shareUrl.trim() || "",
        category: shareCategory,
        description: shareDescription.trim(),
        author: INSIGHT_DEFAULT_AUTHOR,
        likes: 0,
      })
      if (error) {
        setInsightsError(error.message || "공유에 실패했어요. SUPABASE_SCHEMA.md를 확인해 주세요.")
        return
      }
      setShareTitle("")
      setShareUrl("")
      setShareCategory("article")
      setShareDescription("")
      setShowShareModal(false)
      setInsightToastMessage("멋진 영감을 공유해주셔서 감사해요! 💡")
      setTimeout(() => setInsightToastMessage(null), 3000)
      await fetchInsights()
    } finally {
      setShareSaving(false)
    }
  }

  const handleDeleteInsight = async (id: string) => {
    if (!confirm("정말로 삭제하시겠습니까?")) return
    const { error } = await supabase.from("insights").delete().eq("id", id)
    if (error) {
      setInsightsError(error.message || "삭제에 실패했어요.")
      return
    }
    setInsights((prev) => prev.filter((i) => i.id !== id))
    setInsightToastMessage("삭제가 완료되었습니다. 🗑️")
    setTimeout(() => setInsightToastMessage(null), 3000)
  }

  const handleLike = async (id: string) => {
    const item = insights.find((i) => i.id === id)
    if (!item) return
    const newLiked = !item.likedByMe
    const newCount = newLiked ? item.likes + 1 : item.likes - 1
    setInsights((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, likes: newCount, likedByMe: newLiked } : i
      )
    )
    const { error } = await supabase.from("insights").update({ likes: newCount }).eq("id", id)
    if (error) {
      setInsights((prev) =>
        prev.map((i) => (i.id === id ? { ...i, likes: item.likes, likedByMe: item.likedByMe } : i))
      )
    }
  }

  const filteredInsights = insights.filter((item) => filter === "all" || item.category === filter)

  return (
    <section className="relative flex min-h-full flex-col pb-6">
      <h2 className="mb-2 text-lg font-semibold text-slate-900 dark:text-slate-100">영감</h2>
      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        함께 만드는 보물창고 · 모임원이 공유한 자료
      </p>
      {insightToastMessage && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-lg">
          {insightToastMessage}
        </div>
      )}
      {insightsError && (
        <p className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{insightsError}</p>
      )}

      {/* 영감 공유하기 버튼 */}
      <button
        type="button"
        onClick={() => setShowShareModal(true)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
      >
        <PlusCircle className="h-5 w-5 text-primary" aria-hidden />
        영감 공유하기
      </button>

      {/* Filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {INSIGHT_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      {insightsLoading && insights.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">불러오는 중...</p>
      ) : (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filteredInsights.map((item) => {
          const Icon = categoryIcons[item.category]
          return (
<article
            key={item.id}
            className="relative flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 pr-12 shadow-sm transition-shadow hover:shadow dark:border-slate-700 dark:bg-slate-900"
          >
              <button
                type="button"
                onClick={() => handleDeleteInsight(item.id)}
                className="absolute right-2 top-2 rounded p-1.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-950/30"
                aria-label="삭제"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <div className="mb-2 flex items-start justify-between gap-2">
                <span className="inline-flex w-fit items-center gap-1 rounded-md bg-slate-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  <Icon className="h-3 w-3 shrink-0" aria-hidden />
                  {categoryLabels[item.category]}
                </span>
                <button
                  type="button"
                  onClick={() => handleLike(item.id)}
                  className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors ${
                    item.likedByMe
                      ? "text-red-500"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  }`}
                  aria-label="공감"
                >
                  <Heart
                    className={`h-4 w-4 ${item.likedByMe ? "fill-current" : ""}`}
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <span>{item.likes}</span>
                </button>
              </div>
              <h3 className="mb-1 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="mb-3 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400">
                {item.description || "소개 없음"}
              </p>
              <p className="mb-3 text-[10px] text-slate-500 dark:text-slate-400">
                공유: {item.author}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-900 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
              >
                자료 보러가기
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </article>
          )
        })}
      </div>
      )}

      {!insightsLoading && filteredInsights.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
          아직 공유된 영감이 없어요. 첫 번째로 공유해 보세요!
        </p>
      )}

      {/* 영감 공유하기 모달 */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          aria-modal="true"
          role="dialog"
        >
          <div className="w-full max-w-sm rounded-xl bg-background p-4 shadow-lg">
            <h3 className="mb-3 text-lg font-semibold text-foreground">영감 공유하기</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">제목</span>
                <input
                  type="text"
                  value={shareTitle}
                  onChange={(e) => setShareTitle(e.target.value)}
                placeholder="자료 제목"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">링크 (URL)</span>
              <input
                type="url"
                value={shareUrl}
                onChange={(e) => setShareUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">카테고리</span>
              <select
                value={shareCategory}
                onChange={(e) => setShareCategory(e.target.value as InsightCategory)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              >
                  {INSIGHT_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">짧은 소개</span>
                <textarea
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="한 줄로 소개해 주세요"
                  rows={3}
                  className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </label>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-900 dark:border-slate-600 dark:text-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                disabled={shareSaving}
                onClick={handleShareSubmit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-70 disabled:pointer-events-none"
              >
                {shareSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
                    공유 중...
                  </>
                ) : (
                  "공유하기"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("home")
  const [showNotionSettings, setShowNotionSettings] = useState(false)
  const [notionApiKey, setNotionApiKey] = useState("")
  const [notionDatabaseId, setNotionDatabaseId] = useState("")
  const [notionDataSourceId, setNotionDataSourceId] = useState("")
  const [notionTitleProperty, setNotionTitleProperty] = useState("")

  useEffect(() => {
    if (showNotionSettings && typeof window !== "undefined") {
      setNotionApiKey(localStorage.getItem(NOTION_API_KEY_KEY) ?? "")
      setNotionDatabaseId(localStorage.getItem(NOTION_DATABASE_ID_KEY) ?? "")
      setNotionDataSourceId(localStorage.getItem(NOTION_DATA_SOURCE_ID_KEY) ?? "")
      setNotionTitleProperty(localStorage.getItem(NOTION_TITLE_PROPERTY_KEY) ?? "Name")
    }
  }, [showNotionSettings])

  const saveNotionSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(NOTION_API_KEY_KEY, notionApiKey.trim())
      localStorage.setItem(NOTION_DATABASE_ID_KEY, notionDatabaseId.trim())
      localStorage.setItem(NOTION_DATA_SOURCE_ID_KEY, notionDataSourceId.trim())
      localStorage.setItem(NOTION_TITLE_PROPERTY_KEY, notionTitleProperty.trim() || "Name")
    }
    setShowNotionSettings(false)
  }

  return (
    <div className="mx-auto flex h-dvh max-w-md flex-col bg-white dark:bg-slate-950">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 pb-2 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">DA</span>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            데이터 인류학 살롱
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowNotionSettings(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          aria-label="노션 설정"
        >
          <Settings className="h-5 w-5" />
        </button>
      </header>

      {/* Notion 설정 모달 */}
      {showNotionSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" aria-modal="true" role="dialog">
          <div className="w-full max-w-sm rounded-xl bg-white p-4 shadow-lg dark:bg-slate-900">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">노션 연동 설정</h3>
            <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
              API Key와 Database ID 또는 Data source ID 중 하나는 꼭 입력하세요. 값은 브라우저에만 저장됩니다.
            </p>
            <label className="mb-2 block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Notion API Key</span>
              <input
                type="password"
                value={notionApiKey}
                onChange={(e) => setNotionApiKey(e.target.value)}
                placeholder="ntn_..."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <label className="mb-2 block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Data source ID (권장)</span>
              <input
                type="text"
                value={notionDataSourceId}
                onChange={(e) => setNotionDataSourceId(e.target.value)}
                placeholder="노션 데이터베이스 설정 → 데이터 소스 관리 → 데이터 소스 ID 복사"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">있으면 이 값만 넣으면 됩니다. 404 나올 때 사용하세요.</span>
            </label>
            <label className="mb-2 block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Database ID (선택)</span>
              <input
                type="text"
                value={notionDatabaseId}
                onChange={(e) => setNotionDatabaseId(e.target.value)}
                placeholder="데이터베이스 URL의 ID 또는 전체 URL"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <span className="mt-0.5 block text-[10px] text-slate-500 dark:text-slate-400">Data source ID가 없을 때만 사용. URL에서 자동 추출됩니다.</span>
            </label>
            <label className="mb-4 block">
              <span className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">제목 속성 이름</span>
              <input
                type="text"
                value={notionTitleProperty}
                onChange={(e) => setNotionTitleProperty(e.target.value)}
                placeholder="예: Name, 제목, book_title"
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowNotionSettings(false)}
                className="flex-1 rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-900 dark:border-slate-600 dark:text-slate-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveNotionSettings}
                className="flex-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Content - touch-action: manipulation helps tap-to-click on mobile */}
      <div className="flex-1 overflow-y-auto touch-manipulation bg-white dark:bg-slate-950">
        <main className="px-5 py-4">
          {activeTab === "home" && <HomeTabContent />}
          {activeTab === "journey" && <JourneyTabContent />}
          {activeTab === "archive" && <ArchiveTabContent />}
          {activeTab === "insight" && <InsightTabContent />}
        </main>
      </div>

      {/* Bottom Tab Bar */}
      <nav className="shrink-0 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900" aria-label="Main navigation">
        <div className="flex items-center justify-around px-2 pb-6 pt-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center gap-1 rounded-lg px-4 py-1.5 transition-all ${
                  isActive
                    ? "text-accent"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                }`}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
              >
                {isActive && (
                  <div className="absolute -top-2.5 left-1/2 h-0.5 w-6 -translate-x-1/2 rounded-full bg-accent" />
                )}
                <tab.icon
                  className="h-5 w-5 transition-all"
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className="text-[10px] font-medium">
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
