import type { ReactNode } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Inbox, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Status } from "@/lib/mock";

export function PageHeader({
  title,
  subtitle,
  badges,
  actions,
}: {
  title: string;
  subtitle?: string;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {badges}
        </div>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

const SWITCH_OPTIONS: { value: Status; label: string }[] = [
  { value: "success", label: "정상" },
  { value: "loading", label: "로딩" },
  { value: "empty", label: "빈 상태" },
  { value: "error", label: "오류" },
];

/** 목업 전용: 페이지 상태(success/loading/empty/error)를 강제로 전환해 볼 수 있는 컨트롤 */
export function StateSwitcher({
  current,
  onSelect,
  options = SWITCH_OPTIONS,
}: {
  current: Status;
  onSelect: (s: Status) => void;
  options?: { value: Status; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <FlaskConical className="h-3.5 w-3.5" />
      <span>상태 미리보기</span>
      <div className="flex rounded-lg border bg-card p-0.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={cn(
              "rounded-md px-2.5 py-1 font-medium transition-colors",
              current === o.value ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ErrorCard({
  message = "문제가 발생했습니다. 다시 시도해주세요.",
  onRetry,
  extra,
}: {
  message?: string;
  onRetry?: () => void;
  extra?: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-red-800" role="alert">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-semibold">{message}</p>
        <p className="mt-0.5 text-sm text-red-700/80">데이터를 표시하지 못했습니다. (목업 오류 상태)</p>
        <div className="mt-3 flex gap-2">
          {onRetry && (
            <Button size="sm" variant="destructive" onClick={onRetry}>
              다시 시도
            </Button>
          )}
          {extra}
        </div>
      </div>
    </div>
  );
}

export function EmptyCard({
  title = "표시할 데이터가 없습니다",
  description,
  action,
  className,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl border border-dashed bg-card px-6 py-14 text-center", className)}>
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <p className="font-semibold">{title}</p>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </CardContent>
    </Card>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

export function Pagination({
  page,
  pageCount,
  total,
  onChange,
}: {
  page: number;
  pageCount: number;
  total: number;
  onChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="text-sm text-muted-foreground">총 {total}건</span>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="이전 페이지">
          <ChevronLeft />
        </Button>
        {Array.from({ length: pageCount }).map((_, i) => (
          <Button
            key={i}
            size="icon"
            variant={page === i + 1 ? "default" : "ghost"}
            onClick={() => onChange(i + 1)}
          >
            {i + 1}
          </Button>
        ))}
        <Button variant="outline" size="icon" disabled={page >= pageCount} onClick={() => onChange(page + 1)} aria-label="다음 페이지">
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}
