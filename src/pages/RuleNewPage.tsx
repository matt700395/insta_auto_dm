import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import raw from "../../public/data/routes/rule-new.json";
import { useMockStatus } from "@/lib/mock";
import KeywordInput from "@/components/KeywordInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, PageHeader, StateSwitcher } from "@/components/common";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorCard } from "@/components/common";

const data = raw as unknown as {
  __mock: { mode: string };
  page: { title: string; subtitle: string };
  view: {
    matchTypeOptions: { value: string; label: string; description: string }[];
    form: {
      defaultName: string;
      defaultDescription: string;
      defaultMatchType: string;
      defaultKeywords: string[];
      defaultReplyText: string;
      defaultReplyLink: string;
      defaultIsActive: boolean;
      defaultPriority: number;
    };
  };
  actions: { submitLabel: string; submitAndListLabel: string; cancelLabel: string };
};

type Errors = Partial<Record<"name" | "keywords" | "replyText" | "replyLink" | "priority", string>>;

export default function RuleNewPage() {
  const navigate = useNavigate();
  const { status: pageStatus, simulate } = useMockStatus(data.__mock?.mode, 500);
  const { page, view, actions } = data;
  const f = view?.form;

  const [name, setName] = useState(f?.defaultName ?? "");
  const [description, setDescription] = useState(f?.defaultDescription ?? "");
  const [matchType, setMatchType] = useState(f?.defaultMatchType ?? "contains");
  const [keywords, setKeywords] = useState<string[]>(f?.defaultKeywords ?? []);
  const [replyText, setReplyText] = useState(f?.defaultReplyText ?? "");
  const [replyLink, setReplyLink] = useState(f?.defaultReplyLink ?? "");
  const [isActive, setIsActive] = useState(f?.defaultIsActive ?? true);
  const [priority, setPriority] = useState(String(f?.defaultPriority ?? 100));

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<null | "save" | "list">(null);
  const [saved, setSaved] = useState(false);

  const addKeyword = (k: string) => {
    if (keywords.includes(k)) return toast.warning(`이미 등록된 키워드입니다: ${k}`);
    setKeywords((p) => [...p, k]);
    setErrors((e) => ({ ...e, keywords: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    if (!name.trim()) e.name = "규칙명을 입력해주세요.";
    if (keywords.length === 0) e.keywords = "트리거 키워드를 최소 1개 입력해주세요.";
    if (!replyText.trim()) e.replyText = "응답 텍스트를 입력해주세요.";
    if (replyLink.trim() && !/^https?:\/\/\S+$/.test(replyLink.trim())) e.replyLink = "http:// 또는 https:// 로 시작하는 올바른 URL을 입력해주세요.";
    if (priority.trim() === "" || Number.isNaN(Number(priority)) || Number(priority) < 0) e.priority = "0 이상의 숫자를 입력해주세요.";
    return e;
  };

  const submit = (mode: "save" | "list") => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) {
      toast.error("입력값을 확인해주세요.");
      return;
    }
    setSaving(mode);
    window.setTimeout(() => {
      setSaving(null);
      toast.success(`'${name}' 규칙이 저장되었습니다.`);
      if (mode === "list") navigate("/rules");
      else setSaved(true);
    }, 800);
  };

  if (pageStatus === "loading" || pageStatus === "initial") {
    return (
      <div className="space-y-5">
        <Skeleton className="h-9 w-64" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (pageStatus === "error") {
    return (
      <div className="space-y-5">
        <PageHeader title={page.title} actions={<StateSwitcher current={pageStatus} onSelect={simulate} />} />
        <ErrorCard onRetry={() => simulate("success")} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        actions={<StateSwitcher current={pageStatus} onSelect={simulate} options={[{ value: "success", label: "정상" }, { value: "loading", label: "로딩" }, { value: "error", label: "오류" }]} />}
      />

      {saved && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" /> 규칙이 저장되었습니다. 계속 편집하거나 목록에서 확인하세요.
          </span>
          <Link to="/rules" className="font-medium underline">
            규칙 목록으로
          </Link>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="규칙명" htmlFor="rule-name" required error={errors.name}>
            <Input
              id="rule-name"
              invalid={!!errors.name}
              placeholder="예: 가격 문의"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((x) => ({ ...x, name: undefined }));
              }}
            />
          </Field>
          <Field label="설명" htmlFor="rule-desc">
            <Input id="rule-desc" placeholder="규칙의 용도를 간단히 메모하세요 (선택)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="매칭 방식" required hint={view.matchTypeOptions.find((o) => o.value === matchType)?.description}>
            <Select value={matchType} onValueChange={setMatchType}>
              <SelectTrigger className="w-72" aria-label="매칭 방식">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>트리거 키워드</CardTitle>
          <span className="text-xs text-muted-foreground">{keywords.length}개 등록됨</span>
        </CardHeader>
        <CardContent>
          <Field label="키워드" htmlFor="rule-keyword" required error={errors.keywords}>
            <KeywordInput id="rule-keyword" keywords={keywords} invalid={!!errors.keywords} onAdd={addKeyword} onRemove={(k) => setKeywords((p) => p.filter((x) => x !== k))} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>응답 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Field label="응답 텍스트" htmlFor="rule-reply" required error={errors.replyText} hint={`${replyText.length}자`}>
            <Textarea
              id="rule-reply"
              invalid={!!errors.replyText}
              placeholder="키워드가 감지되면 자동으로 발송할 답변을 입력하세요."
              value={replyText}
              onChange={(e) => {
                setReplyText(e.target.value);
                setErrors((x) => ({ ...x, replyText: undefined }));
              }}
            />
          </Field>
          <Field label="응답 링크" htmlFor="rule-link" error={errors.replyLink}>
            <Input
              id="rule-link"
              invalid={!!errors.replyLink}
              placeholder="https://example.com (선택)"
              value={replyLink}
              onChange={(e) => {
                setReplyLink(e.target.value);
                setErrors((x) => ({ ...x, replyLink: undefined }));
              }}
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>운영 설정</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-12">
          <div className="space-y-1.5">
            <span className="text-sm font-medium">활성화</span>
            <div className="flex items-center gap-3 pt-1">
              <Switch checked={isActive} onCheckedChange={setIsActive} aria-label="활성화" />
              <span className="text-sm text-muted-foreground">{isActive ? "저장 즉시 작동합니다" : "비활성 상태로 저장됩니다"}</span>
            </div>
          </div>
          <div className="w-48">
            <Field label="우선순위" htmlFor="rule-priority" error={errors.priority} hint="숫자가 높을수록 먼저 적용">
              <Input
                id="rule-priority"
                type="number"
                min={0}
                invalid={!!errors.priority}
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setErrors((x) => ({ ...x, priority: undefined }));
                }}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2">
        <Button variant="secondary" disabled={!!saving} data-event="RULE_NEW_SAVE" onClick={() => submit("save")}>
          {saving === "save" && <Loader2 className="animate-spin" />} {actions?.submitLabel ?? "저장"}
        </Button>
        <Button disabled={!!saving} data-event="RULE_NEW_SAVE_AND_GO_LIST" onClick={() => submit("list")}>
          {saving === "list" && <Loader2 className="animate-spin" />} {actions?.submitAndListLabel ?? "저장 후 목록으로"}
        </Button>
        <Button variant="ghost" disabled={!!saving} data-event="RULE_NEW_CANCEL" onClick={() => navigate("/rules")}>
          {actions?.cancelLabel ?? "취소"}
        </Button>
      </div>
    </div>
  );
}
