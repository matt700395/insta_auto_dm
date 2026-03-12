# PRD
## 프로젝트명
Instagram DM Auto Reply Admin

---

# 1. 문서 목적

이 문서는 Instagram DM 자동응답 운영 서비스를 구축하기 위한 제품 요구사항 문서입니다.

초기 버전은 아래 아키텍처를 전제로 합니다.

- 로컬 React 관리자 페이지
- Supabase Database
- Supabase Edge Functions
- Meta Instagram Messaging API

---

# 2. 제품 한 줄 정의

Instagram DM에 들어오는 문의를 자동으로 감지하고  
사전에 등록한 규칙에 따라 자동 답변을 보내며  
운영자가 규칙·로그·테스트를 관리할 수 있는 **단독 운영형 관리자 서비스**

---

# 3. 문제 정의

Instagram DM으로 반복 문의가 들어올 때 운영자는 아래 문제를 겪습니다.

1. 같은 질문에 같은 답변을 반복해서 수동으로 보내야 합니다.
2. 문의 유형이 많아질수록 응답 누락과 응답 속도 저하가 발생합니다.
3. 어떤 문구에 어떤 자동응답이 나갔는지 추적하기 어렵습니다.
4. 새 트리거 문구나 답변 내용을 실험할 수 있는 운영 화면이 없습니다.
5. 외주 CRM 없이도 혼자 빠르게 돌릴 수 있는 운영 구조가 필요합니다.

즉 이 서비스의 핵심 문제는

**DM 응답 자동화 운영 시스템의 부재**입니다.

---

# 4. 제품 목표

## 4.1 1차 목표

- Instagram DM 수신 시 자동응답 전송
- 운영자가 규칙을 직접 관리
- 메시지와 규칙 매칭 로그 확인
- 테스트 문장으로 규칙 검증 가능

## 4.2 2차 목표

- 규칙 우선순위 제어
- 미매칭 메시지 기반 규칙 보완
- 발송 실패 추적

## 4.3 비목표

- 팀 협업
- 사용자 권한 관리
- SaaS 서비스
- 모바일 앱
- AI 기반 의미 분석 자동응답

---

# 5. 서비스 범위

## 포함

- 로컬 React 관리자 페이지
- Supabase Database
- Supabase Edge Function
- Meta Webhook 연동
- 규칙 CRUD
- 로그 조회
- 테스트 매칭 기능

## 제외

- 로그인
- 회원가입
- 사용자 권한
- 결제
- CRM 기능
- 멀티 채널
- AI 자동 응답

---

# 6. 핵심 사용자

Primary User

운영자 1명

특징

- 로컬 React 실행
- 혼자 사용
- 빠른 규칙 수정 필요
- 복잡한 권한 구조 불필요

Secondary User

없음

초기 버전은 **Single Operator Tool**

---

# 7. 사용자 JTBD

운영자로서

- 반복 문의에 자동 답변이 나가게 만들고 싶다
- 특정 문구에 특정 답변이 나가도록 설계하고 싶다
- 실제 발송 전에 테스트 문장으로 검증하고 싶다
- 어떤 메시지에 어떤 규칙이 적용됐는지 확인하고 싶다
- 실패 로그를 보고 규칙을 개선하고 싶다

---

# 8. 서비스 동작 구조

```
[Instagram 사용자가 DM 보냄]
        ↓
[Meta Webhook]
        ↓
[Supabase Edge Function]
        ↓
[Supabase DB에서 트리거 규칙 조회]
        ↓
[조건 매칭]
        ↓
[Meta Send API로 답장]
        ↓
[발송 로그 저장]

[React 관리자 페이지]

- 트리거 문구 등록
- 답변 텍스트 등록
- 링크 등록
- 활성/비활성 설정
- 우선순위 설정
- 발송 로그 확인
- 테스트 문장 매칭 확인
```

---

# 9. 제품 원칙

## 9.1 Local-first

React 관리자 페이지는 로컬 실행

외부 SaaS 아님

---

## 9.2 Single User

로그인 없음  
권한 없음

---

## 9.3 Rule-first Architecture

핵심 엔진은

**규칙 테이블**

---

## 9.4 Log-first Operation

운영에서 중요한 것

- 어떤 메시지가 왔는가
- 어떤 규칙이 매칭됐는가
- 어떤 답변이 발송됐는가
- 실패 원인은 무엇인가

---

## 9.5 Serverless Backend

Supabase Edge Function이 서버 역할

---

# 10. 관리자 페이지 정보구조

```
/
dashboard

/rules
규칙 목록

/rules/new
새 규칙 생성

/rules/:ruleId
규칙 상세

/logs/incoming
수신 로그

/logs/outgoing
발송 로그

/test
테스트 매칭

/settings/meta
Meta 연동 상태

/settings/system
시스템 설정
```

로그인 페이지 없음

---

# 11. 핵심 기능 요구사항

---

# 11.1 규칙 관리

운영자는 자동응답 규칙을 관리할 수 있어야 한다.

## 필수 항목

