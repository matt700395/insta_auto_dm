import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, FlaskConical, Inbox, ListChecks, Plus, TriangleAlert } from "lucide-react";
import raw from "../../public/data/routes/dashboard.json";
import { useMockStatus, formatNumber } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardSkeleton, EmptyCard, ErrorCard, PageHeader, StateSwitcher, TableSkeleton } from "@/components/common";
import { cn } from "@/lib/utils";

type Kpi = { key: string; label: string; value: number; unit: string; delta: string; tone: string };
type QuickLink = { key: string; label: string; description: string; to: string; icon: string; primary?: boolean };
type Incoming = { id: string; sender: string; message: string; receivedAt: string; matched: boolean; ruleName: string | null; ruleId: string | null };
type Failure = { id: string; recipient: string; ruleName: string; ruleId: string; failureReason: string; sentAt: string };

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: { testModeBanner?: { enabled: boolean; message: string }; kpis: Kpi[]; recentIncoming: Incoming[]; recentOutgoingFailures: Failure[] };
  actions: { quickLinks: QuickLink[] };
};

const ICONS: Record<string, React.ReactNode> = {
  plus: <Plus />,
  list: <ListChecks />,
  inbox: <Inbox />,
  flask: <FlaskConical />,
};

const TONE: Record<string, string> = {
  good: "text-emerald-600",
  warn: "text-amber-600",
  neutral: "text-muted-foreground",
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { status, simulate } = useMockStatus(data.__mock?.mode);
  const { page, view, actions } = data;
  const kpis = view?.kpis ?? [];
  const incoming = view?.recentIncoming ?? [];
  const failures = view?.recentOutgoingFailures ?? [];
  const isEmpty = status === "empty";
  const loading = status === "loading" || status === "initial";

  return (
    <div className="space-y-6">
      <PageHeader title={page.title} subtitle={page.subtitle} actions={<StateSwitcher current={status} onSelect={simulate} />} />

      {view?.testModeBanner?.enabled && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="h-4 w-4" /> {view.testModeBanner.message}
        </div>
      )}

      {status === "error" ? (
        <ErrorCard message="대시보드 데이터를 불러오지 못했습니다. 다시 시도해주세요." onRetry={() => simulate("success")} />
      ) : (
        <>
          {/* KPI */}
          <section className="grid grid-cols-4 gap-4">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
              : kpis.map((k, i) => (
                  <motion.div key={k.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md">
                      <CardContent className="space-y-2 p-5">
                        <p className="text-sm text-muted-foreground">{k.label}</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {isEmpty ? "-" : formatNumber(k.value)}
                          <span className="ml-1 text-base font-medium text-muted-foreground">{k.unit}</span>
                        </p>
                        <p className={cn("text-xs font-medium", TONE[k.tone] ?? TONE.neutral)}>{isEmpty ? "데이터 없음" : k.delta}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
          </section>

          {/* 빠른 실행 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 실행</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-4 gap-3">
              {(actions?.quickLinks ?? []).map((q) => (
                <Button
                  key={q.key}
                  variant={q.primary ? "default" : "secondary"}
                  size="lg"
                  className="h-auto justify-start gap-3 py-3 text-left"
                  data-event={q.key}
                  onClick={() => navigate(q.to)}
                >
                  {ICONS[q.icon]}
                  <span className="flex flex-col items-start gap-0.5 whitespace-normal">
                    <span>{q.label}</span>
                    <span className={cn("text-xs font-normal", q.primary ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {q.description}
                    </span>
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* 최근 수신 */}
          {loading ? (
            <TableSkeleton rows={4} />
          ) : isEmpty || incoming.length === 0 ? (
            <EmptyCard
              title="최근 수신 메시지가 없습니다"
              description="아직 로그가 없습니다. 테스트 페이지에서 규칙을 먼저 검증해보세요."
              action={<Button onClick={() => navigate("/test")}>테스트 페이지로 이동</Button>}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>최근 수신 메시지</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/logs/incoming")}>
                  전체 보기 <ArrowRight />
                </Button>
              </CardHeader>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">발신자</th>
                    <th className="px-3 py-2.5 font-medium">메시지</th>
                    <th className="px-3 py-2.5 font-medium">수신시간</th>
                    <th className="px-3 py-2.5 font-medium">매칭결과</th>
                    <th className="px-6 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {incoming.map((l) => (
                    <tr key={l.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 font-medium">@{l.sender}</td>
                      <td className="max-w-[320px] truncate px-3 py-3 text-muted-foreground">{l.message}</td>
                      <td className="px-3 py-3 text-muted-foreground">{l.receivedAt}</td>
                      <td className="px-3 py-3">
                        {l.matched ? <Badge variant="success">매칭 · {l.ruleName}</Badge> : <Badge variant="secondary">미매칭</Badge>}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <Button variant="ghost" size="sm" data-event="DASHBOARD_OPEN_RECENT_ITEM" onClick={() => navigate("/logs/incoming")}>
                          상세
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          {/* 최근 발송 실패 */}
          {loading ? (
            <TableSkeleton rows={3} />
          ) : isEmpty || failures.length === 0 ? (
            <EmptyCard title="최근 발송 실패 로그가 없습니다" description="모든 자동응답이 정상적으로 발송되었습니다." className="py-8" />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" /> 최근 발송 실패 로그
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/logs/outgoing")}>
                  발송 로그 보기 <ArrowRight />
                </Button>
              </CardHeader>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">수신자</th>
                    <th className="px-3 py-2.5 font-medium">규칙명</th>
                    <th className="px-3 py-2.5 font-medium">실패사유</th>
                    <th className="px-3 py-2.5 font-medium">시간</th>
                    <th className="px-6 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {failures.map((f) => (
                    <tr key={f.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 font-medium">@{f.recipient}</td>
                      <td className="px-3 py-3">{f.ruleName}</td>
                      <td className="px-3 py-3 text-red-600">{f.failureReason}</td>
                      <td className="px-3 py-3 text-muted-foreground">{f.sentAt}</td>
                      <td className="px-6 py-3 text-right">
                        <Button variant="ghost" size="sm" data-event="DASHBOARD_OPEN_RECENT_ITEM" onClick={() => navigate("/logs/outgoing")}>
                          상세
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
