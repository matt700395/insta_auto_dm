import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronDown, Loader2, Power, PowerOff, SearchX, Trash2 } from "lucide-react";
import { toast } from "sonner";
import raw from "../../public/data/routes/rule-detail.json";
import { useMockStatus } from "@/lib/mock";
import KeywordInput from "@/components/KeywordInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyCard, ErrorCard, Field, PageHeader, StateSwitcher } from "@/components/common";
import { cn } from "@/lib/utils";

type Match = { id: string; sender: string; message: string; receivedAt: string; keyword: string | null };
type Rule = {
  id: string;
  name: string;
  description: string;
  matchType: string;
  triggerKeywords: string[];
  replyText: string;
  replyLink: string;
  isActive: boolean;
  priority: number;
  updatedAt: string;
  recentMatches?: Match[];
};

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: { matchTypeOptions: { value: string; label: string }[]; rule: Rule; recentMatches: Match[]; rules: Rule[] };
  actions: { saveLabel: string; archiveLabel: string; activateLabel: string; deleteLabel: string };
};

export default function RuleDetailPage() {
  const { ruleId } = useParams();
  const navigate = useNavigate();
  const { status, simulate } = useMockStatus(data.__mock?.mode);
  const { page, view, actions } = data;

  const found = (view?.rules ?? []).find((r) => r.id === ruleId) ?? null;

  const [name, setName] = useState(found?.name ?? "");
  const [description, setDescription] = useState(found?.description ?? "");
  const [matchType, setMatchType] = useState(found?.matchType ?? "contains");
  const [keywords, setKeywords] = useState<string[]>(found?.triggerKeywords ?? []);
  const [replyText, setReplyText] = useState(found?.replyText ?? "");
  const [replyLink, setReplyLink] = useState(found?.replyLink ?? "");
  const [isActive, setIsActive] = useState(found?.isActive ?? true);
  const [priority, setPriority] = useState(String(found?.priority ?? 100));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showMatches, setShowMatches] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const BackToList = (
    <Button variant="secondary" size="sm" onClick={() => navigate("/rules")}>
      규칙 목록으로 돌아가기
    </Button>
  );

  if (status === "loading" || status === "initial") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-72" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-5">
        <PageHeader title={page.title} actions={<StateSwitcher current={status} onSelect={simulate} />} />
        <ErrorCard message="규칙 정보를 불러오지 못했습니다. 다시 시도해주세요." onRetry={() => simulate("success")} extra={BackToList} />
      </div>
    );
  }

  if (!found || status === "empty") {
    return (
      <div className="space-y-5">
        <PageHeader title={page.title} actions={<StateSwitcher current={status} onSelect={simulate} />} />
        <EmptyCard
          title="규칙을 찾을 수 없습니다"
          description={`'${ruleId}' 에 해당하는 규칙이 없거나 삭제되었습니다.`}
          action={<Button onClick={() => navigate("/rules")}>규칙 목록으로 돌아가기</Button>}
        />
      </div>
    );
  }

  const matches = found.recentMatches ?? [];

  const save = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "규칙명을 입력해주세요.";
    if (keywords.length === 0) e.keywords = "트리거 키워드를 최소 1개 입력해주세요.";
    if (!replyText.trim()) e.replyText = "응답 텍스트를 입력해주세요.";
    if (replyLink.trim() && !/^https?:\/\/\S+$/.test(replyLink.trim())) e.replyLink = "올바른 URL을 입력해주세요.";
    if (priority.trim() === "" || Number.isNaN(Number(priority))) e.priority = "숫자를 입력해주세요.";
    setErrors(e);
    if (Object.keys(e).length) return toast.error("입력값을 확인해주세요.");
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      toast.success("규칙이 저장되었습니다.");
    }, 700);
  };

  const toggleActive = () => {
    const next = !isActive;
    setIsActive(next);
    toast.success(next ? "규칙을 활성화했습니다." : "규칙을 비활성화했습니다.");
  };

  const clear = (key: string) => setErrors((x) => ({ ...x, [key]: "" }));

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        badges={
          <>
            <Badge variant={isActive ? "success" : "secondary"}>{isActive ? "활성" : "비활성"}</Badge>
            <Badge variant="outline">우선순위 {priority || "-"}</Badge>
          </>
        }
        actions={<StateSwitcher current={status} onSelect={simulate} options={[{ value: "success", label: "정상" }, { value: "loading", label: "로딩" }, { value: "empty", label: "없음" }, { value: "error", label: "오류" }]} />}
      />

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
          <span className="text-xs text-muted-foreground">최종 수정 {found.updatedAt}</span>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="규칙명" htmlFor="d-name" required error={errors.name}>
            <Input id="d-name" invalid={!!errors.name} placeholder="규칙명" value={name} onChange={(e) => { setName(e.target.value); clear("name"); }} />
          </Field>
          <Field label="설명" htmlFor="d-desc">
            <Input id="d-desc" placeholder="규칙 용도 메모" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <div className="flex items-start gap-6">
            <Field label="매칭 방식" required>
              <Select value={matchType} onValueChange={setMatchType}>
                <SelectTrigger className="w-64" aria-label="매칭 방식">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {view.matchTypeOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="w-40">
              <Field label="우선순위" htmlFor="d-priority" error={errors.priority}>
                <Input id="d-priority" type="number" invalid={!!errors.priority} value={priority} onChange={(e) => { setPriority(e.target.value); clear("priority"); }} />
              </Field>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>트리거 키워드</CardTitle>
          <span className="text-xs text-muted-foreground">{keywords.length}개</span>
        </CardHeader>
        <CardContent>
          <Field label="키워드" htmlFor="d-keyword" required error={errors.keywords}>
            <KeywordInput
              id="d-keyword"
              keywords={keywords}
              invalid={!!errors.keywords}
              onAdd={(k) => {
                if (keywords.includes(k)) return toast.warning(`이미 등록된 키워드입니다: ${k}`);
                setKeywords((p) => [...p, k]);
                clear("keywords");
              }}
              onRemove={(k) => setKeywords((p) => p.filter((x) => x !== k))}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>응답 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="응답 텍스트" htmlFor="d-reply" required error={errors.replyText} hint={`${replyText.length}자`}>
            <Textarea id="d-reply" invalid={!!errors.replyText} placeholder="자동 발송할 답변" value={replyText} onChange={(e) => { setReplyText(e.target.value); clear("replyText"); }} />
          </Field>
          <Field label="응답 링크" htmlFor="d-link" error={errors.replyLink}>
            <Input id="d-link" invalid={!!errors.replyLink} placeholder="https://example.com (선택)" value={replyLink} onChange={(e) => { setReplyLink(e.target.value); clear("replyLink"); }} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="cursor-pointer" onClick={() => setShowMatches((s) => !s)}>
          <CardTitle>최근 매칭 로그 <span className="ml-1 text-xs font-normal text-muted-foreground">({matches.length})</span></CardTitle>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", showMatches && "rotate-180")} />
        </CardHeader>
        {showMatches &&
          (matches.length === 0 ? (
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">아직 이 규칙에 매칭된 메시지가 없습니다.</p>
            </CardContent>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
                  <tr>
                    <th className="px-6 py-2.5 font-medium">발신자</th>
                    <th className="px-3 py-2.5 font-medium">메시지</th>
                    <th className="px-3 py-2.5 font-medium">키워드</th>
                    <th className="px-6 py-2.5 font-medium">시각</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {matches.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/40">
                      <td className="px-6 py-3 font-medium">@{m.sender}</td>
                      <td className="px-3 py-3 text-muted-foreground">{m.message}</td>
                      <td className="px-3 py-3">{m.keyword && <Badge variant="info">{m.keyword}</Badge>}</td>
                      <td className="px-6 py-3 text-muted-foreground">{m.receivedAt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t px-6 py-3">
                <Button variant="ghost" size="sm" onClick={() => navigate("/logs/incoming")}>
                  수신 로그에서 전체 보기
                </Button>
              </div>
            </>
          ))}
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button data-event="RULE_DETAIL_SAVE" disabled={saving} onClick={save}>
            {saving && <Loader2 className="animate-spin" />} {actions?.saveLabel ?? "저장"}
          </Button>
          <Button variant="secondary" data-event="RULE_DETAIL_TOGGLE_ACTIVE" onClick={toggleActive}>
            {isActive ? <PowerOff /> : <Power />} {isActive ? actions?.archiveLabel ?? "비활성화" : actions?.activateLabel ?? "활성화"}
          </Button>
          <Button variant="ghost" onClick={() => navigate("/rules")}>
            목록으로
          </Button>
        </div>
        <Button variant="destructive" data-event="RULE_DETAIL_DELETE" onClick={() => setConfirmDelete(true)}>
          <Trash2 /> {actions?.deleteLabel ?? "삭제"}
        </Button>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogTitle className="flex items-center gap-2">
            <SearchX className="h-5 w-5 text-destructive" /> 규칙을 삭제할까요?
          </AlertDialogTitle>
          <AlertDialogDescription>
            '{found.name}' 규칙이 삭제됩니다. 기존 수신/발송 로그는 보존됩니다. (목업이므로 실제 데이터는 변경되지 않습니다.)
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                toast.success("규칙이 삭제되었습니다.");
                navigate("/rules");
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
