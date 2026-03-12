# 페이지 라우터별 데이터 CRUD IA (Information Architecture)

이 문서는 Instagram DM Auto Reply Admin 서비스의 각 페이지 라우터에서
백엔드와 어떤 데이터를 주고받아야 하는지(CRUD)를 정의합니다.

---

## 참조 데이터 엔티티

| 엔티티 | 테이블명 | 주요 필드 |
|--------|----------|-----------|
| 규칙 | `rules` | id, name, description, match_type, trigger_keywords[], reply_text, reply_link, is_active, priority, created_at, updated_at |
| 수신 메시지 | `incoming_messages` | id, sender_id, message_text, platform_message_id, matched_rule_id, match_status, raw_payload, received_at |
| 발송 메시지 | `outgoing_messages` | id, incoming_log_id, recipient_id, matched_rule_id, sent_text, sent_link, send_status, error_message, meta_response_payload, sent_at |
| 연동 설정 | `integration_settings` | id, fallback_reply, dedupe_window, test_mode, updated_at |

---

## 라우터 목록

| # | 라우터 | 페이지명 | 파라미터 |
|---|--------|----------|----------|
| 1 | `/` | 대시보드 | - |
| 2 | `/rules` | 규칙 목록 | ?search=, ?status= |
| 3 | `/rules/new` | 새 규칙 생성 | - |
| 4 | `/rules/:ruleId` | 규칙 상세/수정 | ruleId |
| 5 | `/logs/incoming` | 수신 로그 | ?keyword=, ?matchStatus= |
| 6 | `/logs/outgoing` | 발송 로그 | ?status=, ?search= |
| 7 | `/test` | 테스트 매칭 | - |
| 8 | `/settings/meta` | Meta 연동 상태 | - |
| 9 | `/settings/system` | 시스템 설정 | - |

---

## 1. `/` — 대시보드

### 목적
운영자가 현재 시스템 상태를 한눈에 파악하는 메인 화면

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `rules` | 총 규칙 수 집계 |
| **Read** | `rules` | 활성 규칙 수 집계 (is_active = true) |
| **Read** | `incoming_messages` | 오늘 수신 메시지 수 집계 |
| **Read** | `incoming_messages` | 최근 수신 메시지 목록 (최신 5~10건) |
| **Read** | `outgoing_messages` | 오늘 발송 성공 수 집계 (send_status = 'success') |
| **Read** | `outgoing_messages` | 최근 발송 실패 목록 (send_status = 'failed', 최신 5~10건) |

### 백엔드 API 후보

```
GET /api/dashboard/kpis
  → { totalRules, activeRules, todayIncoming, todayOutgoingSuccess }

GET /api/dashboard/recent-incoming?limit=5
  → [ { sender_id, message_text, received_at, match_status, matched_rule_id } ]

GET /api/dashboard/recent-failures?limit=5
  → [ { recipient_id, matched_rule_id, error_message, sent_at } ]
```

### Supabase 쿼리 방향

```sql
-- KPI: 총 규칙 수
SELECT count(*) FROM rules;

-- KPI: 활성 규칙 수
SELECT count(*) FROM rules WHERE is_active = true;

-- KPI: 오늘 수신
SELECT count(*) FROM incoming_messages
WHERE received_at >= CURRENT_DATE;

-- KPI: 오늘 발송 성공
SELECT count(*) FROM outgoing_messages
WHERE send_status = 'success' AND sent_at >= CURRENT_DATE;

-- 최근 수신
SELECT * FROM incoming_messages
ORDER BY received_at DESC LIMIT 5;

-- 최근 실패
SELECT * FROM outgoing_messages
WHERE send_status = 'failed'
ORDER BY sent_at DESC LIMIT 5;
```

### Create / Update / Delete
없음 (읽기 전용 화면)

---

## 2. `/rules` — 규칙 목록

### 목적
등록된 자동응답 규칙을 목록으로 조회, 검색, 필터, 활성 토글

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `rules` | 규칙 목록 조회 (검색, 필터, 정렬, 페이지네이션) |
| **Update** | `rules` | 활성/비활성 토글 (is_active 필드만 변경) |

### 백엔드 API 후보

