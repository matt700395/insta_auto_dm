프로젝트명:
Instagram DM Auto Reply Admin

목적:
Instagram DM 자동응답 운영자가 규칙을 생성/수정하고, 수신 메시지와 자동응답 결과를 확인하며, 테스트 문구로 규칙 매칭 결과를 검증할 수 있는 관리자용 웹앱의 UI/UX 테스트용 프론트엔드 목업을 완결 수준으로 구현한다.

서비스 유형:
로컬 단독 사용 관리자 대시보드 웹앱

MVP 범위:
- 대시보드
- 자동응답 규칙 목록
- 새 규칙 생성
- 규칙 상세/수정
- 수신 로그 조회
- 발송 로그 조회
- 테스트 메시지 매칭 화면

이 문서는 프론트엔드 목업 완결 전용이다.
화면 완성도, 사용자 흐름, 상태 전이, 더미 기반 인터랙션 완결만 목표로 한다.
데이터 모델 정규화, 엔티티 설계, API 설계, 백엔드 연동, 재사용 가능한 컴포넌트 아키텍처 설계는 하지 않는다.

기술 스택:
- React 18 + TypeScript + Vite
- React Router DOM v6
- Tailwind CSS
- shadcn/ui (Vite 기준)
- Framer Motion
- Lucide React
- Sonner

중요 선언:
이 프로젝트는 UI/UX 테스트용 프론트엔드 목업이다.

- 어떤 서버도 생성하지 않는다.
- 어떤 데이터베이스도 생성하지 않는다.
- 어떤 API route도 생성하지 않는다.
- 어떤 외부 요청도 하지 않는다.
- fetch/axios 같은 네트워크 코드를 만들지 않는다.
- 환경변수를 요구하지 않는다.
- 인증 시스템을 생성하지 않는다.
- 로그인/회원가입/권한관리 기능을 만들지 않는다.
- 결제 SDK를 설치하지 않는다.
- Next.js를 설치하지 않는다. React 18 + Vite 프로젝트다.
- SSR, SSG, 서버 컴포넌트, API 라우트는 사용하지 않는다.
- 라우팅은 react-router-dom의 BrowserRouter + Routes + Route를 사용한다.
- next/router, next/link, next/image 같은 Next.js 전용 API는 절대 사용하지 않는다.

모든 데이터는 로컬 JSON 더미 파일에서만 가져온다.
모든 인터랙션은 로컬 상태 변화로만 시뮬레이션한다.

프로젝트 초기 파일 구조:
src/
  main.tsx
  App.tsx
  pages/
    DashboardPage.tsx
    RulesPage.tsx
    RuleNewPage.tsx
    RuleDetailPage.tsx
    IncomingLogsPage.tsx
    OutgoingLogsPage.tsx
    TestPage.tsx
public/
  data/
    routes/
      dashboard.json
      rules.json
      rule-new.json
      rule-detail.json
      logs-incoming.json
      logs-outgoing.json
      test.json

main.tsx는 BrowserRouter로 감싼다.
App.tsx는 Routes / Route로 명시적 라우팅을 구성한다.

예시 구조:
- "/" → DashboardPage
- "/rules" → RulesPage
- "/rules/new" → RuleNewPage
- "/rules/:ruleId" → RuleDetailPage
- "/logs/incoming" → IncomingLogsPage
- "/logs/outgoing" → OutgoingLogsPage
- "/test" → TestPage

────────────────────────────────────────────────────────
[PRD 요약]
────────────────────────────────────────────────────────

1. What
Instagram DM 자동응답 운영자가 규칙을 관리하고 메시지 처리 결과를 검토하는 로컬 관리자 UI를 제공한다.

2. Value
- 운영자가 자동응답 규칙을 빠르게 만들고 수정할 수 있다.
- 어떤 메시지가 들어왔고 어떤 규칙이 적용되었는지 한눈에 파악할 수 있다.
- 실제 연동 전에 운영 흐름을 UI 수준에서 검증할 수 있다.
- 팀 내부 데모, 요구사항 정렬, 후속 DB/연동 설계의 기준 화면으로 활용할 수 있다.

3. JTBD
- “운영자로서, 새 문의 유형이 생겼을 때 즉시 자동응답 규칙을 추가하고 싶다.”
- “운영자로서, 특정 메시지에 왜 어떤 답변이 나갔는지 확인하고 싶다.”
- “운영자로서, 실제 인스타 연동 전에 테스트 문장으로 규칙 매칭을 검증하고 싶다.”

