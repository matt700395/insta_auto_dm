import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FlaskConical, Info, Link2, Loader2, RotateCcw, SearchX } from "lucide-react";
import raw from "../../public/data/routes/test.json";
import type { Status } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/input";
import { ErrorCard, PageHeader, StateSwitcher } from "@/components/common";
import { cn } from "@/lib/utils";

type Rule = {
  id: string;
  name: string;
  matchType: "contains" | "exact";
  triggerKeywords: string[];
  replyText: string;
  replyLink: string;
  isActive: boolean;
  priority: number;
};
type Candidate = { rule: Rule; keyword: string; applied: boolean };
type Preview = { title: string; description: string };

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: {
    defaultInput: string;
    suggestedExamples: string[];
    defaultReply: { enabled: boolean; text: string };
    resultPreview: { initial: Preview; empty: Preview; error: Preview };
    rules: Rule[];
  };
  actions: { runLabel: string; resetLabel: string };
};

/** 활성 규칙만 대상으로 우선순위 높은 순으로 첫 번째 매칭 규칙을 적용 (PRD 6.3) */
function matchRules(input: string, rules: Rule[]) {
  const text = input.trim().toLowerCase();
  const hits: Candidate[] = [];
  const skipped: Candidate[] = [];
  for (const rule of [...rules].sort((a, b) => b.priority - a.priority)) {
    const keyword = rule.triggerKeywords.find((k) =>
      rule.matchType === "exact" ? text === k.toLowerCase() : text.includes(k.toLowerCase())
    );
    if (!keyword) continue;
    (rule.isActive ? hits : skipped).push({ rule, keyword, applied: false });
  }
  if (hits[0]) hits[0].applied = true;
  return { hits, skipped };
}

