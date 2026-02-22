import { NextResponse } from "next/server"
import { Client } from "@notionhq/client"

const NOTION_VERSION = "2025-09-03"
const DEFAULT_TITLE_PROPERTY = "Name"

/** Notion DB ID는 32자리 hex. URL에서 추출하거나 앞뒤 공백 제거 */
function normalizeNotionDatabaseId(input: string): string {
  const trimmed = input.trim()
  try {
    const url = new URL(trimmed)
    const pathSegments = url.pathname.split("/").filter(Boolean)
    const lastSegment = pathSegments[pathSegments.length - 1]
    if (lastSegment && /^[a-fA-F0-9-]{32,36}$/.test(lastSegment.replace(/-/g, "").slice(0, 32))) {
      const hex = lastSegment.replace(/-/g, "").slice(0, 32)
      return hex.length === 32 ? `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}` : lastSegment
    }
  } catch {
    // URL이 아님 → 그대로 사용
  }
  const hexOnly = trimmed.replace(/-/g, "").replace(/\s/g, "")
  if (hexOnly.length >= 32 && /^[a-fA-F0-9]+$/.test(hexOnly.slice(0, 32))) {
    const id = hexOnly.slice(0, 32)
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20, 32)}`
  }
  return trimmed
}

/** Data source ID: 32자리 hex, 하이픈 유무 무관 */
function normalizeNotionDataSourceId(input: string): string {
  const hexOnly = input.trim().replace(/-/g, "").replace(/\s/g, "")
  if (hexOnly.length >= 32 && /^[a-fA-F0-9]+$/.test(hexOnly.slice(0, 32))) {
    const id = hexOnly.slice(0, 32)
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20, 32)}`
  }
  return input.trim()
}

function richText(content: string) {
  return [{ type: "text" as const, text: { content: content.slice(0, 2000) } }]
}

function quoteBlock(content: string) {
  return {
    object: "block" as const,
    type: "quote" as const,
    quote: { rich_text: richText(content) },
  }
}

function paragraphBlock(content: string) {
  return {
    object: "block" as const,
    type: "paragraph" as const,
    paragraph: { rich_text: richText(content) },
  }
}