4. Primary Personas
Persona A. 운영 관리자
- 자동응답 규칙을 직접 만들고 수정한다.
- UI가 직관적이고 빠르게 편집 가능해야 한다.
- 규칙 상태와 우선순위를 자주 조정한다.

Persona B. CS/마케팅 담당자
- 수신 문의 유형을 확인하고 운영팀에 개선 요청을 한다.
- 발송 결과와 응답 내용을 확인해야 한다.
- 메시지 패턴을 보고 어떤 규칙이 필요한지 판단한다.

Persona C. 대표/기획자
- 전체 운영 현황을 대시보드에서 확인하고 싶다.
- 현재 규칙 수, 수신량, 응답 성공 여부를 빠르게 파악하고 싶다.
- 실제 백엔드 연동 전에 목업으로 제품 완성도를 검토하고 싶다.

5. Non-Goals
- 실제 Instagram API 연동
- 실제 로그인 인증
- 실제 토큰 관리
- 실제 데이터 저장
- 실제 외부 메시지 전송
- 실제 백엔드 구축
- 다국어 지원
- 모바일 앱 최적화
- 고도화된 접근권한 체계

6. MVP Metrics
- 각 라우터가 독립적으로 렌더링된다.
- JSON 더미 기반으로 모든 핵심 화면이 동작한다.
- 규칙 생성/수정/테스트 플로우가 UI 수준에서 완결된다.
- 수신/발송 로그 화면에서 상태별 UI를 확인할 수 있다.
- 운영자 데모 시 실제 서비스처럼 보이는 완성도를 가진다.

────────────────────────────────────────────────────────
[라우터 목록]
────────────────────────────────────────────────────────

- "/"                             (dashboard)
- "/rules"
- "/rules/new"
- "/rules/:ruleId"                (param: ruleId)
- "/logs/incoming"
- "/logs/outgoing"
- "/test"

라우터는 위 목록으로 고정하고 변경하지 않는다.

────────────────────────────────────────────────────────
[공통 UI 규칙]
────────────────────────────────────────────────────────

1. Header 구성
- 좌측: 서비스명 "Instagram DM Admin"
- 우측: 현재 로컬 목업 상태 배지 또는 간단한 보조 텍스트
- 로그인/로그아웃 버튼은 절대 넣지 않는다.
- 모든 라우트에서 고정 노출
- 상단 sticky 느낌으로 유지
- 배경은 밝은 흰색 또는 아주 옅은 회색
- 하단 border로 구분

2. Sidebar 구성
- 모든 라우트에서 고정 노출
- 메뉴:
  - 대시보드
  - 규칙 관리
  - 수신 로그
  - 발송 로그
  - 테스트
- 현재 라우트 활성 상태 강조
- 아이콘 + 텍스트 조합
- 좌측 세로 네비게이션

3. Footer 구성
- MVP에서는 단순 텍스트
- “Mock UI for local internal testing”
- 모든 라우트 하단에 간결하게 표시
- 과한 정보 금지

4. 공통 카드 디자인
- radius는 충분히 부드럽게
- border + subtle shadow
- 내부 padding 충분히 확보
- 상단 제목과 본문이 분명하게 구분
- 정보 밀도는 높지만 답답하지 않게 구성

5. 버튼 스타일 규칙
- Primary: 진한 배경, 흰색 텍스트
- Secondary: 연한 배경, 기본 텍스트
- Destructive: 빨간 계열
- Ghost: 배경 없음
- 아이콘 버튼은 맥락상 필요한 곳에만 사용
- 버튼 크기는 너무 작지 않게
- 같은 페이지에서 주 액션은 1개만 가장 강하게 보이게

6. 입력창 규칙
- label 명시
- placeholder 포함
- helper text는 꼭 필요한 경우만
- 에러 상태는 붉은 border + 에러 문구
- textarea는 응답 텍스트 입력에 사용
- multi-keyword 입력은 태그형 UI로 구현

7. Loading UI
- 페이지 전체 스켈레톤 또는 카드 스켈레톤
- 테이블은 4~6개 줄 스켈레톤
- 초기 진입 시 500ms~900ms 정도의 모의 loading 연출 가능
- 실제 네트워크 호출은 없고, setTimeout 기반 UI 시뮬레이션만 사용