```
GET /api/rules?search=&status=&page=&pageSize=&sortBy=&sortOrder=
  → { data: [ Rule ], total, page, pageSize }

PATCH /api/rules/:ruleId/toggle
  body: { is_active: boolean }
  → { id, is_active, updated_at }
```

### Supabase 쿼리 방향

```sql
-- 목록 조회 (검색 + 필터 + 페이지네이션)
SELECT * FROM rules
WHERE (name ILIKE '%검색어%' OR description ILIKE '%검색어%')
  AND (is_active = :statusFilter OR :statusFilter IS NULL)
ORDER BY priority DESC, created_at DESC
LIMIT :pageSize OFFSET (:page - 1) * :pageSize;

-- 전체 건수
SELECT count(*) FROM rules
WHERE ...동일 조건...;

-- 활성 토글
UPDATE rules
SET is_active = :newValue, updated_at = now()
WHERE id = :ruleId
RETURNING id, is_active, updated_at;
```

### 표시 필드

| 컬럼 | 소스 필드 |
|------|-----------|
| 규칙명 | name |
| 매칭 방식 | match_type |
| 키워드 수 | array_length(trigger_keywords) |
| 응답 요약 | reply_text (truncated) |
| 상태 | is_active |
| 우선순위 | priority |
| 수정일 | updated_at |

---

## 3. `/rules/new` — 새 규칙 생성

### 목적
새 자동응답 규칙을 생성하는 폼 화면

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Create** | `rules` | 새 규칙 레코드 삽입 |

### 백엔드 API 후보

```
POST /api/rules
  body: {
    name: string,
    description: string,
    match_type: 'contains' | 'exact',
    trigger_keywords: string[],
    reply_text: string,
    reply_link: string | null,
    is_active: boolean,
    priority: number
  }
  → { id, name, ..., created_at }
```

### Supabase 쿼리 방향

```sql
INSERT INTO rules (name, description, match_type, trigger_keywords,
                   reply_text, reply_link, is_active, priority)
VALUES (:name, :description, :matchType, :keywords,
        :replyText, :replyLink, :isActive, :priority)
RETURNING *;
```

### 유효성 검증 (프론트 + 백엔드 공통)

| 필드 | 규칙 |
|------|------|
| name | 필수, 빈 문자열 불가 |
| trigger_keywords | 필수, 최소 1개 이상 |
| reply_text | 필수, 빈 문자열 불가 |
| match_type | 'contains' 또는 'exact' 중 하나 |
| priority | 정수, 0 이상 |
| reply_link | 선택, URL 형식 검증 |

### Read / Update / Delete
없음 (생성 전용 화면)

---

## 4. `/rules/:ruleId` — 규칙 상세/수정

### 목적
기존 규칙을 상세 조회하고 수정/삭제한다

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `rules` | 단건 규칙 조회 (ruleId 기준) |
| **Read** | `incoming_messages` | 해당 규칙에 매칭된 최근 수신 메시지 목록 |
| **Update** | `rules` | 규칙 필드 전체 수정 |
| **Update** | `rules` | 활성/비활성 토글 (is_active) |
| **Delete** | `rules` | 규칙 삭제 (soft delete 또는 hard delete) |

### 백엔드 API 후보

```
GET /api/rules/:ruleId
  → Rule

GET /api/rules/:ruleId/matches?limit=10
  → [ { sender_id, message_text, received_at } ]

PUT /api/rules/:ruleId
  body: {
    name, description, match_type, trigger_keywords,
    reply_text, reply_link, is_active, priority
  }
  → Rule (updated)

PATCH /api/rules/:ruleId/toggle
  body: { is_active: boolean }
  → { id, is_active, updated_at }

DELETE /api/rules/:ruleId
  → { success: true }
```

### Supabase 쿼리 방향

```sql
-- 단건 조회
SELECT * FROM rules WHERE id = :ruleId;

-- 최근 매칭 수신 메시지
SELECT * FROM incoming_messages
WHERE matched_rule_id = :ruleId
ORDER BY received_at DESC LIMIT 10;

-- 전체 수정
UPDATE rules
SET name = :name, description = :description,
    match_type = :matchType, trigger_keywords = :keywords,
    reply_text = :replyText, reply_link = :replyLink,
    is_active = :isActive, priority = :priority,
    updated_at = now()
WHERE id = :ruleId
RETURNING *;

-- 삭제
DELETE FROM rules WHERE id = :ruleId;
```

