-- =============================================================================
-- Instagram DM Auto Reply Admin — Supabase 초기 스키마
-- =============================================================================
-- ERD.md 기반. Supabase SQL Editor에서 실행용.
-- 실행: 전체 선택 후 Run 또는 Cmd/Ctrl + Enter
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. rules (자동응답 규칙)
-- -----------------------------------------------------------------------------
CREATE TABLE rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  description text,
  match_type varchar(20) NOT NULL CHECK (match_type IN ('contains', 'exact')),
  trigger_keywords text[] NOT NULL,
  reply_text text NOT NULL,
  reply_link varchar(2048),
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT trigger_keywords_not_empty CHECK (array_length(trigger_keywords, 1) >= 1)
);

CREATE INDEX idx_rules_is_active_priority ON rules (is_active, priority DESC);

-- -----------------------------------------------------------------------------
-- 2. incoming_messages (수신 메시지 로그)
-- -----------------------------------------------------------------------------
CREATE TABLE incoming_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id varchar(100) NOT NULL,
  message_text text NOT NULL,
  platform_message_id varchar(255) UNIQUE,
  matched_rule_id uuid REFERENCES rules(id) ON DELETE SET NULL,
  match_status varchar(20) NOT NULL CHECK (match_status IN ('matched', 'unmatched')),
  raw_payload jsonb,
  received_at timestamptz NOT NULL
);

CREATE INDEX idx_incoming_received_at ON incoming_messages (received_at DESC);
CREATE INDEX idx_incoming_matched_rule_id ON incoming_messages (matched_rule_id);
CREATE INDEX idx_incoming_match_status ON incoming_messages (match_status);

-- -----------------------------------------------------------------------------
-- 3. outgoing_messages (발송 메시지 로그)
-- -----------------------------------------------------------------------------
CREATE TABLE outgoing_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incoming_log_id uuid REFERENCES incoming_messages(id) ON DELETE SET NULL,
  recipient_id varchar(100) NOT NULL,
  matched_rule_id uuid REFERENCES rules(id) ON DELETE SET NULL,
  sent_text text NOT NULL,
  sent_link varchar(2048),
  send_status varchar(20) NOT NULL CHECK (send_status IN ('success', 'failed')),
  error_message text,
  meta_response_payload jsonb,
  sent_at timestamptz NOT NULL
);

CREATE INDEX idx_outgoing_sent_at ON outgoing_messages (sent_at DESC);
CREATE INDEX idx_outgoing_send_status ON outgoing_messages (send_status);
CREATE INDEX idx_outgoing_matched_rule_id ON outgoing_messages (matched_rule_id);
CREATE INDEX idx_outgoing_incoming_log_id ON outgoing_messages (incoming_log_id);

-- -----------------------------------------------------------------------------
-- 4. integration_settings (시스템/연동 설정)
-- -----------------------------------------------------------------------------
CREATE TABLE integration_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fallback_reply text NOT NULL DEFAULT '문의 감사합니다. 담당자가 확인 후 답변드리겠습니다.',
  dedupe_window integer NOT NULL DEFAULT 60,
  test_mode boolean NOT NULL DEFAULT false,
  log_page_size integer NOT NULL DEFAULT 20,
  default_sort varchar(50) NOT NULL DEFAULT 'created_at_desc',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 5. 초기 데이터
-- -----------------------------------------------------------------------------
INSERT INTO integration_settings (fallback_reply, dedupe_window, test_mode, log_page_size, default_sort)
VALUES (
  '문의 감사합니다. 담당자가 확인 후 답변드리겠습니다.',
  60,
  false,
  20,
  'created_at_desc'
);

-- -----------------------------------------------------------------------------
-- 6. updated_at 자동 갱신 트리거
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER rules_updated_at
  BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER integration_settings_updated_at
  BEFORE UPDATE ON integration_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