8. Empty UI
- “표시할 데이터가 없습니다” 류의 안내 문구
- 관련 CTA 버튼 제공
- 예: 규칙이 없으면 “새 규칙 만들기”
- 예: 로그가 없으면 “테스트 페이지로 이동”

9. Error UI
- 빨간 톤 카드 또는 alert
- “문제가 발생했습니다. 다시 시도해주세요.”
- retry 버튼은 로컬 상태 초기화용으로만 작동
- 실제 요청 재시도 개념 금지

10. 애니메이션 규칙
- Framer Motion은 과하지 않게
- 페이지 진입 fade + slight up motion
- 카드 hover 미세 전환 허용
- 리스트 reflow 애니메이션은 과하면 금지

11. 레이아웃 규칙
- 데스크톱 우선
- 최소 1280px 기준으로 안정적인 관리자 화면
- 메인 컨텐츠는 max-width를 적절히 주되 지나치게 좁히지 않는다
- 대시보드/리스트 화면은 정보 밀도 우선
- 시각적 장식보다 운영 효율 우선

12. 초기 진입 규칙
- 앱 실행 시 바로 "/" 대시보드로 진입한다.
- 인증, 권한 분기, 보호 라우트는 만들지 않는다.
- 모든 라우터는 자유롭게 접근 가능해야 한다.

────────────────────────────────────────────────────────
[라우터별 JSON 더미]
────────────────────────────────────────────────────────

파일 위치:
- public/data/routes/dashboard.json
- public/data/routes/rules.json
- public/data/routes/rule-new.json
- public/data/routes/rule-detail.json
- public/data/routes/logs-incoming.json
- public/data/routes/logs-outgoing.json
- public/data/routes/test.json

JSON 기본 규격:
{
  "__mock": { "mode": "success" },
  "page": { ... },
  "view": { ... },
  "actions": { ... }
}

규칙:
- 페이지에 필요한 모든 데이터는 해당 JSON에만 존재한다.
- 다른 라우터와 구조를 맞출 필요 없다.
- 중복 허용.
- 구조 변경 자유.
- 단, 각 페이지는 반드시 initial / loading / success / empty / error 상태를 로컬 상태로 시뮬레이션 가능해야 한다.
- __mock.mode 값으로 기본 진입 상태를 결정 가능하게 한다.
  예: "success", "empty", "error"

라우터별 JSON 예시 방향:

1) dashboard.json
- page.title
- page.subtitle
- view.kpis[]
- view.recentIncoming[]
- view.recentOutgoingFailures[]
- actions.quickLinks[]

2) rules.json
- page.title
- view.filters
- view.rules[]
- actions.primaryButtonLabel

3) rule-new.json
- page.title
- view.form.defaultName
- view.form.defaultMatchType
- view.form.defaultKeywords[]
- view.form.defaultReplyText
- view.form.defaultReplyLink
- actions.submitLabel

4) rule-detail.json
- page.title
- view.rule
- view.recentMatches[]
- actions.saveLabel
- actions.archiveLabel

5) logs-incoming.json
- page.title
- view.filters
- view.logs[]
- actions.exportLabel

6) logs-outgoing.json
- page.title
- view.filters
- view.logs[]
- actions.exportLabel

7) test.json
- page.title
- view.defaultInput
- view.suggestedExamples[]
- view.resultPreview

────────────────────────────────────────────────────────
[라우터별 상세 명세]
────────────────────────────────────────────────────────

[Route: /]

- 목적
운영자가 현재 시스템 상태를 한눈에 파악한다.

- 진입 조건
앱 실행 시 기본 진입 페이지

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 타이틀 + 요약
4. KPI 카드 4개
5. 빠른 실행 영역
6. 최근 수신 메시지 리스트
7. 최근 발송 실패 로그 리스트
8. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.kpis[]
- actions.quickLinks[]
- view.recentIncoming[]
- view.recentOutgoingFailures[]

- 버튼 목록
1. 새 규칙 만들기
2. 규칙 목록 보기
3. 수신 로그 보기
4. 테스트 실행
5. 최근 항목 상세 이동 버튼

- 이벤트명
- DASHBOARD_GO_RULE_NEW
- DASHBOARD_GO_RULES
- DASHBOARD_GO_INCOMING_LOGS
- DASHBOARD_GO_TEST
- DASHBOARD_OPEN_RECENT_ITEM

