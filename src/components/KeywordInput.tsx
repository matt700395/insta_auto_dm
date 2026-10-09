import { useState } from "react";
import { Plus, Tags, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** 태그형 멀티 키워드 입력 (Enter / 콤마 / 버튼으로 추가) */
export default function KeywordInput({
  keywords,
  onAdd,
  onRemove,
  invalid,
  id,
}: {
  keywords: string[];
  onAdd: (keyword: string) => void;
  onRemove: (keyword: string) => void;
  invalid?: boolean;
  id?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim().replace(/,$/, "").trim();
    if (!v) return;
    onAdd(v);
    setDraft("");
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          id={id}
          invalid={invalid}
          value={draft}
          placeholder="키워드를 입력하고 Enter (예: 가격)"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
        />
        <Button type="button" variant="secondary" onClick={commit} className="shrink-0">
          <Plus /> 키워드 추가
        </Button>
      </div>
      {keywords.length === 0 ? (
        <div
          className={`flex items-center gap-2 rounded-lg border border-dashed px-4 py-4 text-sm ${
            invalid ? "border-destructive text-destructive" : "text-muted-foreground"
          }`}
        >
          <Tags className="h-4 w-4" /> 등록된 키워드가 없습니다. 최소 1개 이상 추가해주세요.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {keywords.map((k) => (
            <span key={k} className="inline-flex items-center gap-1 rounded-full border bg-secondary py-1 pl-3 pr-1.5 text-sm font-medium">
              {k}
              <button
                type="button"
                onClick={() => onRemove(k)}
                aria-label={`${k} 삭제`}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