### 삭제 시 연관 데이터 처리

| 연관 테이블 | 처리 방식 |
|-------------|-----------|
| `incoming_messages.matched_rule_id` | SET NULL 또는 보존 (로그는 삭제하지 않음) |
| `outgoing_messages.matched_rule_id` | SET NULL 또는 보존 (로그는 삭제하지 않음) |

---

## 5. `/logs/incoming` — 수신 로그

### 목적
들어온 DM 메시지를 조회하고 매칭 결과를 확인

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `incoming_messages` | 수신 로그 목록 조회 (검색, 필터, 페이지네이션) |
| **Read** | `rules` | 매칭된 규칙명 표시를 위한 JOIN |

### 백엔드 API 후보

```
GET /api/logs/incoming?keyword=&matchStatus=&page=&pageSize=
  → {
      data: [ {
        id, sender_id, message_text, received_at,
        match_status, matched_rule_name
      } ],
      total, page, pageSize
    }

GET /api/logs/incoming/:logId
  → { ...full incoming message with raw_payload }
```

### Supabase 쿼리 방향

```sql
-- 목록 조회 (검색 + 매칭 필터)
SELECT
  im.*,
  r.name AS matched_rule_name
FROM incoming_messages im
LEFT JOIN rules r ON im.matched_rule_id = r.id
WHERE (im.message_text ILIKE '%검색어%' OR im.sender_id ILIKE '%검색어%')
  AND (im.match_status = :matchStatusFilter OR :matchStatusFilter IS NULL)
ORDER BY im.received_at DESC
LIMIT :pageSize OFFSET (:page - 1) * :pageSize;
```

### 표시 필드

| 컬럼 | 소스 필드 |
|------|-----------|
| 발신자 | sender_id |
| 메시지 | message_text |
| 수신시각 | received_at |
| 매칭여부 | match_status ('matched' / 'unmatched') |
| 매칭규칙 | rules.name (JOIN) |

### 상세 펼침 시 추가 표시

| 필드 | 소스 |
|------|------|
| 원문 전체 | message_text |
| platform_message_id | platform_message_id |
| raw_payload | raw_payload (JSON) |

### Create / Update / Delete
없음 (읽기 전용 화면, 로그는 Edge Function에서 자동 생성)

---

## 6. `/logs/outgoing` — 발송 로그

### 목적
자동응답 발송 결과를 조회하고 성공/실패 상태를 확인

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `outgoing_messages` | 발송 로그 목록 조회 (검색, 필터, 페이지네이션) |
| **Read** | `rules` | 적용된 규칙명 표시를 위한 JOIN |
| **Read** | `incoming_messages` | 원본 수신 메시지 참조를 위한 JOIN |

### 백엔드 API 후보

```
GET /api/logs/outgoing?status=&search=&page=&pageSize=
  → {
      data: [ {
        id, recipient_id, matched_rule_name, sent_text,
        send_status, error_message, sent_at
      } ],
      total, page, pageSize
    }

GET /api/logs/outgoing/:logId
  → { ...full outgoing message with meta_response_payload }
```

### Supabase 쿼리 방향

```sql
-- 목록 조회
SELECT
  om.*,
  r.name AS matched_rule_name,
  im.message_text AS original_message
FROM outgoing_messages om
LEFT JOIN rules r ON om.matched_rule_id = r.id
LEFT JOIN incoming_messages im ON om.incoming_log_id = im.id
WHERE (om.send_status = :statusFilter OR :statusFilter IS NULL)
  AND (om.recipient_id ILIKE '%검색어%'
       OR r.name ILIKE '%검색어%'
       OR :search IS NULL)
ORDER BY om.sent_at DESC
LIMIT :pageSize OFFSET (:page - 1) * :pageSize;
```

### 표시 필드

| 컬럼 | 소스 필드 |
|------|-----------|
| 수신자 | recipient_id |
| 규칙명 | rules.name (JOIN) |
| 발송상태 | send_status ('success' / 'failed') |
| 발송시각 | sent_at |

### 상세 펼침 시 추가 표시

| 필드 | 소스 |
|------|------|
| 발송 텍스트 | sent_text |
| 발송 링크 | sent_link |
| 실패 사유 | error_message |
| Meta 응답 | meta_response_payload (JSON) |
| 원본 수신 메시지 | incoming_messages.message_text (JOIN) |