- 클릭 시 UI 변화
- 각 CTA 클릭 시 해당 라우트로 이동
- 최근 항목 클릭 시 관련 페이지로 이동
- KPI 카드는 hover state만 제공

- 상태 머신
  - initial: 페이지 진입 전
  - loading: KPI/리스트 스켈레톤 표시
  - success: 전체 카드/리스트 노출
  - empty: 최근 로그가 없을 경우 empty 박스 표시
  - error: 대시보드 데이터를 불러오지 못했다는 경고 박스 표시

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 대시보드                                                  |
| - 대시보드           | 오늘의 운영 현황을 확인하세요.                             |
| - 규칙 관리          +-----------------------------------------------------------+
| - 수신 로그          | [총 규칙 수] [활성 규칙] [오늘 수신] [오늘 발송 성공]     |
| - 발송 로그          +-----------------------------------------------------------+
| - 테스트             | 빠른 실행                                                  |
|                      | [새 규칙 만들기] [수신 로그] [테스트] [규칙 목록]          |
|                      +-----------------------------------------------------------+
|                      | 최근 수신 메시지                                           |
|                      | 발신자 | 메시지 | 수신시간 | 매칭결과                     |
|                      +-----------------------------------------------------------+
|                      | 최근 발송 실패 로그                                        |
|                      | 수신자 | 규칙명 | 실패사유 | 시간                         |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /rules]

- 목적
등록된 자동응답 규칙을 목록으로 조회하고 검색, 필터, 상태 확인, 상세 이동을 수행한다.

- 진입 조건
로컬 앱 내 사이드바 또는 대시보드에서 진입

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목 + 설명 + 새 규칙 버튼
4. 검색 및 필터 바
5. 규칙 목록 테이블
6. 페이지네이션
7. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.filters.searchPlaceholder
- view.filters.statusOptions[]
- view.rules[]
- actions.primaryButtonLabel

- 버튼 목록
1. 새 규칙 만들기
2. 검색 실행 버튼
3. 상태 필터 드롭다운
4. 각 row 상세 보기
5. 활성/비활성 토글
6. 페이지 이동 버튼

- 이벤트명
- RULES_GO_NEW
- RULES_SEARCH_CHANGE
- RULES_FILTER_STATUS_CHANGE
- RULES_ROW_CLICK
- RULES_TOGGLE_ACTIVE
- RULES_PAGE_CHANGE

- 클릭 시 UI 변화
- 검색어 입력 시 로컬 필터링
- 상태 필터 선택 시 목록 재계산
- toggle 클릭 시 해당 row의 isActive만 로컬 상태 반영
- row 클릭 시 /rules/:ruleId 이동

- 상태 머신
  - initial: 초기 진입
  - loading: 테이블 스켈레톤
  - success: 규칙 목록 노출
  - empty: 조건에 맞는 규칙 없음
  - error: 목록 로딩 실패 경고 박스

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 규칙 관리                                  [새 규칙 만들기]|
|                      | 자동응답 규칙을 조회하고 수정합니다.                      |
|                      +-----------------------------------------------------------+
|                      | 검색 [________________________]  상태 [전체 ▼]            |
|                      +-----------------------------------------------------------+
|                      | 규칙명 | 매칭방식 | 키워드수 | 응답요약 | 상태 | 우선순위 |
|                      |-----------------------------------------------------------|
|                      | 가격 문의 | contains | 3 | 가격 링크 안내 | ON | 100      |
|                      | 위치 문의 | contains | 2 | 위치 안내      | OFF| 80       |
|                      | 협업 문의 | exact    | 1 | 담당자 안내    | ON | 90       |
|                      +-----------------------------------------------------------+
|                      | < 1 2 3 >                                                 |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /rules/new]

- 목적
새 자동응답 규칙을 생성한다.

- 진입 조건
규칙 목록 또는 대시보드에서 진입

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목
4. 기본 정보 섹션
5. 트리거 키워드 섹션
6. 응답 텍스트 섹션
7. 운영 설정 섹션
8. 하단 액션 버튼 영역
9. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.form.defaultName
- view.form.defaultDescription
- view.form.defaultMatchType
- view.form.defaultKeywords[]
- view.form.defaultReplyText
- view.form.defaultReplyLink
- view.form.defaultPriority
- actions.submitLabel
- actions.cancelLabel

