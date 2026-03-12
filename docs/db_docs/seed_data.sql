-- ============================================================
-- seed_data.sql
-- Instagram DM Auto Reply Admin — 로컬 개발용 시드 데이터
-- 업종: AI 활용 IT 서비스  |  기간: 최근 30일치
-- ============================================================
-- 실행 전제: schema.sql 이 이미 실행 완료된 상태
-- 실행 순서: schema.sql → seed_data.sql
-- ============================================================

-- ① 스키마 확장 (옵션 B: sender_alias / recipient_alias 컬럼 추가)
-- Instagram ID(추적용) + alias(운영 편의용) 이중 표기를 위해 컬럼 추가
-- ============================================================
ALTER TABLE incoming_messages  ADD COLUMN IF NOT EXISTS sender_alias    varchar(50);
ALTER TABLE outgoing_messages  ADD COLUMN IF NOT EXISTS recipient_alias varchar(50);


-- ② rules (10개: 활성 7 / 비활성 3)
-- ============================================================
-- 비활성 3개(오류·버그, 데이터·보안, 파트너십)는 "초안 작성 후 배포 대기" 시나리오
INSERT INTO rules (id, name, description, match_type, trigger_keywords, reply_text, reply_link, is_active, priority)
VALUES

-- 활성 규칙 7개
('a0000000-0000-0000-0000-000000000001',
 '요금·플랜 문의',
 '요금제, 구독 플랜, 비용 관련 DM',
 'contains',
 ARRAY['가격','요금','얼마','비용','플랜','구독료'],
 '안녕하세요! 저희 AI 서비스 요금 안내드립니다. 베이직 월 9,900원 / 프로 월 29,900원 / 엔터프라이즈 별도 문의. 아래 링크에서 플랜별 상세 비교표를 확인하세요 :)',
 'https://example.ai/pricing', true, 200),

('a0000000-0000-0000-0000-000000000002',
 '무료 체험 문의',
 '무료 플랜, 14일 트라이얼 관련 DM',
 'contains',
 ARRAY['무료','체험','트라이얼','써볼','테스트해보','공짜'],
 '네! 가입 후 14일 무료 체험이 가능합니다. 신용카드 없이도 바로 시작할 수 있어요. 지금 아래 링크로 시작해보세요!',
 'https://example.ai/trial', true, 190),

('a0000000-0000-0000-0000-000000000003',
 '결제·구독 문의',
 '결제 수단 변경, 구독 취소, 청구 관련 DM',
 'contains',
 ARRAY['결제','구독','카드','청구','취소','해지','환불'],
 '결제 관련 문의는 고객센터 링크를 통해 접수해주시면 영업일 기준 24시간 이내 답변드립니다. 감사합니다!',
 'https://example.ai/support/billing', true, 180),

('a0000000-0000-0000-0000-000000000004',
 'API·개발자 문의',
 'API 연동, SDK, 개발자 문서 관련 DM',
 'contains',
 ARRAY['API','연동','개발자','문서','SDK','레퍼런스','엔드포인트'],
 '개발자 문서와 API 레퍼런스는 아래 링크에서 확인하실 수 있습니다. REST API와 Python·Node.js SDK를 모두 지원합니다!',
 'https://docs.example.ai', true, 170),

('a0000000-0000-0000-0000-000000000005',
 '기업·팀 플랜 문의',
 '팀 단위, 기업 도입, 볼륨 라이선스 DM',
 'contains',
 ARRAY['팀','기업','단체','회사','엔터프라이즈','볼륨','단체구매'],
 '기업/팀 플랜은 5인 이상부터 할인이 적용됩니다. 아래 폼에 문의 주시면 담당자가 영업일 기준 1일 이내 연락드립니다!',
 'https://example.ai/enterprise', true, 160),

('a0000000-0000-0000-0000-000000000006',
 '기능 소개 요청',
 '서비스 기능, 할 수 있는 것 관련 DM',
 'contains',
 ARRAY['기능','뭐가','어떤','할 수 있','가능한','제공'],
 '저희 서비스는 AI 기반 콘텐츠 생성, 데이터 분석, 워크플로우 자동화를 제공합니다. 자세한 기능 소개는 아래 링크에서 확인하세요!',
 'https://example.ai/features', true, 150),

