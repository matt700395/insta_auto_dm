# API 명세 (Supabase Client Layer)

이 문서는 `src/lib/api.ts`에서 구현할 함수 명세입니다.
React 페이지에서 Supabase PostgREST에 접근하는 모든 호출을 이 레이어에서 처리합니다.

---

## 공통 타입 (DB → React 변환 후)

```typescript
// Rule (rules 테이블)
export interface Rule {
  id: string
  name: string
  description: string | null
  matchType: 'contains' | 'exact'
  triggerKeywords: string[]
  replyText: string
  replyLink: string | null
  isActive: boolean
  priority: number
  createdAt: string
  updatedAt: string
}

// IncomingMessage (incoming_messages 테이블)
export interface IncomingMessage {
  id: string
  senderId: string
  messageText: string
  platformMessageId: string | null
  matchedRuleId: string | null
  matchedRuleName: string | null   // rules JOIN
  matchStatus: 'matched' | 'unmatched'
  rawPayload: unknown | null
  receivedAt: string
}

// OutgoingMessage (outgoing_messages 테이블)
export interface OutgoingMessage {
  id: string
  incomingLogId: string | null
  recipientId: string
  matchedRuleId: string | null
  matchedRuleName: string | null   // rules JOIN
  originalMessage: string | null   // incoming_messages JOIN
  sentText: string
  sentLink: string | null
  sendStatus: 'success' | 'failed'
  errorMessage: string | null
  metaResponsePayload: unknown | null
  sentAt: string
}

// IntegrationSettings (integration_settings 테이블)
export interface IntegrationSettings {
  id: string
  fallbackReply: string
  dedupeWindow: number
  testMode: boolean
  logPageSize: number
  defaultSort: string
  updatedAt: string
}

// DashboardKpis (집계 결과)
export interface DashboardKpis {
  totalRules: number
  activeRules: number
  todayIncoming: number
  todayOutgoingSuccess: number
}

// RulePayload (createRule / updateRule 입력)
export interface RulePayload {
  name: string                       // 필수
  description?: string | null
  matchType: 'contains' | 'exact'   // 필수
  triggerKeywords: string[]          // 필수, 최소 1개
  replyText: string                  // 필수
  replyLink?: string | null
  isActive?: boolean                 // 기본 true
  priority?: number                  // 기본 100
}
```

---

## API 함수 명세

### Dashboard

| 함수 | 설명 | Supabase 쿼리 대상 | 반환 타입 |
|------|------|-------------------|-----------|
| `getDashboardKpis()` | KPI 4종 집계 (Promise.all 병렬) | rules(count), incoming_messages(count, today), outgoing_messages(count, today+success) | `Promise<DashboardKpis>` |
| `getRecentIncoming(limit?)` | 최근 수신 메시지 목록 | incoming_messages ORDER BY received_at DESC + rules JOIN | `Promise<IncomingMessage[]>` |
| `getRecentFailures(limit?)` | 최근 발송 실패 목록 | outgoing_messages WHERE send_status='failed' + rules JOIN | `Promise<OutgoingMessage[]>` |

**Supabase 쿼리 상세:**

```typescript
// getDashboardKpis
const today = new Date().toISOString().split('T')[0]

const [totalRules, activeRules, todayIncoming, todaySuccess] = await Promise.all([
  supabase.from('rules').select('*', { count: 'exact', head: true }),
  supabase.from('rules').select('*', { count: 'exact', head: true }).eq('is_active', true),
  supabase.from('incoming_messages').select('*', { count: 'exact', head: true }).gte('received_at', today),
  supabase.from('outgoing_messages').select('*', { count: 'exact', head: true }).eq('send_status', 'success').gte('sent_at', today),
])

// getRecentIncoming
supabase
  .from('incoming_messages')
  .select('*, rules(name)')
  .order('received_at', { ascending: false })
  .limit(limit ?? 5)

// getRecentFailures
supabase
  .from('outgoing_messages')
  .select('*, rules(name)')
  .eq('send_status', 'failed')
  .order('sent_at', { ascending: false })
  .limit(limit ?? 5)
```

---

### Rules

| 함수 | 설명 | 반환 타입 |
|------|------|-----------|
| `getRules()` | 전체 목록 조회 (클라이언트 필터/페이지네이션용) | `Promise<Rule[]>` |
| `getRuleById(id: string)` | 단건 조회 | `Promise<Rule>` |
| `createRule(payload: RulePayload)` | 규칙 생성 | `Promise<Rule>` |
| `updateRule(id: string, payload: RulePayload)` | 전체 수정 | `Promise<Rule>` |
| `toggleRule(id: string, isActive: boolean)` | 활성 토글 | `Promise<Pick<Rule, 'id' \| 'isActive' \| 'updatedAt'>>` |
| `deleteRule(id: string)` | 삭제 | `Promise<void>` |
| `getRuleMatches(id: string, limit?: number)` | 규칙에 매칭된 수신 로그 | `Promise<IncomingMessage[]>` |

**Supabase 쿼리 상세:**