- 버튼 목록
1. 키워드 추가
2. 키워드 삭제
3. 저장
4. 저장 후 목록으로
5. 취소

- 이벤트명
- RULE_NEW_NAME_CHANGE
- RULE_NEW_MATCH_TYPE_CHANGE
- RULE_NEW_ADD_KEYWORD
- RULE_NEW_REMOVE_KEYWORD
- RULE_NEW_REPLY_TEXT_CHANGE
- RULE_NEW_REPLY_LINK_CHANGE
- RULE_NEW_PRIORITY_CHANGE
- RULE_NEW_SAVE
- RULE_NEW_SAVE_AND_GO_LIST
- RULE_NEW_CANCEL

- 클릭 시 UI 변화
- 키워드 태그 추가/삭제
- 저장 클릭 시 success 토스트 후 /rules 또는 /rules/:ruleId 모의 이동
- 필수값 누락 시 에러 표시
- 취소 시 /rules 이동

- 상태 머신
  - initial: 기본값이 채워진 폼
  - loading: 저장 버튼 클릭 시 로딩
  - success: 토스트 후 이동
  - empty: 키워드가 하나도 없을 때 helper empty 상태
  - error: 필수값 누락 또는 유효성 오류 표시

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 새 규칙 만들기                                            |
|                      +-----------------------------------------------------------+
|                      | 기본 정보                                                  |
|                      | 규칙명        [________________________]                   |
|                      | 설명          [________________________]                   |
|                      | 매칭 방식     [contains ▼]                                 |
|                      +-----------------------------------------------------------+
|                      | 트리거 키워드                                              |
|                      | [ 가격 ] [ 비용 ] [ 얼마 ] [+ 키워드 추가]                |
|                      +-----------------------------------------------------------+
|                      | 응답 설정                                                  |
|                      | 응답 텍스트                                                |
|                      | [______________________________________________________]   |
|                      | [______________________________________________________]   |
|                      | 링크 [https://_______________________________]             |
|                      +-----------------------------------------------------------+
|                      | 운영 설정                                                  |
|                      | 활성화 [ON]    우선순위 [100]                              |
|                      +-----------------------------------------------------------+
|                      | [저장] [저장 후 목록으로] [취소]                           |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /rules/:ruleId]

- 목적
기존 규칙을 상세 조회하고 수정한다.

- 진입 조건
규칙 목록 row 클릭 또는 저장 후 이동

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목 + 상태 배지
4. 기본 정보 편집 섹션
5. 키워드 편집 섹션
6. 응답 설정 섹션
7. 최근 매칭 로그 섹션
8. 하단 저장/비활성화/삭제 버튼
9. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.rule.id
- view.rule.name
- view.rule.description
- view.rule.matchType
- view.rule.triggerKeywords[]
- view.rule.replyText
- view.rule.replyLink
- view.rule.isActive
- view.rule.priority
- view.recentMatches[]

- 버튼 목록
1. 저장
2. 비활성화/활성화
3. 삭제
4. 키워드 추가
5. 키워드 삭제
6. 최근 매칭 항목 보기

- 이벤트명
- RULE_DETAIL_SAVE
- RULE_DETAIL_TOGGLE_ACTIVE
- RULE_DETAIL_DELETE
- RULE_DETAIL_ADD_KEYWORD
- RULE_DETAIL_REMOVE_KEYWORD
- RULE_DETAIL_FIELD_CHANGE

- 클릭 시 UI 변화
- 입력값 즉시 로컬 반영
- 저장 시 토스트
- 상태 토글 시 배지 색상 변경
- 삭제 클릭 시 경고 다이얼로그 후 /rules 이동
- 최근 매칭 로그는 접기/펼치기 가능해도 좋음