('a0000000-0000-0000-0000-000000000007',
 '사용법·튜토리얼',
 '처음 시작하는 법, 튜토리얼, 가이드 DM',
 'contains',
 ARRAY['사용법','어떻게','튜토리얼','가이드','시작','처음'],
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started', true, 140),

-- 비활성 규칙 3개 (초안 / 배포 대기)
('a0000000-0000-0000-0000-000000000008',
 '오류·버그 리포트',
 '오류, 버그, 작동 이상 관련 DM (답변 검토 중)',
 'contains',
 ARRAY['오류','버그','에러','안돼','작동','고장','이상'],
 '불편을 드려 죄송합니다. 오류 내용과 스크린샷을 아래 버그 리포트 폼에 남겨주시면 빠르게 확인하겠습니다.',
 'https://example.ai/support/bug', false, 130),

('a0000000-0000-0000-0000-000000000009',
 '데이터·보안 문의',
 '개인정보 보호, 보안 관련 DM (법무팀 검토 중)',
 'contains',
 ARRAY['보안','개인정보','데이터','안전','암호화','GDPR','정보보호'],
 '저희 서비스는 AES-256 암호화와 SOC2 인증을 준수합니다. 자세한 보안 정책은 아래 링크를 확인해주세요.',
 'https://example.ai/security', false, 120),

('a0000000-0000-0000-0000-000000000010',
 '파트너십·제휴 제안',
 '파트너십, 제휴, 투자 DM (채널 별도 운영 예정)',
 'contains',
 ARRAY['파트너','협업','제휴','콜라보','투자','MOU'],
 '파트너십 제안 감사합니다! 아래 폼을 통해 접수해 주시면 담당팀에서 검토 후 연락드리겠습니다.',
 'https://example.ai/partners', false, 110);


-- ③ incoming_messages (30개: matched 22 / unmatched 8)
-- ============================================================
-- sender 5명
--   user_001 : Instagram ID 17841400100001001  @tech_marketer_kim
--   user_002 : Instagram ID 17841400100002002  @startup_ceo_lee
--   user_003 : Instagram ID 17841400100003003  @dev_park
--   user_004 : Instagram ID 17841400100004004  @pm_choi
--   user_005 : Instagram ID 17841400100005005  @content_creator_jung
-- raw_payload 에 instagram_user_id + alias + username 함께 기록 (DB 조회 시 식별 편의)
-- failed outgoing 3건 대응: i4(결제카드) / i13(구독해지) / i21(엔터프라이즈)

INSERT INTO incoming_messages
  (id, sender_id, sender_alias, message_text, platform_message_id,
   matched_rule_id, match_status, raw_payload, received_at)
VALUES

-- === 최근 3일 (8건: matched 6 / unmatched 2) ===

('b0000000-0000-0000-0000-000000000001',
 '17841400100001001', 'user_001',
 '안녕하세요, 요금제가 어떻게 되나요? 월 구독이면 얼마인가요?',
 'mid.1741900000001:a1b1c1d1e1f10001',
 'a0000000-0000-0000-0000-000000000001', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '1 hour'),

('b0000000-0000-0000-0000-000000000002',
 '17841400100002002', 'user_002',
 '무료로 한번 써볼 수 있나요? 트라이얼 있으면 알려주세요',
 'mid.1741900000002:a2b2c2d2e2f20002',
 'a0000000-0000-0000-0000-000000000002', 'matched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '3 hours'),

('b0000000-0000-0000-0000-000000000003',
 '17841400100003003', 'user_003',
 'API 문서나 SDK 링크 주실 수 있나요? 개발자 레퍼런스 찾고 있어요',
 'mid.1741900000003:a3b3c3d3e3f30003',
 'a0000000-0000-0000-0000-000000000004', 'matched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '5 hours'),

('b0000000-0000-0000-0000-000000000004',
 '17841400100001001', 'user_001',
 '결제 카드를 바꾸고 싶어요, 어떻게 변경하나요?',
 'mid.1741900000004:a4b4c4d4e4f40004',
 'a0000000-0000-0000-0000-000000000003', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '1 day'),

('b0000000-0000-0000-0000-000000000005',
 '17841400100004004', 'user_004',
 '저희 팀 10명이서 단체로 사용하고 싶은데 기업 플랜이 있나요?',
 'mid.1741900000005:a5b5c5d5e5f50005',
 'a0000000-0000-0000-0000-000000000005', 'matched',
 '{"instagram_user_id":"17841400100004004","alias":"user_004","username":"@pm_choi"}',
 NOW() - INTERVAL '1 day 3 hours'),

('b0000000-0000-0000-0000-000000000006',
 '17841400100002002', 'user_002',
 '기능이 어떤 게 있어요? 어떤 걸 할 수 있는지 궁금해요',
 'mid.1741900000006:a6b6c6d6e6f60006',
 'a0000000-0000-0000-0000-000000000006', 'matched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '2 days'),

-- unmatched 2건 (최근)
('b0000000-0000-0000-0000-000000000007',
 '17841400100005005', 'user_005',
 '안녕하세요! 피드 보다가 들어왔어요. 서비스 좋아 보여요',
 'mid.1741900000007:a7b7c7d7e7f70007',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100005005","alias":"user_005","username":"@content_creator_jung"}',
 NOW() - INTERVAL '2 days 4 hours'),

('b0000000-0000-0000-0000-000000000008',
 '17841400100003003', 'user_003',
 '다른 AI 서비스들과 비교했을 때 차별점이 뭔가요?',
 'mid.1741900000008:a8b8c8d8e8f80008',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '2 days 6 hours'),

-- === 4~10일 전 (10건: matched 8 / unmatched 2) ===

('b0000000-0000-0000-0000-000000000009',
 '17841400100001001', 'user_001',
 '사용법을 모르겠어요, 처음 시작하는 가이드가 있나요?',
 'mid.1741900000009:a9b9c9d9e9f90009',
 'a0000000-0000-0000-0000-000000000007', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '4 days'),

('b0000000-0000-0000-0000-000000000010',
 '17841400100004004', 'user_004',
 '어떻게 시작하면 되나요? 처음인데 가이드 링크 주실 수 있어요?',
 'mid.1741900000010:a0b0c0d0e0f00010',
 'a0000000-0000-0000-0000-000000000007', 'matched',
 '{"instagram_user_id":"17841400100004004","alias":"user_004","username":"@pm_choi"}',
 NOW() - INTERVAL '4 days 2 hours'),

('b0000000-0000-0000-0000-000000000011',
 '17841400100002002', 'user_002',
 '요금이 한달에 얼마예요? 프로 플랜 가격이 궁금해요',
 'mid.1741900000011:a1b1c1d1e1f10011',
 'a0000000-0000-0000-0000-000000000001', 'matched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '5 days'),

('b0000000-0000-0000-0000-000000000012',
 '17841400100003003', 'user_003',
 '무료 플랜도 있나요? 개인적으로 써보고 싶어요',
 'mid.1741900000012:a2b2c2d2e2f20012',
 'a0000000-0000-0000-0000-000000000002', 'matched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '5 days 4 hours'),

('b0000000-0000-0000-0000-000000000013',
 '17841400100005005', 'user_005',
 '결제 취소하고 싶어요. 구독 해지하는 방법 알려주세요',
 'mid.1741900000013:a3b3c3d3e3f30013',
 'a0000000-0000-0000-0000-000000000003', 'matched',
 '{"instagram_user_id":"17841400100005005","alias":"user_005","username":"@content_creator_jung"}',
 NOW() - INTERVAL '6 days'),

('b0000000-0000-0000-0000-000000000014',
 '17841400100001001', 'user_001',
 'Python SDK가 있나요? Node.js도 지원하나요?',
 'mid.1741900000014:a4b4c4d4e4f40014',
 'a0000000-0000-0000-0000-000000000004', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '7 days'),

-- unmatched 1건
('b0000000-0000-0000-0000-000000000015',
 '17841400100002002', 'user_002',
 '디자인이 너무 예쁘네요! 누가 만들었어요?',
 'mid.1741900000015:a5b5c5d5e5f50015',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '7 days 5 hours'),

('b0000000-0000-0000-0000-000000000016',
 '17841400100003003', 'user_003',
 '기업용 플랜 비용 문의드립니다. 회사에서 도입 검토 중이에요',
 'mid.1741900000016:a6b6c6d6e6f60016',
 'a0000000-0000-0000-0000-000000000005', 'matched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '8 days'),

('b0000000-0000-0000-0000-000000000017',
 '17841400100004004', 'user_004',
 '월 요금제랑 연 요금제 비교해서 알려주실 수 있나요?',
 'mid.1741900000017:a7b7c7d7e7f70017',
 'a0000000-0000-0000-0000-000000000001', 'matched',
 '{"instagram_user_id":"17841400100004004","alias":"user_004","username":"@pm_choi"}',
 NOW() - INTERVAL '9 days'),

-- unmatched 1건
('b0000000-0000-0000-0000-000000000018',
 '17841400100005005', 'user_005',
 '다국어 지원 되나요? 영어로도 쓸 수 있나요?',
 'mid.1741900000018:a8b8c8d8e8f80018',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100005005","alias":"user_005","username":"@content_creator_jung"}',
 NOW() - INTERVAL '10 days'),

-- === 11~20일 전 (8건: matched 6 / unmatched 2) ===

('b0000000-0000-0000-0000-000000000019',
 '17841400100001001', 'user_001',
 '튜토리얼 영상 있나요? 유튜브 영상 있으면 링크 주세요',
 'mid.1741900000019:a9b9c9d9e9f90019',
 'a0000000-0000-0000-0000-000000000007', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '11 days'),

('b0000000-0000-0000-0000-000000000020',
 '17841400100002002', 'user_002',
 '가이드 문서 링크 주세요! 처음 시작하는 방법 알고 싶어요',
 'mid.1741900000020:a0b0c0d0e0f00020',
 'a0000000-0000-0000-0000-000000000007', 'matched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '12 days'),

('b0000000-0000-0000-0000-000000000021',
 '17841400100003003', 'user_003',
 '엔터프라이즈 플랜 문의드립니다. 50인 규모 기업인데 볼륨 할인 가능한가요?',
 'mid.1741900000021:a1b1c1d1e1f10021',
 'a0000000-0000-0000-0000-000000000005', 'matched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '14 days'),

('b0000000-0000-0000-0000-000000000022',
 '17841400100004004', 'user_004',
 'Python SDK 연동 예제 코드 있나요? 개발자 문서 링크 주세요',
 'mid.1741900000022:a2b2c2d2e2f20022',
 'a0000000-0000-0000-0000-000000000004', 'matched',
 '{"instagram_user_id":"17841400100004004","alias":"user_004","username":"@pm_choi"}',
 NOW() - INTERVAL '15 days'),

('b0000000-0000-0000-0000-000000000023',
 '17841400100005005', 'user_005',
 '처음인데 어떻게 시작하나요? 간단히 설명해 주실 수 있어요?',
 'mid.1741900000023:a3b3c3d3e3f30023',
 'a0000000-0000-0000-0000-000000000007', 'matched',
 '{"instagram_user_id":"17841400100005005","alias":"user_005","username":"@content_creator_jung"}',
 NOW() - INTERVAL '16 days'),

('b0000000-0000-0000-0000-000000000024',
 '17841400100001001', 'user_001',
 '가격표 보내주세요! 어떤 플랜이 있는지 비용이 궁금해요',
 'mid.1741900000024:a4b4c4d4e4f40024',
 'a0000000-0000-0000-0000-000000000001', 'matched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '17 days'),

-- unmatched 2건
('b0000000-0000-0000-0000-000000000025',
 '17841400100002002', 'user_002',
 '혹시 할인 이벤트나 쿠폰 같은 게 있나요?',
 'mid.1741900000025:a5b5c5d5e5f50025',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '18 days'),

('b0000000-0000-0000-0000-000000000026',
 '17841400100003003', 'user_003',
 '서비스 정말 좋아 보여요. 좋은 서비스 만들어 주셔서 감사해요!',
 'mid.1741900000026:a6b6c6d6e6f60026',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100003003","alias":"user_003","username":"@dev_park"}',
 NOW() - INTERVAL '20 days'),

-- === 21~30일 전 (4건: matched 2 / unmatched 2) ===

('b0000000-0000-0000-0000-000000000027',
 '17841400100004004', 'user_004',
 '어떤 기능이 제공되나요? 할 수 있는 게 뭔지 알고 싶어요',
 'mid.1741900000027:a7b7c7d7e7f70027',
 'a0000000-0000-0000-0000-000000000006', 'matched',
 '{"instagram_user_id":"17841400100004004","alias":"user_004","username":"@pm_choi"}',
 NOW() - INTERVAL '22 days'),

('b0000000-0000-0000-0000-000000000028',
 '17841400100005005', 'user_005',
 '무료 체험 어떻게 하나요? 써보고 싶은데 방법을 모르겠어요',
 'mid.1741900000028:a8b8c8d8e8f80028',
 'a0000000-0000-0000-0000-000000000002', 'matched',
 '{"instagram_user_id":"17841400100005005","alias":"user_005","username":"@content_creator_jung"}',
 NOW() - INTERVAL '25 days'),

-- unmatched 2건 (한달 전)
('b0000000-0000-0000-0000-000000000029',
 '17841400100001001', 'user_001',
 '한국어 외에 영어나 일본어도 지원 예정인가요?',
 'mid.1741900000029:a9b9c9d9e9f90029',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100001001","alias":"user_001","username":"@tech_marketer_kim"}',
 NOW() - INTERVAL '27 days'),

('b0000000-0000-0000-0000-000000000030',
 '17841400100002002', 'user_002',
 '팔로우하고 있었는데 드디어 DM 보내요! 혹시 오픈소스인가요?',
 'mid.1741900000030:a0b0c0d0e0f00030',
 NULL, 'unmatched',
 '{"instagram_user_id":"17841400100002002","alias":"user_002","username":"@startup_ceo_lee"}',
 NOW() - INTERVAL '30 days');


-- ④ outgoing_messages (22개: success 19 / failed 3)
-- ============================================================
-- matched incoming 22건 각각에 1:1 대응
-- failed 3건:
--   o4  ← i4  : Meta API rate limit (#4)
--   o11 ← i13 : OAuth token 만료 (#190)
--   o17 ← i21 : Invalid recipient (#100)

INSERT INTO outgoing_messages
  (id, incoming_log_id, recipient_id, recipient_alias, matched_rule_id,
   sent_text, sent_link, send_status, error_message, meta_response_payload, sent_at)
VALUES

-- o1: i1 → rule1, success
('c0000000-0000-0000-0000-000000000001',
 'b0000000-0000-0000-0000-000000000001',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000001',
 '안녕하세요! 저희 AI 서비스 요금 안내드립니다. 베이직 월 9,900원 / 프로 월 29,900원 / 엔터프라이즈 별도 문의. 아래 링크에서 플랜별 상세 비교표를 확인하세요 :)',
 'https://example.ai/pricing',
 'success', NULL,
 '{"message_id":"wamid.o001aa","recipient_id":"17841400100001001","messaging_product":"instagram"}',
 NOW() - INTERVAL '1 hour' + INTERVAL '20 seconds'),

-- o2: i2 → rule2, success
('c0000000-0000-0000-0000-000000000002',
 'b0000000-0000-0000-0000-000000000002',
 '17841400100002002', 'user_002',
 'a0000000-0000-0000-0000-000000000002',
 '네! 가입 후 14일 무료 체험이 가능합니다. 신용카드 없이도 바로 시작할 수 있어요. 지금 아래 링크로 시작해보세요!',
 'https://example.ai/trial',
 'success', NULL,
 '{"message_id":"wamid.o002bb","recipient_id":"17841400100002002","messaging_product":"instagram"}',
 NOW() - INTERVAL '3 hours' + INTERVAL '15 seconds'),

-- o3: i3 → rule4, success
('c0000000-0000-0000-0000-000000000003',
 'b0000000-0000-0000-0000-000000000003',
 '17841400100003003', 'user_003',
 'a0000000-0000-0000-0000-000000000004',
 '개발자 문서와 API 레퍼런스는 아래 링크에서 확인하실 수 있습니다. REST API와 Python·Node.js SDK를 모두 지원합니다!',
 'https://docs.example.ai',
 'success', NULL,
 '{"message_id":"wamid.o003cc","recipient_id":"17841400100003003","messaging_product":"instagram"}',
 NOW() - INTERVAL '5 hours' + INTERVAL '25 seconds'),

-- o4: i4 → rule3, FAILED (rate limit)
('c0000000-0000-0000-0000-000000000004',
 'b0000000-0000-0000-0000-000000000004',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000003',
 '결제 관련 문의는 고객센터 링크를 통해 접수해주시면 영업일 기준 24시간 이내 답변드립니다. 감사합니다!',
 'https://example.ai/support/billing',
 'failed',
 'Meta API Error: (#4) Application request limit reached. Retry after 3600 seconds.',
 '{"error":{"message":"Application request limit reached","type":"OAuthException","code":4}}',
 NOW() - INTERVAL '1 day' + INTERVAL '5 seconds'),

-- o5: i5 → rule5, success
('c0000000-0000-0000-0000-000000000005',
 'b0000000-0000-0000-0000-000000000005',
 '17841400100004004', 'user_004',
 'a0000000-0000-0000-0000-000000000005',
 '기업/팀 플랜은 5인 이상부터 할인이 적용됩니다. 아래 폼에 문의 주시면 담당자가 영업일 기준 1일 이내 연락드립니다!',
 'https://example.ai/enterprise',
 'success', NULL,
 '{"message_id":"wamid.o005ee","recipient_id":"17841400100004004","messaging_product":"instagram"}',
 NOW() - INTERVAL '1 day 3 hours' + INTERVAL '30 seconds'),

-- o6: i6 → rule6, success
('c0000000-0000-0000-0000-000000000006',
 'b0000000-0000-0000-0000-000000000006',
 '17841400100002002', 'user_002',
 'a0000000-0000-0000-0000-000000000006',
 '저희 서비스는 AI 기반 콘텐츠 생성, 데이터 분석, 워크플로우 자동화를 제공합니다. 자세한 기능 소개는 아래 링크에서 확인하세요!',
 'https://example.ai/features',
 'success', NULL,
 '{"message_id":"wamid.o006ff","recipient_id":"17841400100002002","messaging_product":"instagram"}',
 NOW() - INTERVAL '2 days' + INTERVAL '18 seconds'),

-- o7: i9 → rule7, success
('c0000000-0000-0000-0000-000000000007',
 'b0000000-0000-0000-0000-000000000009',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000007',
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started',
 'success', NULL,
 '{"message_id":"wamid.o007gg","recipient_id":"17841400100001001","messaging_product":"instagram"}',
 NOW() - INTERVAL '4 days' + INTERVAL '22 seconds'),

-- o8: i10 → rule7, success
('c0000000-0000-0000-0000-000000000008',
 'b0000000-0000-0000-0000-000000000010',
 '17841400100004004', 'user_004',
 'a0000000-0000-0000-0000-000000000007',
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started',
 'success', NULL,
 '{"message_id":"wamid.o008hh","recipient_id":"17841400100004004","messaging_product":"instagram"}',
 NOW() - INTERVAL '4 days 2 hours' + INTERVAL '12 seconds'),

-- o9: i11 → rule1, success
('c0000000-0000-0000-0000-000000000009',
 'b0000000-0000-0000-0000-000000000011',
 '17841400100002002', 'user_002',
 'a0000000-0000-0000-0000-000000000001',
 '안녕하세요! 저희 AI 서비스 요금 안내드립니다. 베이직 월 9,900원 / 프로 월 29,900원 / 엔터프라이즈 별도 문의. 아래 링크에서 플랜별 상세 비교표를 확인하세요 :)',
 'https://example.ai/pricing',
 'success', NULL,
 '{"message_id":"wamid.o009ii","recipient_id":"17841400100002002","messaging_product":"instagram"}',
 NOW() - INTERVAL '5 days' + INTERVAL '35 seconds'),

-- o10: i12 → rule2, success
('c0000000-0000-0000-0000-000000000010',
 'b0000000-0000-0000-0000-000000000012',
 '17841400100003003', 'user_003',
 'a0000000-0000-0000-0000-000000000002',
 '네! 가입 후 14일 무료 체험이 가능합니다. 신용카드 없이도 바로 시작할 수 있어요. 지금 아래 링크로 시작해보세요!',
 'https://example.ai/trial',
 'success', NULL,
 '{"message_id":"wamid.o010jj","recipient_id":"17841400100003003","messaging_product":"instagram"}',
 NOW() - INTERVAL '5 days 4 hours' + INTERVAL '28 seconds'),

-- o11: i13 → rule3, FAILED (OAuth token 만료)
('c0000000-0000-0000-0000-000000000011',
 'b0000000-0000-0000-0000-000000000013',
 '17841400100005005', 'user_005',
 'a0000000-0000-0000-0000-000000000003',
 '결제 관련 문의는 고객센터 링크를 통해 접수해주시면 영업일 기준 24시간 이내 답변드립니다. 감사합니다!',
 'https://example.ai/support/billing',
 'failed',
 'Meta API Error: Invalid OAuth access token. The token may have expired or been revoked.',
 '{"error":{"message":"Invalid OAuth access token","type":"OAuthException","code":190}}',
 NOW() - INTERVAL '6 days' + INTERVAL '6 seconds'),

-- o12: i14 → rule4, success
('c0000000-0000-0000-0000-000000000012',
 'b0000000-0000-0000-0000-000000000014',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000004',
 '개발자 문서와 API 레퍼런스는 아래 링크에서 확인하실 수 있습니다. REST API와 Python·Node.js SDK를 모두 지원합니다!',
 'https://docs.example.ai',
 'success', NULL,
 '{"message_id":"wamid.o012ll","recipient_id":"17841400100001001","messaging_product":"instagram"}',
 NOW() - INTERVAL '7 days' + INTERVAL '40 seconds'),

-- o13: i16 → rule5, success
('c0000000-0000-0000-0000-000000000013',
 'b0000000-0000-0000-0000-000000000016',
 '17841400100003003', 'user_003',
 'a0000000-0000-0000-0000-000000000005',
 '기업/팀 플랜은 5인 이상부터 할인이 적용됩니다. 아래 폼에 문의 주시면 담당자가 영업일 기준 1일 이내 연락드립니다!',
 'https://example.ai/enterprise',
 'success', NULL,
 '{"message_id":"wamid.o013mm","recipient_id":"17841400100003003","messaging_product":"instagram"}',
 NOW() - INTERVAL '8 days' + INTERVAL '17 seconds'),

-- o14: i17 → rule1, success
('c0000000-0000-0000-0000-000000000014',
 'b0000000-0000-0000-0000-000000000017',
 '17841400100004004', 'user_004',
 'a0000000-0000-0000-0000-000000000001',
 '안녕하세요! 저희 AI 서비스 요금 안내드립니다. 베이직 월 9,900원 / 프로 월 29,900원 / 엔터프라이즈 별도 문의. 아래 링크에서 플랜별 상세 비교표를 확인하세요 :)',
 'https://example.ai/pricing',
 'success', NULL,
 '{"message_id":"wamid.o014nn","recipient_id":"17841400100004004","messaging_product":"instagram"}',
 NOW() - INTERVAL '9 days' + INTERVAL '50 seconds'),

-- o15: i19 → rule7, success
('c0000000-0000-0000-0000-000000000015',
 'b0000000-0000-0000-0000-000000000019',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000007',
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started',
 'success', NULL,
 '{"message_id":"wamid.o015oo","recipient_id":"17841400100001001","messaging_product":"instagram"}',
 NOW() - INTERVAL '11 days' + INTERVAL '33 seconds'),

-- o16: i20 → rule7, success
('c0000000-0000-0000-0000-000000000016',
 'b0000000-0000-0000-0000-000000000020',
 '17841400100002002', 'user_002',
 'a0000000-0000-0000-0000-000000000007',
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started',
 'success', NULL,
 '{"message_id":"wamid.o016pp","recipient_id":"17841400100002002","messaging_product":"instagram"}',
 NOW() - INTERVAL '12 days' + INTERVAL '19 seconds'),

-- o17: i21 → rule5, FAILED (invalid recipient)
('c0000000-0000-0000-0000-000000000017',
 'b0000000-0000-0000-0000-000000000021',
 '17841400100003003', 'user_003',
 'a0000000-0000-0000-0000-000000000005',
 '기업/팀 플랜은 5인 이상부터 할인이 적용됩니다. 아래 폼에 문의 주시면 담당자가 영업일 기준 1일 이내 연락드립니다!',
 'https://example.ai/enterprise',
 'failed',
 'Meta API Error: (#100) Invalid parameter. The recipient ID is not valid or the user has restricted messaging.',
 '{"error":{"message":"Invalid parameter","type":"OAuthException","code":100,"error_subcode":2018109}}',
 NOW() - INTERVAL '14 days' + INTERVAL '8 seconds'),

-- o18: i22 → rule4, success
('c0000000-0000-0000-0000-000000000018',
 'b0000000-0000-0000-0000-000000000022',
 '17841400100004004', 'user_004',
 'a0000000-0000-0000-0000-000000000004',
 '개발자 문서와 API 레퍼런스는 아래 링크에서 확인하실 수 있습니다. REST API와 Python·Node.js SDK를 모두 지원합니다!',
 'https://docs.example.ai',
 'success', NULL,
 '{"message_id":"wamid.o018rr","recipient_id":"17841400100004004","messaging_product":"instagram"}',
 NOW() - INTERVAL '15 days' + INTERVAL '44 seconds'),

-- o19: i23 → rule7, success
('c0000000-0000-0000-0000-000000000019',
 'b0000000-0000-0000-0000-000000000023',
 '17841400100005005', 'user_005',
 'a0000000-0000-0000-0000-000000000007',
 '처음 사용하시는 분을 위한 시작 가이드를 준비했습니다! 영상 튜토리얼과 단계별 문서를 아래 링크에서 확인하세요.',
 'https://example.ai/getting-started',
 'success', NULL,
 '{"message_id":"wamid.o019ss","recipient_id":"17841400100005005","messaging_product":"instagram"}',
 NOW() - INTERVAL '16 days' + INTERVAL '27 seconds'),

-- o20: i24 → rule1, success
('c0000000-0000-0000-0000-000000000020',
 'b0000000-0000-0000-0000-000000000024',
 '17841400100001001', 'user_001',
 'a0000000-0000-0000-0000-000000000001',
 '안녕하세요! 저희 AI 서비스 요금 안내드립니다. 베이직 월 9,900원 / 프로 월 29,900원 / 엔터프라이즈 별도 문의. 아래 링크에서 플랜별 상세 비교표를 확인하세요 :)',
 'https://example.ai/pricing',
 'success', NULL,
 '{"message_id":"wamid.o020tt","recipient_id":"17841400100001001","messaging_product":"instagram"}',
 NOW() - INTERVAL '17 days' + INTERVAL '16 seconds'),

-- o21: i27 → rule6, success
('c0000000-0000-0000-0000-000000000021',
 'b0000000-0000-0000-0000-000000000027',
 '17841400100004004', 'user_004',
 'a0000000-0000-0000-0000-000000000006',
 '저희 서비스는 AI 기반 콘텐츠 생성, 데이터 분석, 워크플로우 자동화를 제공합니다. 자세한 기능 소개는 아래 링크에서 확인하세요!',
 'https://example.ai/features',
 'success', NULL,
 '{"message_id":"wamid.o021uu","recipient_id":"17841400100004004","messaging_product":"instagram"}',
 NOW() - INTERVAL '22 days' + INTERVAL '38 seconds'),

-- o22: i28 → rule2, success
('c0000000-0000-0000-0000-000000000022',
 'b0000000-0000-0000-0000-000000000028',
 '17841400100005005', 'user_005',
 'a0000000-0000-0000-0000-000000000002',
 '네! 가입 후 14일 무료 체험이 가능합니다. 신용카드 없이도 바로 시작할 수 있어요. 지금 아래 링크로 시작해보세요!',
 'https://example.ai/trial',
 'success', NULL,
 '{"message_id":"wamid.o022vv","recipient_id":"17841400100005005","messaging_product":"instagram"}',
 NOW() - INTERVAL '25 days' + INTERVAL '21 seconds');