### Create / Update / Delete
없음 (읽기 전용 화면, 로그는 Edge Function에서 자동 생성)

---

## 7. `/test` — 테스트 매칭

### 목적
운영자가 테스트 문장을 입력하고 어떤 규칙이 매칭되는지 검증

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `rules` | 활성 규칙 목록 조회 (매칭 로직 수행용) |

### 백엔드 API 후보

```
POST /api/test/match
  body: { message: string }
  → {
      matched: boolean,
      rule: { id, name, match_type, trigger_keywords, reply_text, reply_link, priority } | null,
      matched_keyword: string | null,
      all_candidates: [ { rule_id, rule_name, priority } ]
    }
```

### 매칭 로직 (Edge Function 또는 프론트 시뮬레이션)

```
1. 활성 규칙 전체 조회 (is_active = true)
2. priority 내림차순 정렬
3. 각 규칙의 trigger_keywords 순회
   - match_type = 'contains' → 메시지에 키워드 포함 여부
   - match_type = 'exact' → 메시지와 키워드 완전 일치
4. 첫 번째 매칭 규칙 반환
5. 매칭 없으면 { matched: false } 반환
```

### Supabase 쿼리 방향

```sql
-- 활성 규칙 전체 조회
SELECT * FROM rules
WHERE is_active = true
ORDER BY priority DESC;
```

### Create / Update / Delete
없음 (매칭 검증 전용, 데이터 변경 없음)

---

## 8. `/settings/meta` — Meta 연동 상태

### 목적
Meta(Instagram) API 연동 상태를 확인하고 설정을 관리

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `integration_settings` | 현재 연동 설정 조회 |
| **Read** | `incoming_messages` | 최근 webhook 수신 시간 (max received_at) |
| **Read** | `outgoing_messages` | 최근 발송 성공/실패 시간 |
| **Update** | `integration_settings` | 연동 관련 설정 변경 |

### 백엔드 API 후보

```
GET /api/settings/meta
  → {
      webhook_status: 'active' | 'inactive',
      verify_token_set: boolean,
      access_token_set: boolean,
      last_webhook_received_at: timestamp | null,
      last_send_success_at: timestamp | null,
      last_send_failure_at: timestamp | null
    }

PUT /api/settings/meta
  body: { verify_token?, access_token?, webhook_url? }
  → { success: true, updated_at }
```

### Supabase 쿼리 방향

```sql
-- 연동 설정 조회
SELECT * FROM integration_settings LIMIT 1;

-- 최근 webhook 수신
SELECT max(received_at) AS last_webhook
FROM incoming_messages;

-- 최근 발송 성공
SELECT max(sent_at) AS last_success
FROM outgoing_messages WHERE send_status = 'success';

-- 최근 발송 실패
SELECT max(sent_at) AS last_failure
FROM outgoing_messages WHERE send_status = 'failed';
```

### 표시 항목

| 항목 | 소스 |
|------|------|
| Webhook 상태 | integration_settings 또는 health check |
| Verify Token 설정 여부 | integration_settings |
| Access Token 존재 여부 | integration_settings |
| 최근 Webhook 수신 시간 | incoming_messages (max) |
| 최근 발송 성공 시간 | outgoing_messages (max, success) |
| 최근 발송 실패 시간 | outgoing_messages (max, failed) |

---

## 9. `/settings/system` — 시스템 설정

### 목적
자동응답 시스템의 전역 동작 설정을 관리

### CRUD 요약

| 작업 | 대상 엔티티 | 설명 |
|------|-------------|------|
| **Read** | `integration_settings` | 현재 시스템 설정 조회 |
| **Update** | `integration_settings` | 시스템 설정 변경 |

### 백엔드 API 후보

```
GET /api/settings/system
  → {
      fallback_reply: string,
      dedupe_window: number (seconds),
      test_mode: boolean,
      log_page_size: number,
      default_sort: string,
      updated_at: timestamp
    }

PUT /api/settings/system
  body: {
    fallback_reply?: string,
    dedupe_window?: number,
    test_mode?: boolean,
    log_page_size?: number,
    default_sort?: string
  }
  → { ...updated settings }
```

### Supabase 쿼리 방향