- 상태 머신
  - initial: 기본 rule 데이터 로드
  - loading: 진입 시 스켈레톤
  - success: 상세 폼 노출
  - empty: 해당 rule 데이터가 없을 때 not found 스타일
  - error: 오류 카드 + 규칙 목록으로 돌아가기 버튼

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 규칙 상세 / 수정                         [활성] [우선순위100]|
|                      +-----------------------------------------------------------+
|                      | 기본 정보                                                  |
|                      | 규칙명     [가격 문의 응답________________]                |
|                      | 설명       [가격 질문시 안내_______________]               |
|                      | 방식       [contains ▼]                                     |
|                      +-----------------------------------------------------------+
|                      | 키워드                                                    |
|                      | [가격] [비용] [얼마] [+ 추가]                              |
|                      +-----------------------------------------------------------+
|                      | 응답 설정                                                  |
|                      | [문의 주셔서 감사합니다...______________________________]   |
|                      | 링크 [https://example.com/price________________________]   |
|                      +-----------------------------------------------------------+
|                      | 최근 매칭 로그                                             |
|                      | 발신자 | 메시지 | 시각                                     |
|                      +-----------------------------------------------------------+
|                      | [저장] [비활성화] [삭제]                                   |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /logs/incoming]

- 목적
들어온 DM 메시지를 운영자가 조회하고 어떤 규칙이 매칭되었는지 확인한다.

- 진입 조건
대시보드 또는 사이드바에서 진입

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목
4. 검색/필터 바
5. 수신 로그 테이블
6. 페이지네이션
7. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.filters.keywordPlaceholder
- view.filters.matchStatusOptions[]
- view.logs[]

- 버튼 목록
1. 검색
2. 매칭 여부 필터
3. row 상세 확인
4. 발송 로그로 이동 버튼
5. 페이지 이동 버튼

- 이벤트명
- INCOMING_SEARCH_CHANGE
- INCOMING_FILTER_MATCH_CHANGE
- INCOMING_ROW_EXPAND
- INCOMING_GO_OUTGOING_LOG
- INCOMING_PAGE_CHANGE

- 클릭 시 UI 변화
- 검색어/필터에 따라 로컬 목록 재계산
- row 클릭 시 하단 상세 패널 또는 accordion 오픈
- 발송 로그 보기 클릭 시 /logs/outgoing 이동

- 상태 머신
  - initial: 진입 직후
  - loading: 테이블 스켈레톤
  - success: 로그 노출
  - empty: 조건에 맞는 수신 로그 없음
  - error: 로그 표시 실패

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 수신 로그                                                  |
|                      | 검색 [____________________]  매칭상태 [전체 ▼]            |
|                      +-----------------------------------------------------------+
|                      | 발신자 | 메시지 | 수신시각 | 매칭여부 | 매칭규칙           |
|                      |-----------------------------------------------------------|
|                      | user_01 | 가격 문의... | 10:21 | 매칭 | 가격 문의 규칙     |
|                      | user_02 | 주소가...    | 10:18 | 미매칭 | -               |
|                      +-----------------------------------------------------------+
|                      | row 클릭 시 상세 내용 펼침                                 |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /logs/outgoing]

- 목적
자동응답 발송 결과를 조회하고 성공/실패 상태를 확인한다.

- 진입 조건
대시보드 또는 사이드바에서 진입

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목
4. 검색/필터 바
5. 발송 로그 테이블
6. 실패 상세 패널
7. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.filters.statusOptions[]
- view.logs[]

- 버튼 목록
1. 상태 필터
2. 검색
3. row 상세 보기
4. 관련 규칙으로 이동
5. 수신 로그로 이동

- 이벤트명
- OUTGOING_SEARCH_CHANGE
- OUTGOING_FILTER_STATUS_CHANGE
- OUTGOING_ROW_EXPAND
- OUTGOING_GO_RULE_DETAIL
- OUTGOING_GO_INCOMING_LOG

- 클릭 시 UI 변화
- 상태 필터 적용
- row 확장 시 실패 사유, 발송 텍스트 미리보기 노출
- 관련 규칙 이동 시 /rules/:ruleId
- 수신 로그로 이동 시 /logs/incoming

- 상태 머신
  - initial: 진입 전
  - loading: 스켈레톤
  - success: 로그 노출
  - empty: 발송 로그 없음
  - error: 오류 카드 표시

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 발송 로그                                                  |
|                      | 검색 [____________________]  상태 [전체 ▼]                |
|                      +-----------------------------------------------------------+
|                      | 수신자 | 규칙명 | 발송상태 | 발송시각 | 액션               |
|                      |-----------------------------------------------------------|
|                      | user_01 | 가격 문의 | 성공 | 10:21 | 상세                 |
|                      | user_02 | 위치 문의 | 실패 | 10:18 | 상세                 |
|                      +-----------------------------------------------------------+
|                      | 상세 펼침: 발송 텍스트 / 실패 사유 / 관련 규칙 버튼        |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────