```typescript
// getRules
supabase
  .from('rules')
  .select('*')
  .order('priority', { ascending: false })

// getRuleById
supabase
  .from('rules')
  .select('*')
  .eq('id', id)
  .single()

// createRule
supabase
  .from('rules')
  .insert({
    name: payload.name,
    description: payload.description ?? null,
    match_type: payload.matchType,
    trigger_keywords: payload.triggerKeywords,
    reply_text: payload.replyText,
    reply_link: payload.replyLink ?? null,
    is_active: payload.isActive ?? true,
    priority: payload.priority ?? 100,
  })
  .select()
  .single()

// updateRule
supabase
  .from('rules')
  .update({
    name: payload.name,
    description: payload.description ?? null,
    match_type: payload.matchType,
    trigger_keywords: payload.triggerKeywords,
    reply_text: payload.replyText,
    reply_link: payload.replyLink ?? null,
    is_active: payload.isActive ?? true,
    priority: payload.priority ?? 100,
  })
  .eq('id', id)
  .select()
  .single()

// toggleRule
supabase
  .from('rules')
  .update({ is_active: isActive })
  .eq('id', id)
  .select('id, is_active, updated_at')
  .single()

// deleteRule
supabase
  .from('rules')
  .delete()
  .eq('id', id)

// getRuleMatches
supabase
  .from('incoming_messages')
  .select('*, rules(name)')
  .eq('matched_rule_id', id)
  .order('received_at', { ascending: false })
  .limit(limit ?? 10)
```

> `getRules()`는 전체를 한 번에 반환. 검색/필터/페이지네이션은 `RulesPage.tsx`의 클라이언트 로직에서 처리.

---

### Logs

| 함수 | 설명 | 반환 타입 |
|------|------|-----------|
| `getIncomingLogs()` | 수신 로그 전체 조회 (클라이언트 필터/페이지네이션용) | `Promise<IncomingMessage[]>` |
| `getOutgoingLogs()` | 발송 로그 전체 조회 (클라이언트 필터/페이지네이션용) | `Promise<OutgoingMessage[]>` |

**Supabase 쿼리 상세:**

```typescript
// getIncomingLogs
supabase
  .from('incoming_messages')
  .select('*, rules(name)')
  .order('received_at', { ascending: false })

// getOutgoingLogs
supabase
  .from('outgoing_messages')
  .select('*, rules(name), incoming_messages(message_text)')
  .order('sent_at', { ascending: false })
```

> 기존 `IncomingLogsPage.tsx` / `OutgoingLogsPage.tsx`의 `useMemo` 필터, 페이지네이션 로직을 그대로 유지.
> 반환값이 배열이므로 기존 `setLogs(items)` 패턴과 호환됩니다.

---

### Test

| 함수 | 설명 | 반환 타입 |
|------|------|-----------|
| `getActiveRules()` | 활성 규칙 전체 조회 (클라이언트 매칭용) | `Promise<Rule[]>` |

**Supabase 쿼리 상세:**

```typescript
supabase
  .from('rules')
  .select('*')
  .eq('is_active', true)
  .order('priority', { ascending: false })
```

> `TestPage.tsx`의 `matchRules()` 함수는 `rule.keywords` 대신 `rule.triggerKeywords` 필드를 사용하도록 수정.

---

### Settings (UI 페이지 없음 — api.ts 구현만)

| 함수 | 설명 | 반환 타입 |
|------|------|-----------|
| `getSettings()` | 시스템 설정 조회 | `Promise<IntegrationSettings>` |
| `updateSettings(payload: Partial<Omit<IntegrationSettings, 'id' \| 'updatedAt'>>)` | 시스템 설정 수정 | `Promise<IntegrationSettings>` |

**Supabase 쿼리 상세:**

```typescript
// getSettings
supabase
  .from('integration_settings')
  .select('*')
  .single()

// updateSettings
supabase
  .from('integration_settings')
  .update({
    fallback_reply: payload.fallbackReply,
    dedupe_window: payload.dedupeWindow,
    test_mode: payload.testMode,
    log_page_size: payload.logPageSize,
    default_sort: payload.defaultSort,
  })
  .select()
  .single()
```

> Settings 페이지는 MVP 범위 밖. 함수만 구현해두고 Phase 3에서 호출 없음.

---

## transform.ts 변환 규칙

| 함수 | DB row | React 타입 | 특이사항 |
|------|--------|-----------|---------|
| `toRule(row)` | rules row | `Rule` | `trigger_keywords → triggerKeywords`, `keywordCount`는 `triggerKeywords.length`로 파생 (타입에는 없음, 컴포넌트에서 `.length` 사용) |
| `toIncomingMessage(row)` | incoming_messages row + rules JOIN | `IncomingMessage` | `received_at → receivedAt`, `rules.name → matchedRuleName`, `RuleDetailPage`의 `matchedAt` 참조 제거하고 `receivedAt` 사용 |
| `toOutgoingMessage(row)` | outgoing_messages row + rules JOIN + incoming_messages JOIN | `OutgoingMessage` | `rules.name → matchedRuleName`, `incoming_messages.message_text → originalMessage` |
| `toIntegrationSettings(row)` | integration_settings row | `IntegrationSettings` | `fallback_reply → fallbackReply`, `dedupe_window → dedupeWindow`, `test_mode → testMode`, `log_page_size → logPageSize`, `default_sort → defaultSort` |

---

## 에러 처리 규칙

- 모든 api.ts 함수는 Supabase 에러 발생 시 `throw new Error(error.message)` 처리
- 페이지 컴포넌트에서 try/catch로 수신
- 에러 표시: `toast.error()` (기존 sonner 활용) + `console.error`
