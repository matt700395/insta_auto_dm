import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import raw from "../../public/data/routes/rules.json";
import { useMockStatus } from "@/lib/mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EmptyCard, ErrorCard, PageHeader, Pagination, StateSwitcher, TableSkeleton } from "@/components/common";

type Rule = {
  id: string;
  name: string;
  matchType: "contains" | "exact";
  triggerKeywords: string[];
  replyText: string;
  isActive: boolean;
  priority: number;
  updatedAt: string;
};

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: { pageSize: number; filters: { searchPlaceholder: string; statusOptions: { value: string; label: string }[] }; rules: Rule[] };
  actions: { primaryButtonLabel: string };
};

export default function RulesPage() {
  const navigate = useNavigate();
  const { status, simulate } = useMockStatus(data.__mock?.mode);
  const { page, view, actions } = data;
  const pageSize = view?.pageSize ?? 6;

  const [rules, setRules] = useState<Rule[]>(view?.rules ?? []);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNo, setPageNo] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rules
      .filter((r) => (statusFilter === "all" ? true : statusFilter === "active" ? r.isActive : !r.isActive))
      .filter((r) => !q || r.name.toLowerCase().includes(q) || r.triggerKeywords.some((k) => k.toLowerCase().includes(q)))
      .sort((a, b) => b.priority - a.priority);
  }, [rules, query, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => setPageNo(1), [query, statusFilter]);
  const rows = filtered.slice((pageNo - 1) * pageSize, pageNo * pageSize);

  const toggle = (id: string, next: boolean) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, isActive: next } : r)));
    toast.success(next ? "규칙을 활성화했습니다." : "규칙을 비활성화했습니다.");
  };

  const forcedEmpty = status === "empty";
  const noRulesAtAll = rules.length === 0 || forcedEmpty;

  return (
    <div className="space-y-5">
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        actions={
          <>
            <StateSwitcher current={status} onSelect={simulate} />
            <Button data-event="RULES_GO_NEW" onClick={() => navigate("/rules/new")}>
              <Plus /> {actions?.primaryButtonLabel ?? "새 규칙 만들기"}
            </Button>
          </>
        }
      />

      <Card className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="규칙 검색"
            className="pl-9"
            placeholder={view?.filters?.searchPlaceholder ?? "검색"}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex w-56 items-center gap-2">
          <span className="shrink-0 text-sm text-muted-foreground">상태</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger aria-label="상태 필터">
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
        <Button variant="secondary" onClick={() => toast.info(`${filtered.length}개의 규칙이 검색되었습니다.`)}>
          <Search /> 검색
        </Button>
      </Card>

      {status === "loading" || status === "initial" ? (
        <TableSkeleton rows={6} />
      ) : status === "error" ? (
        <ErrorCard message="규칙 목록을 불러오지 못했습니다. 다시 시도해주세요." onRetry={() => simulate("success")} />
      ) : noRulesAtAll ? (
        <EmptyCard
          title="등록된 규칙이 없습니다"
          description="첫 자동응답 규칙을 만들어 반복 문의를 자동화해보세요."
          action={<Button onClick={() => navigate("/rules/new")}>새 규칙 만들기</Button>}
        />
      ) : filtered.length === 0 ? (
        <EmptyCard
          title="조건에 맞는 규칙이 없습니다"
          description="검색어나 상태 필터를 변경해보세요."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setStatusFilter("all");
              }}
            >
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
                  <th className="px-6 py-3 font-medium">규칙명</th>
                  <th className="px-3 py-3 font-medium">매칭방식</th>
                  <th className="px-3 py-3 font-medium">키워드수</th>
                  <th className="px-3 py-3 font-medium">응답요약</th>
                  <th className="px-3 py-3 font-medium">상태</th>
                  <th className="px-3 py-3 font-medium">우선순위</th>
                  <th className="px-6 py-3 font-medium">최종 수정일</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    data-event="RULES_ROW_CLICK"
                    className="cursor-pointer transition-colors hover:bg-muted/40"
                    onClick={() => navigate(`/rules/${r.id}`)}
                  >
                    <td className="px-6 py-3.5 font-medium">{r.name}</td>
                    <td className="px-3 py-3.5">
                      <Badge variant="outline" className="font-mono">
                        {r.matchType}
                      </Badge>
                    </td>
                    <td className="px-3 py-3.5">{r.triggerKeywords.length}</td>
                    <td className="max-w-[260px] truncate px-3 py-3.5 text-muted-foreground">{r.replyText}</td>
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <Switch checked={r.isActive} onCheckedChange={(v) => toggle(r.id, v)} aria-label={`${r.name} 활성 전환`} />
                        <span className={r.isActive ? "text-xs font-medium text-emerald-600" : "text-xs text-muted-foreground"}>
                          {r.isActive ? "ON" : "OFF"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-mono">{r.priority}</td>
                    <td className="px-6 py-3.5 text-muted-foreground">{r.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Pagination page={pageNo} pageCount={pageCount} total={filtered.length} onChange={setPageNo} />
        </>
      )}
    </div>
  );
}