[Route: /test]

- 목적
운영자가 테스트 문장을 입력하고 어떤 규칙이 매칭되는지 UI 수준에서 검증한다.

- 진입 조건
대시보드 또는 사이드바에서 진입

- 레이아웃 (위→아래)
1. Header
2. Sidebar
3. 페이지 제목 + 설명
4. 테스트 입력 카드
5. 추천 예문 섹션
6. 테스트 결과 카드
7. Footer

- 표시 데이터(JSON 경로)
- page.title
- page.subtitle
- view.defaultInput
- view.suggestedExamples[]
- view.resultPreview.initial
- view.resultPreview.success
- view.resultPreview.empty
- view.resultPreview.error

- 버튼 목록
1. 매칭 테스트 실행
2. 예문 삽입
3. 입력 초기화
4. 매칭된 규칙 보러가기

- 이벤트명
- TEST_INPUT_CHANGE
- TEST_USE_SUGGESTED_EXAMPLE
- TEST_RUN_MATCH
- TEST_RESET
- TEST_GO_RULE_DETAIL

- 클릭 시 UI 변화
- 예문 클릭 시 입력창에 채워짐
- 테스트 실행 시 loading 후 success/empty/error 상태 표시
- 성공 시 매칭 규칙명, 매칭 키워드, 발송 예정 텍스트 노출
- empty 시 “매칭된 규칙이 없습니다” 표시
- error는 강제로 토글 가능한 UI 상태로 제공 가능

- 상태 머신
  - initial: 기본 입력 및 안내만 노출
  - loading: 테스트 실행 중 스켈레톤
  - success: 매칭 결과 카드 노출
  - empty: 미매칭 결과 카드
  - error: 테스트 실패 경고 카드

- ASCII Layout
+----------------------------------------------------------------------------------+
| Header: Instagram DM Admin                                      [Local Mock Run] |
+----------------------+-----------------------------------------------------------+
| Sidebar              | 규칙 테스트                                                |
|                      | 테스트 문장을 넣고 어떤 규칙이 매칭되는지 확인합니다.      |
|                      +-----------------------------------------------------------+
|                      | 테스트 입력                                                 |
|                      | [______________________________________________________]   |
|                      | [매칭 테스트 실행] [초기화]                                |
|                      +-----------------------------------------------------------+
|                      | 추천 예문                                                  |
|                      | [가격이 얼마인가요?] [위치가 어디인가요?] [협업 문의]      |
|                      +-----------------------------------------------------------+
|                      | 테스트 결과                                                |
|                      | 매칭 결과: 가격 문의 규칙                                   |
|                      | 매칭 키워드: 가격                                          |
|                      | 발송 예정 텍스트: 문의 주셔서 감사합니다...                |
|                      | [규칙 상세 보러가기]                                       |
+----------------------+-----------------------------------------------------------+

────────────────────────────────────────────────────────
[핵심 사용자 플로우]
────────────────────────────────────────────────────────

플로우 1. 기본 운영 진입 플로우
"/"
→ DASHBOARD_GO_RULES
→ "/rules"
→ RULES_ROW_CLICK
→ "/rules/:ruleId"

플로우 2. 새 규칙 생성 플로우
"/"
→ DASHBOARD_GO_RULE_NEW
→ "/rules/new"
→ RULE_NEW_ADD_KEYWORD
→ "/rules/new"
→ RULE_NEW_SAVE
→ "/rules"

플로우 3. 규칙 검증 플로우
"/rules"
→ RULES_ROW_CLICK
→ "/rules/:ruleId"
→ RULE_DETAIL_SAVE
→ "/rules/:ruleId"
→ 사이드바 테스트 메뉴 클릭
→ "/test"
→ TEST_RUN_MATCH
→ "/test"

플로우 4. 로그 검토 플로우
"/"
→ DASHBOARD_GO_INCOMING_LOGS
→ "/logs/incoming"
→ INCOMING_GO_OUTGOING_LOG
→ "/logs/outgoing"
→ OUTGOING_GO_RULE_DETAIL
→ "/rules/:ruleId"

────────────────────────────────────────────────────────
[QA 체크리스트]
────────────────────────────────────────────────────────