export default function TestPage() {
  const navigate = useNavigate();
  const { page, view, actions } = data;
  const rules = view?.rules ?? [];
  const examples = view?.suggestedExamples ?? [];

  const initialStatus = (["initial", "success", "empty", "error"].includes(data.__mock?.mode) ? data.__mock.mode : "initial") as Status;
  const [input, setInput] = useState(view?.defaultInput ?? "");
  const [status, setStatus] = useState<Status>(initialStatus === "success" ? "initial" : initialStatus);
  const [result, setResult] = useState<ReturnType<typeof matchRules> | null>(null);
  const [inputError, setInputError] = useState("");
  const timer = useRef<number>();

  const run = (text = input) => {
    if (!text.trim()) {
      setInputError("테스트할 문장을 입력해주세요.");
      return;
    }
    setInputError("");
    setStatus("loading");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const r = matchRules(text, rules);
      setResult(r);
      setStatus(r.hits.length > 0 ? "success" : "empty");
    }, 700);
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setInput("");
    setInputError("");
    setResult(null);
    setStatus("initial");
  };

  const force = (s: Status) => {
    window.clearTimeout(timer.current);
    if (s === "success") {
      const sample = input.trim() || examples[0] || "";
      setInput(sample);
      run(sample);
    } else if (s === "empty" && !result) {
      setResult({ hits: [], skipped: [] });
      setStatus("empty");
    } else setStatus(s);
  };

  const winner = result?.hits.find((h) => h.applied);

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        actions={
          <StateSwitcher
            current={status}
            onSelect={force}
            options={[
              { value: "initial", label: "초기" },
              { value: "success", label: "매칭" },
              { value: "empty", label: "미매칭" },
              { value: "error", label: "오류" },
            ]}
          />
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>테스트 입력</CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> 실제 DM 발송·로그 생성 없음
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="test-input" className="text-sm font-medium">
              테스트 문장
            </label>
            <Textarea
              id="test-input"
              invalid={!!inputError}
              className="min-h-[90px]"
              placeholder="예: 배송은 얼마나 걸리나요?"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setInputError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) run();
              }}
            />
            {inputError && <p className="text-xs text-destructive">{inputError}</p>}
          </div>
          <div className="flex gap-2">
            <Button data-event="TEST_RUN_MATCH" disabled={status === "loading"} onClick={() => run()}>
              {status === "loading" ? <Loader2 className="animate-spin" /> : <FlaskConical />} {actions?.runLabel ?? "매칭 테스트 실행"}
            </Button>
            <Button variant="secondary" data-event="TEST_RESET" onClick={reset}>
              <RotateCcw /> {actions?.resetLabel ?? "초기화"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>추천 예문</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {examples.map((ex) => (
            <button
              key={ex}
              type="button"
              data-event="TEST_USE_SUGGESTED_EXAMPLE"
              onClick={() => {
                setInput(ex);
                setInputError("");
              }}
              className="rounded-full border bg-secondary px-3.5 py-1.5 text-sm transition-colors hover:border-primary/40 hover:bg-accent"
            >
              {ex}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>테스트 결과</CardTitle>
          {status === "success" && <Badge variant="success">매칭 성공</Badge>}
          {status === "empty" && <Badge variant="warning">미매칭</Badge>}
        </CardHeader>
        <CardContent>
          {status === "initial" && (
            <div className="flex flex-col items-center py-8 text-center">
              <FlaskConical className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="font-medium">{view.resultPreview.initial.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{view.resultPreview.initial.description}</p>
            </div>
          )}

          {status === "loading" && (
            <div className="space-y-3">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {status === "error" && (
            <ErrorCard message={view.resultPreview.error.description} onRetry={() => (input.trim() ? run() : reset())} />
          )}

          {status === "empty" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center py-4 text-center">
                <SearchX className="mb-2 h-8 w-8 text-amber-500" />
                <p className="font-semibold">{view.resultPreview.empty.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{view.resultPreview.empty.description}</p>
              </div>
              {result && result.skipped.length > 0 && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  비활성 규칙 '{result.skipped[0].rule.name}'의 키워드('{result.skipped[0].keyword}')와는 일치하지만, 비활성 상태라 제외되었습니다.
                </p>
              )}
              {view.defaultReply?.enabled && (
                <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
                  <p className="mb-1 text-xs text-muted-foreground">기본 안내 메시지가 발송됩니다 (설정된 경우)</p>
                  {view.defaultReply.text}
                </div>
              )}
              <div className="flex justify-center">
                <Button variant="secondary" onClick={() => navigate("/rules/new")}>
                  새 규칙 만들기
                </Button>
              </div>
            </div>
          )}

          {status === "success" && winner && result && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
              <dl className="grid grid-cols-[130px_1fr] items-start gap-y-3 text-sm">
                <dt className="text-muted-foreground">매칭 결과</dt>
                <dd className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {winner.rule.name}
                  <Badge variant="outline" className="font-mono">
                    {winner.rule.matchType}
                  </Badge>
                  <Badge variant="outline">우선순위 {winner.rule.priority}</Badge>
                </dd>
                <dt className="text-muted-foreground">매칭 키워드</dt>
                <dd>
                  <Badge variant="info">{winner.keyword}</Badge>
                </dd>
                <dt className="text-muted-foreground">발송 예정 텍스트</dt>
                <dd className="rounded-lg border bg-muted/40 px-3 py-2.5 leading-relaxed">{winner.rule.replyText}</dd>
                <dt className="text-muted-foreground">첨부 링크</dt>
                <dd className="flex items-center gap-1.5 text-sky-700">
                  {winner.rule.replyLink ? (
                    <>
                      <Link2 className="h-3.5 w-3.5" /> {winner.rule.replyLink}
                    </>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </dd>
              </dl>

              <div>
                <p className="mb-2 text-sm font-medium">우선순위 결과</p>
                <ol className="space-y-1.5">
                  {[...result.hits, ...result.skipped].map((c, i) => (
                    <li
                      key={c.rule.id}
                      className={cn(
                        "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                        c.applied ? "border-emerald-200 bg-emerald-50" : "bg-card text-muted-foreground"
                      )}
                    >
                      <span>
                        {i + 1}. {c.rule.name} <span className="text-xs">· 키워드 '{c.keyword}' · 우선순위 {c.rule.priority}</span>
                      </span>
                      {c.applied ? (
                        <Badge variant="success">적용됨</Badge>
                      ) : !c.rule.isActive ? (
                        <Badge variant="secondary">비활성 제외</Badge>
                      ) : (
                        <Badge variant="secondary">우선순위 밀림</Badge>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              <Button data-event="TEST_GO_RULE_DETAIL" onClick={() => navigate(`/rules/${winner.rule.id}`)}>
                규칙 상세 보러가기 <ArrowRight />
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