function getFriendlyNotionError(
  status: number,
  message: string,
  code?: string
): string {
  if (status === 403 || code === "restricted_resource") {
    return "노션 데이터베이스에 연동이 연결되어 있지 않습니다. 노션에서 해당 데이터베이스 페이지를 열고, 우측 상단 ••• 메뉴 → 연결 → 연동 이름을 선택해 '연결 추가'를 해 주세요."
  }
  if (status === 404 || code === "object_not_found") {
    return "데이터베이스를 찾을 수 없습니다(404).\n\n① Database ID 확인: 노션 데이터베이스 페이지에서 URL의 마지막 부분(32자리 ID)만 복사했는지 확인하세요.\n② 연결 추가: 해당 데이터베이스 페이지를 연동(Integration)에 연결했는지 확인하세요. 노션에서 ••• 메뉴 → 연결 → 연동 이름으로 '연결 추가'해 주세요."
  }
  if (status === 401 || code === "unauthorized") {
    return "Notion API Key가 올바르지 않습니다. 노션 연동(Integration) 설정에서 키를 다시 확인해 주세요."
  }
  return message || "Notion API 오류가 발생했어요."
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { apiKey, databaseId, dataSourceId: bodyDataSourceId, type, payload, titleProperty } = body as {
      apiKey: string
      databaseId?: string
      dataSourceId?: string
      type: "quote" | "interview"
      payload: Record<string, string>
      titleProperty?: string
    }
    const titleProp = (titleProperty || DEFAULT_TITLE_PROPERTY).trim() || DEFAULT_TITLE_PROPERTY

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "Notion API Key가 필요합니다." },
        { status: 400 }
      )
    }
    const hasDirectDataSourceId = bodyDataSourceId != null && String(bodyDataSourceId).trim().length > 0
    const hasDatabaseId = databaseId != null && String(databaseId).trim().length > 0
    if (!hasDirectDataSourceId && !hasDatabaseId) {
      return NextResponse.json(
        { error: "Database ID 또는 Data source ID 중 하나를 입력해 주세요. 노션에서 '데이터 소스 ID 복사'로 받은 값은 Data source ID에 넣으세요." },
        { status: 400 }
      )
    }

    const notion = new Client({
      auth: apiKey.trim(),
      notionVersion: NOTION_VERSION,
    })

    let dataSourceId: string

    if (hasDirectDataSourceId) {
      dataSourceId = normalizeNotionDataSourceId(String(bodyDataSourceId).trim())
      console.log("[Notion] Data source ID 직접 사용 (GET databases 생략):", dataSourceId)
    } else {
      const dbId = normalizeNotionDatabaseId(String(databaseId).trim())
      console.log("[Notion] database_id (정규화 후):", dbId)

      let database: Awaited<ReturnType<Client["databases"]["retrieve"]>>
      try {
        database = await notion.databases.retrieve({ database_id: dbId })
        console.log("[Notion] databases.retrieve 전체 응답:", JSON.stringify(database, null, 2))
        const ds = "data_sources" in database ? (database as { data_sources?: unknown[] }).data_sources : undefined
        console.log("[Notion] data_sources 존재 여부:", !!ds, "길이:", ds?.length ?? 0, "내용:", ds)
        if (ds?.length === 0) {
          console.log("[Notion] data_sources 배열이 비어 있음 — 연동이 연결되지 않았거나 API 응답 형식 확인 필요")
        }
      } catch (retrieveErr: unknown) {
        console.error("[Notion] databases.retrieve 에러:", retrieveErr)
        console.error("[Notion] 에러 상세 (JSON):", JSON.stringify(retrieveErr, Object.getOwnPropertyNames(retrieveErr as object), 2))
        const status = retrieveErr && typeof retrieveErr === "object" && "status" in retrieveErr ? (retrieveErr as { status: number }).status : undefined
        const code = retrieveErr && typeof retrieveErr === "object" && "code" in retrieveErr ? (retrieveErr as { code: string }).code : undefined
        console.error("[Notion] status:", status, "code:", code)
        if (status === 403) {
          console.error("[Notion] 403 권한 에러 — 데이터베이스에 연동(연결 추가)이 필요합니다.")
        }
        throw retrieveErr
      }

      const dataSources = "data_sources" in database ? (database as { data_sources?: { id: string; name: string }[] }).data_sources : undefined
      const resolvedId = dataSources?.[0]?.id
      if (!resolvedId) {
        const reason =
          !dataSources
            ? "응답에 data_sources 필드가 없습니다. (Notion API 버전 2025-09-03 및 연동 연결 추가 확인)"
            : dataSources.length === 0
              ? "data_sources 배열이 비어 있습니다."
              : "data_sources[0].id를 읽을 수 없습니다."
        const tip = "노션에서 데이터베이스 페이지를 열고 ••• 메뉴 → 연결 → 연동 이름으로 '연결 추가'한 뒤 다시 시도하거나, 노션 데이터베이스 설정 → 데이터 소스 관리 → '데이터 소스 ID 복사' 값을 Data source ID 필드에 넣어 보세요."
        const fullMessage = `data_source_id를 찾지 못했습니다.\n\n원인: ${reason}\n\n해결: ${tip}`
        console.error("[Notion] data_source_id 조회 실패:", reason)
        return NextResponse.json(
          { error: fullMessage },
          { status: 400 }
        )
      }
      dataSourceId = resolvedId
    }

    if (type === "quote") {
      const { bookTitle = "", quote = "", thoughts = "", author = "" } = payload
      const quoteVal = String(quote ?? "").trim()
      const thoughtVal = String(thoughts ?? "").trim()
      const authorVal = String(author ?? "").trim()

      if (!quoteVal && !thoughtVal) {
        return NextResponse.json(
          { error: "인용구(quote) 또는 나의 생각(thought) 중 하나 이상 값을 넣어 주세요." },
          { status: 400 }
        )
      }

      const titleText = bookTitle.trim() || "인상 깊은 문장"
      const children = [
        ...(quoteVal ? [quoteBlock(quoteVal)] : []),
        ...(thoughtVal ? [paragraphBlock(thoughtVal)] : []),
      ].filter(Boolean)
      if (children.length === 0) {
        return NextResponse.json(
          { error: "인용구 또는 나의 생각 내용이 없습니다." },
          { status: 400 }
        )
      }

      const properties: Record<string, { title: ReturnType<typeof richText> } | { rich_text: ReturnType<typeof richText> }> = {
        [titleProp]: { title: richText(titleText) },
      }
      if (quoteVal) {
        properties["quate"] = { rich_text: richText(quoteVal) }
      }
      if (thoughtVal) {
        properties["thought"] = { rich_text: richText(thoughtVal) }
      }
      if (authorVal) {
        properties["author"] = { rich_text: richText(authorVal) }
      }

      const page = await notion.pages.create({
        parent: { data_source_id: dataSourceId },
        properties,
        children,
      })
      return NextResponse.json({ ok: true, pageId: page.id, url: "url" in page ? page.url : null })
    }

    if (type === "interview") {
      const { keyword = "", question = "", answer = "" } = payload
      const titleText = keyword.trim() || "면접 답변"
      const keywordVal = String(keyword ?? "").trim()
      const questionVal = String(question ?? "").trim()
      const answerVal = String(answer ?? "").trim()
      const children = [quoteBlock(questionVal || "(질문 없음)"), paragraphBlock(answerVal || "(답변 없음)")]

      const properties: Record<string, { title: ReturnType<typeof richText> } | { rich_text: ReturnType<typeof richText> }> = {
        [titleProp]: { title: richText(titleText) },
      }
      if (keywordVal) {
        properties["keyword"] = { rich_text: richText(keywordVal) }
      }
      if (questionVal) {
        properties["question"] = { rich_text: richText(questionVal) }
      }
      if (answerVal) {
        properties["answer"] = { rich_text: richText(answerVal) }
      }

      const page = await notion.pages.create({
        parent: { data_source_id: dataSourceId },
        properties,
        children,
      })
      return NextResponse.json({ ok: true, pageId: page.id, url: "url" in page ? page.url : null })
    }

    return NextResponse.json({ error: "잘못된 type입니다." }, { status: 400 })
  } catch (err: unknown) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 500
    const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : undefined
    const message = err instanceof Error ? err.message : "Notion API 오류"
    const friendlyMessage =
      typeof status === "number"
        ? getFriendlyNotionError(status, String(message), code)
        : String(message)
    // 브라우저 alert에 상세 원인까지 보여주기 위해 status/code 포함
    const alertMessage =
      typeof status === "number" && (status === 403 || status === 404 || code === "restricted_resource" || code === "object_not_found")
        ? `${friendlyMessage}\n\n[상세] status: ${status}${code ? `, code: ${code}` : ""}`
        : friendlyMessage
    return NextResponse.json(
      { error: alertMessage, status, code },
      { status: typeof status === "number" && status >= 400 && status < 600 ? status : 500 }
    )
  }
}
