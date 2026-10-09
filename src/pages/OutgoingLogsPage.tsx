import { Fragment, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Download, Search } from "lucide-react";
import { toast } from "sonner";
import raw from "../../public/data/routes/logs-outgoing.json";
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
  recipient: string;
  ruleId: string;
  ruleName: string;
  status: "success" | "failed";
  sentAt: string;
  text: string;
  link: string;
  failureReason: string | null;
  apiResponse: string;
};

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: { pageSize: number; filters: { searchPlaceholder: string; statusOptions: { value: string; label: string }[] }; logs: Log[] };
  actions: { exportLabel: string };
};

export default function OutgoingLogsPage() {
  const navigate = useNavigate();
  const { status, simulate } = useMockStatus(data.__mock?.mode);
  const { page, view, actions } = data;
  const pageSize = view?.pageSize ?? 8;

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNo, setPageNo] = useState(1);
  const [openId, setOpenId] = useState<string | null>(null);

  const logs = view?.logs ?? [];
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs
      .filter((l) => statusFilter === "all" || l.status === statusFilter)
      .filter((l) => !q || l.ruleName.toLowerCase().includes(q) || l.recipient.toLowerCase().includes(q));
  }, [logs, query, statusFilter]);

  useEffect(() => {
    setPageNo(1);
    setOpenId(null);
  }, [query, statusFilter]);

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
            <Button variant="secondary" onClick={() => toast.success("발송 로그 CSV를 내보냈습니다. (목업)")}>
              <Download /> {actions?.exportLabel ?? "내보내기"}
            </Button>
          </>
        }
      />

      <Card className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input aria-label="로그 검색" className="pl-9" placeholder={view?.filters?.searchPlaceholder ?? "검색"} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex w-56 items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">상태</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="발송 상태 필터">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(view?.filters?.statusOptions ?? []).map((o) => (
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
        <ErrorCard message="발송 로그를 불러오지 못했습니다. 다시 시도해주세요." onRetry={() => simulate("success")} />
      ) : status === "empty" || logs.length === 0 ? (
        <EmptyCard
          title="발송 로그가 없습니다"
          description="자동응답이 발송되면 결과가 자동으로 기록됩니다."
          action={<Button onClick={() => navigate("/test")}>테스트 페이지로 이동</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyCard
          title="조건에 맞는 발송 로그가 없습니다"
          description="검색어 또는 상태 필터를 변경해보세요."
          action={
            <Button variant="secondary" onClick={() => { setQuery(""); setStatusFilter("all"); }}>
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
                  <th className="px-3 py-3 font-medium">수신자</th>
                  <th className="px-3 py-3 font-medium">규칙명</th>
                  <th className="px-3 py-3 font-medium">발송상태</th>
                  <th className="px-3 py-3 font-medium">발송시각</th>
                  <th className="px-6 py-3 text-right font-medium">액션</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((l) => {
                  const open = openId === l.id;
                  const failed = l.status === "failed";
                  return (
                    <Fragment key={l.id}>
                      <tr data-event="OUTGOING_ROW_EXPAND" className={cn("cursor-pointer transition-colors hover:bg-muted/40", open && "bg-muted/40")} onClick={() => setOpenId(open ? null : l.id)}>
                        <td className="px-3 py-3.5 text-muted-foreground">
                          <ChevronRight className={cn("h-4 w-4 transition-transform", open && "rotate-90")} />
                        </td>
                        <td className="px-3 py-3.5 font-medium">@{l.recipient}</td>
                        <td className="px-3 py-3.5">{l.ruleName}</td>
                        <td className="px-3 py-3.5">{failed ? <Badge variant="danger">실패</Badge> : <Badge variant="success">성공</Badge>}</td>
                        <td className="px-3 py-3.5 text-muted-foreground">{l.sentAt.slice(5)}</td>
                        <td className="px-6 py-3.5 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setOpenId(open ? null : l.id); }}>
                            {open ? "닫기" : "상세"}
                          </Button>
                        </td>
                      </tr>
                      {open && (
                        <tr className={failed ? "bg-red-50/60" : "bg-muted/30"}>
                          <td colSpan={6} className="px-6 py-5">
                            <div className="grid grid-cols-[1fr_auto] gap-6">
                              <dl className="grid grid-cols-[110px_1fr] gap-y-2.5 text-sm">
                                {failed && (
                                  <>
                                    <dt className="font-medium text-red-700">실패 사유</dt>
                                    <dd className="font-medium text-red-700">{l.failureReason}</dd>
                                  </>
                                )}
                                <dt className="text-muted-foreground">발송 텍스트</dt>
                                <dd className="rounded-lg border bg-card px-3 py-2 leading-relaxed">{l.text}</dd>
                                <dt className="text-muted-foreground">첨부 링크</dt>
                                <dd className="text-sky-700">{l.link || <span className="text-muted-foreground">-</span>}</dd>
                                <dt className="text-muted-foreground">Meta API 응답</dt>
                                <dd className="overflow-x-auto rounded-lg bg-slate-900 px-3 py-2 font-mono text-xs leading-5 text-slate-100">{l.apiResponse}</dd>
                              </dl>
                              <div className="flex flex-col gap-2">
                                <Button size="sm" data-event="OUTGOING_GO_RULE_DETAIL" onClick={() => navigate(`/rules/${l.ruleId}`)}>
                                  관련 규칙 보기
                                </Button>
                                <Button size="sm" variant="secondary" data-event="OUTGOING_GO_INCOMING_LOG" onClick={() => navigate("/logs/incoming")}>
                                  수신 로그 보기
                                </Button>
                                {failed && (
                                  <Button size="sm" variant="outline" onClick={() => toast.info("재발송은 목업에서 지원하지 않습니다.")}>
                                    재발송 안내
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