- 규칙명
- 설명
- 매칭 방식
- 트리거 문구 배열
- 응답 텍스트
- 링크
- 활성 여부
- 우선순위
- 생성일
- 수정일

---

## 매칭 방식

지원

contains  
exact

후순위

regex  
semantic match

---

# 11.2 수신 로그

조회 항목

- 발신자
- 메시지 원문
- 수신 시간
- 매칭 여부
- 매칭 규칙
- webhook event id
- raw payload

목적

- 문의 유형 분석
- 규칙 개선

---

# 11.3 발송 로그

조회 항목

- 수신자
- 적용 규칙
- 발송 텍스트
- 링크
- 발송 상태
- 실패 사유
- 발송 시간
- meta response id

---

# 11.4 테스트 매칭

입력

임의 문장

출력

- 매칭 여부
- 매칭 규칙
- 매칭 키워드
- 발송 예정 텍스트
- 링크
- 우선순위 결과

목적

규칙 검증

---

# 11.5 Meta 연동 상태

관리자가 확인 가능한 항목

- webhook 상태
- verify token 설정
- access token 존재 여부
- 최근 webhook 수신 시간
- 최근 발송 성공
- 최근 발송 실패

---

# 11.6 시스템 설정

초기 설정

- fallback reply
- dedupe window
- log page size
- default sort
- test mode

---

# 12. 관리자 페이지 상세

---

# 12.1 대시보드

표시

- 총 규칙 수
- 활성 규칙
- 오늘 수신 메시지
- 오늘 발송 성공
- 최근 수신 메시지
- 최근 실패 로그

---

# 12.2 규칙 목록

표시

- 규칙명
- 매칭 방식
- 키워드 수
- 응답 요약
- 활성 상태
- 우선순위
- 수정일

기능

- 검색
- 필터
- 상태 토글
- 상세 이동

---

# 12.3 새 규칙 생성

입력

- 규칙명
- 설명
- 매칭 방식
- 키워드
- 응답 텍스트
- 링크
- 활성 여부
- 우선순위

유효성

- 규칙명 필수
- 키워드 최소 1개
- 응답 텍스트 필수

---

# 12.4 규칙 상세

기능

- 수정
- 활성/비활성
- 삭제
- 최근 매칭 로그

---

# 12.5 수신 로그

기능

- 검색
- 매칭 필터
- 메시지 상세
- 발송 로그 이동

---

# 12.6 발송 로그

기능

- 상태 필터
- 규칙 이동
- 실패 사유 확인

---

# 12.7 테스트

기능

- 테스트 문장 입력
- 예문 삽입
- 매칭 결과 확인

---

# 13. 시스템 동작 요구사항

---

## webhook 수신

Meta → Supabase Edge Function

---

## 규칙 조회

Edge Function

active rule 조회

---

## 매칭

로직

1. active rule 조회
2. priority sort
3. 첫 rule 매칭

---

## 응답 발송

Meta Send API

---

## 로그 저장

Outgoing log 저장

---

## 중복 방지

중복 메시지 dedupe

---

# 14. 데이터 요구사항

---

## Rule

- id
- name
- description
- match_type
- trigger_keywords
- reply_text
- reply_link
- is_active
- priority
- created_at
- updated_at

---

## Incoming Message

- id
- sender_id
- message_text
- platform_message_id
- matched_rule_id
- match_status
- raw_payload
- received_at

---

## Outgoing Message

- id
- incoming_log_id
- recipient_id
- matched_rule_id
- sent_text
- sent_link
- send_status
- error_message
- meta_response_payload
- sent_at

---

## Integration Settings

- id
- fallback_reply
- dedupe_window
- test_mode
- updated_at

---

# 15. 성공 지표

운영 KPI

- 규칙 수
- 활성 규칙 수
- 하루 수신 메시지
- 자동응답 성공
- 성공률
- 미매칭 비율
- 실패율

---

# 16. 비기능 요구사항

성능

- 로컬 React 즉시 반응
- 로그 조회 빠름
- 테스트 매칭 즉시 결과

단순성

- 로그인 없음
- 멀티유저 없음

보안

- service role key 프론트 사용 금지

---

# 17. 리스크

1. Meta 설정 난이도
2. 중복 발송
3. 규칙 충돌
4. 미매칭 증가
5. 토큰 관리

---

# 18. 개발 단계

## Phase 1

React 관리자 UI

## Phase 2

Supabase DB 연결

## Phase 3

Edge Function

- webhook
- rule match
- send API
- log

## Phase 4

Meta 실제 연동

---

# 19. MVP 완료 정의

MVP 완료 조건

1. React에서 규칙 생성
2. DB 저장
3. webhook 수신
4. 규칙 매칭
5. 자동응답 발송
6. 로그 저장
7. 로그 조회
8. 테스트 매칭 가능

---

# 20. 최종 구조

```
React (local admin)
        │
        │
Supabase Database
        │
        │
Supabase Edge Function
        │
        │
Meta Webhook
        │
        │
Instagram DM
```

서비스 정의

**로컬 운영 콘솔 + Supabase 기반 DM 자동응답 엔진**