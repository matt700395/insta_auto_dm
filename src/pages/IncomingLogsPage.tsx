import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, Search } from "lucide-react";
import { toast } from "sonner";
import raw from "../../public/data/routes/logs-incoming.json";
import { useMockStatus } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyCard, ErrorCard, PageHeader, Pagination, StateSwitcher, TableSkeleton } from "@/components/common";
import { cn } from "@/lib/utils";

type Log = {
  id: string;
  sender: string;
  message: string;
  receivedAt: string;
  matched: boolean;
  ruleId: string | null;
  ruleName: string | null;
  matchedKeyword: string | null;
  platformMessageId: string;
  note: string | null;
};

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: { pageSize: number; filters: { keywordPlaceholder: string; matchStatusOptions: { value: string; label: string }[] }; logs: Log[] };
  actions: { exportLabel: string };
};

export default function IncomingLogsPage() {
  const navigate = useNavigate();
  const { status, simulate } = useMockStatus(data.__mock?.mode);
  const { page, view, actions } = data;
  const pageSize = view?.pageSize ?? 8;

  const [query, setQuery] = useState("");
  const [matchFilter, setMatchFilter] = useState("all");
  const [pageNo, setPageNo] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const logs = view?.logs ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((l) => (matchFilter === "all" ? true : matchFilter === "matched" ? l.matched : !l.matched))
      .filter((l) => !q || l.message.toLowerCase().includes(q) || l.sender.toLowerCase().includes(q));
  }, [logs, query, matchFilter]);

  useEffect(() => {
    setPageNo(1);
    setOpenId(null);
  }, [query, matchFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const rows = filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize);

  return (
    <div className="space-y-5">
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        actions={
          <>
            <StateSwitcher current={status} onSelect={simulate} />
            <Button variant="secondary" onClick={() => toast.success("수신 로그 CSV를 내보냈습니다. (목업)")}>
              <Download /> {actions?.exportLabel ?? "내보내기"}
            </Button>
          </>
        }
      />

      <Card className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="로그 검색" className="pl-9" placeholder={view?.filters?.keywordPlaceholder ?? "검색"} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex w-60 items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">매칭상태</span>
          <Select value={matchFilter} onValueChange={setMatchFilter}>
            <SelectTrigger aria-label="매칭 상태 필터">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(view?.filters?.matchStatusOptions ?? []).map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {status === "loading" || status === "initial" ? (
        <TableSkeleton rows={6} />
      ) : status === "error" ? (
        <ErrorCard message="수신 로그를 표시하지 못했습니다. 다시 시도해주세요." onRetry={() => simulate("success")} />
      ) : status === "empty" || logs.length === 0 ? (
        <EmptyCard
          title="수신된 메시지 로그가 없습니다"
          description="DM이 들어오면 자동으로 기록됩니다. 먼저 규칙을 테스트해보세요."
          action={<Button onClick={() => navigate("/test")}>테스트 페이지로 이동</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyCard
          title="조건에 맞는 수신 로그가 없습니다"
          description="검색어 또는 매칭 상태 필터를 변경해보세요."
          action={
            <Button variant="secondary" onClick={() => { setQuery(""); setMatchFilter("all"); }}>
              필터 초기화
            </Button>
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="w-10 px-3 py-3" />
                  <th className="px-3 py-3 font-medium">발신자</th>
                  <th className="px-3 py-3 font-medium">메시지</th>
                  <th className="px-3 py-3 font-medium">수신시각</th>
                  <th className="px-3 py-3 font-medium">매칭여부</th>
                  <th className="px-6 py-3 font-medium">매칭규칙</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((l) => {
                  const open = openId === l.id;
                  return (
                    <Fragment key={l.id}>
                      <tr data-event="INCOMING_ROW_EXPAND" className={cn("cursor-pointer transition-colors hover:bg-muted/40", open && "bg-muted/40")} onClick={() => setOpenId(open ? null : l.id)}>
                        <td className="px-3 py-3.5 text-muted-foreground">
                          <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
                        </td>
                        <td className="px-3 py-3.5 font-medium">@{l.sender}</td>
                        <td className="max-w-[320px] truncate px-3 py-3.5 text-muted-foreground">{l.message}</td>
                        <td className="px-3 py-3.5 text-muted-foreground">{l.receivedAt.slice(5)}</td>
                        <td className="px-3 py-3.5">{l.matched ? <Badge variant="success">매칭</Badge> : <Badge variant="secondary">미매칭</Badge>}</td>
                        <td className="px-6 py-3.5">{l.ruleName ?? <span className="text-muted-foreground">-</span>}</td>
                      </tr>
                      {open && (
                        <tr className="bg-muted/30">
                          <td colSpan={6} className="px-6 py-5">
                            <div className="grid grid-cols-[1fr_auto] gap-6">
                              <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 text-sm">
                                <dt className="text-muted-foreground">메시지 원문</dt>
                                <dd className="rounded-lg border bg-card px-3 py-2">{l.message}</dd>
                                <dt className="text-muted-foreground">플랫폼 메시지 ID</dt>
                                <dd className="font-mono text-xs leading-6">{l.platformMessageId}</dd>
                                <dt className="text-muted-foreground">매칭 키워드</dt>
                                <dd>{l.matchedKeyword ? <Badge variant="info">{l.matchedKeyword}</Badge> : "-"}</dd>
                                {l.note && (
                                  <>
                                    <dt className="text-muted-foreground">비고</dt>
                                    <dd className="text-muted-foreground">{l.note}</dd>
                                  </>
                                )}
                              </dl>
                              <div className="flex flex-col gap-2">
                                {l.matched && (
                                  <Button size="sm" data-event="INCOMING_GO_OUTGOING_LOG" onClick={() => navigate("/logs/outgoing")}>
                                    발송 로그 보기
                                  </Button>
                                )}
                                {l.ruleId && (
                                  <Button size="sm" variant="secondary" onClick={() => navigate(`/rules/${l.ruleId}`)}>
                                    적용 규칙 보기
                                  </Button>
                                )}
                                {!l.matched && (
                                  <Button size="sm" variant="secondary" onClick={() => navigate("/rules/new")}>
                                    이 문의로 규칙 만들기
                                  </Button>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </Card>
          <Pagination page={pageNo} pageCount={pageCount} total={filtered.length} onChange={(p) => { setPageNo(p); setOpenId(null); }} />
        </>
      )}
    </div>
  );
}