```sql
-- 설정 조회
SELECT * FROM integration_settings LIMIT 1;

-- 설정 변경
UPDATE integration_settings
SET fallback_reply = :fallbackReply,
    dedupe_window = :dedupeWindow,
    test_mode = :testMode,
    updated_at = now()
WHERE id = :settingsId
RETURNING *;
```

### 설정 필드 상세

| 필드 | 타입 | 설명 | 기본값 |
|------|------|------|--------|
| fallback_reply | string | 미매칭 시 기본 응답 텍스트 | "문의 감사합니다. 담당자가 확인 후 답변드리겠습니다." |
| dedupe_window | integer | 중복 메시지 무시 시간 (초) | 60 |
| test_mode | boolean | 테스트 모드 (실제 발송 차단) | false |
| log_page_size | integer | 로그 페이지당 표시 건수 | 20 |
| default_sort | string | 기본 정렬 기준 | 'created_at_desc' |

---

## CRUD 전체 매트릭스

| 라우터 | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| `/` | - | rules, incoming, outgoing (집계+목록) | - | - |
| `/rules` | - | rules (목록) | rules.is_active | - |
| `/rules/new` | rules | - | - | - |
| `/rules/:ruleId` | - | rules (단건), incoming (매칭 로그) | rules (전체 필드) | rules |
| `/logs/incoming` | - | incoming + rules (JOIN) | - | - |
| `/logs/outgoing` | - | outgoing + rules + incoming (JOIN) | - | - |
| `/test` | - | rules (활성 목록) | - | - |
| `/settings/meta` | - | integration_settings, incoming, outgoing | integration_settings | - |
| `/settings/system` | - | integration_settings | integration_settings | - |

---

## 엔티티별 CRUD 사용처

### `rules` 테이블

| 작업 | 사용 라우터 |
|------|-------------|
| Create | `/rules/new` |
| Read (목록) | `/rules`, `/test` |
| Read (단건) | `/rules/:ruleId` |
| Read (집계) | `/` |
| Read (JOIN) | `/logs/incoming`, `/logs/outgoing` |
| Update (전체) | `/rules/:ruleId` |
| Update (토글) | `/rules`, `/rules/:ruleId` |
| Delete | `/rules/:ruleId` |

### `incoming_messages` 테이블

| 작업 | 사용 라우터 |
|------|-------------|
| Create | Edge Function (webhook 수신 시 자동 생성) |
| Read (목록) | `/logs/incoming` |
| Read (집계) | `/` |
| Read (매칭 로그) | `/rules/:ruleId` |
| Read (최근 수신) | `/`, `/settings/meta` |

### `outgoing_messages` 테이블

| 작업 | 사용 라우터 |
|------|-------------|
| Create | Edge Function (자동응답 발송 시 자동 생성) |
| Read (목록) | `/logs/outgoing` |
| Read (집계) | `/` |
| Read (최근 실패) | `/`, `/settings/meta` |

### `integration_settings` 테이블

| 작업 | 사용 라우터 |
|------|-------------|
| Read | `/settings/meta`, `/settings/system` |
| Update | `/settings/meta`, `/settings/system` |

---

## Edge Function (백엔드 자동 처리) 데이터 흐름

프론트엔드 라우터와 별개로 Edge Function이 자동 처리하는 데이터 흐름입니다.

```
[Instagram 사용자 DM]
       ↓
[Meta Webhook → Supabase Edge Function]
       ↓
  ┌────────────────────────┐
  │ 1. incoming_messages   │ ← CREATE (수신 로그 저장)
  │    INSERT              │
  └────────┬───────────────┘
           ↓
  ┌────────────────────────┐
  │ 2. rules               │ ← READ (활성 규칙 조회 + 매칭)
  │    SELECT WHERE active │
  └────────┬───────────────┘
           ↓
  ┌────────────────────────┐
  │ 3. incoming_messages   │ ← UPDATE (매칭 결과 반영)
  │    UPDATE match_status │
  │    UPDATE matched_rule │
  └────────┬───────────────┘
           ↓
  ┌────────────────────────┐
  │ 4. Meta Send API       │ ← 외부 API 호출
  └────────┬───────────────┘
           ↓
  ┌────────────────────────┐
  │ 5. outgoing_messages   │ ← CREATE (발송 로그 저장)
  │    INSERT              │
  └────────────────────────┘
```