□ 모든 라우터가 react-router-dom 기준으로 개별 진입 가능하다.
□ BrowserRouter + Routes + Route 구조를 사용한다.
□ 로그인, 회원가입, 권한관리, 보호 라우트가 전혀 없다.
□ 앱 실행 시 바로 "/" 대시보드로 진입한다.
□ 모든 화면이 로컬 JSON 더미 데이터로 렌더링된다.
□ fetch/axios/network 코드는 없다.
□ 각 페이지는 initial / loading / success / empty / error 상태를 가진다.
□ "/", "/rules", "/rules/new", "/rules/:ruleId", "/logs/incoming", "/logs/outgoing", "/test" 가 모두 구현된다.
□ 규칙 목록에서 검색, 필터, 활성 토글 인터랙션이 동작한다.
□ 새 규칙 만들기 폼에서 키워드 추가/삭제가 동작한다.
□ 규칙 상세 화면에서 수정/상태 변경/삭제 모의 인터랙션이 동작한다.
□ 수신 로그와 발송 로그의 row 확장 또는 상세 보기 인터랙션이 동작한다.
□ 테스트 페이지에서 예문 삽입, 테스트 실행, 성공/미매칭 상태 전환이 동작한다.
□ 공통 Header / Sidebar / Footer가 모든 라우트에 일관되게 적용된다.
□ Tailwind 기반의 완성도 높은 관리자 UI로 보인다.
□ shadcn/ui, Framer Motion, Lucide React, Sonner를 적절히 사용한다.
□ 과도한 컴포넌트 추상화 없이 페이지 완결 중심으로 구현한다.
□ 각 라우터는 독립 수정 가능하다.
□ 실제 서비스처럼 보이는 더미 기반 인터랙션이 구현된다.

────────────────────────────────────────────────────────
[구현 지침]
────────────────────────────────────────────────────────

1. React 18 + TypeScript + Vite 프로젝트 기준으로 작성한다.
2. src/main.tsx에서 BrowserRouter로 감싼다.
3. src/App.tsx에서 모든 라우트를 명시적으로 선언한다.
4. 각 페이지는 src/pages/ 아래에 만든다.
5. 모든 더미 데이터는 public/data/routes/*.json 에서 읽어온다.
6. 네트워크 호출은 절대 만들지 않는다.
7. 페이지별로 필요한 상태는 페이지 내부 로컬 state로 처리한다.
8. 인증, Context API, ProtectedRoute는 만들지 않는다.
9. 디자인은 관리자용 SaaS 대시보드 톤으로 간결하고 밀도 있게 구성한다.
10. 컴포넌트 재사용성보다 페이지 완결성과 속도를 우선한다.
11. 하지만 코드가 난잡해지지 않게 최소한의 타입과 분리는 유지한다.
12. mock 데이터에 맞는 TypeScript 타입은 페이지 내부 또는 근처에 선언한다.
13. JSON 값이 없을 때도 empty UI가 보이도록 방어적으로 렌더링한다.
14. Sonner 토스트는 규칙 저장 성공, 상태 변경 등에 사용한다.
15. Framer Motion은 페이지 진입과 일부 카드에만 절제해서 사용한다.
16. 라우트 파라미터 ruleId는 실제 서버 조회 없이 rule-detail.json 또는 rules.json 더미를 기반으로 표시한다.
17. 페이지 전환은 useNavigate 사용한다.
18. URL query가 필요한 경우에도 react-router-dom 훅만 사용한다.
19. Next.js 전용 문법은 절대 사용하지 않는다.
20. 로컬 단독 사용 전제이므로 사용자 계정, 세션, 토큰, 권한과 관련된 UI는 전부 제외한다.

────────────────────────────────────────────────────────
[최종 요청]
────────────────────────────────────────────────────────

위 명세를 바탕으로, 이 프로젝트의 프론트엔드 목업을 완결 수준으로 구현하라.

반드시 아래를 만족하라.
- React 18 + TypeScript + Vite
- React Router DOM v6
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide React
- Sonner
- 로컬 JSON 기반 렌더링
- 완성도 높은 관리자 UI
- 페이지별 상태 전이 완비
- 어떤 로그인/회원가입/권한관리 UI도 생성 금지
- 어떤 백엔드 코드도 생성 금지
- 어떤 API 호출도 생성 금지
- 어떤 데이터베이스 관련 코드도 생성 금지

이 문서를 그대로 입력하면 프론트엔드 목업이 완결 형태로 생성되어야 한다.