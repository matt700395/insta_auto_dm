import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export type Status = "initial" | "loading" | "success" | "empty" | "error";

const VALID: Status[] = ["initial", "loading", "success", "empty", "error"];

/**
 * 페이지 상태 머신 시뮬레이션 (initial → loading → success | empty | error).
 * - 실제 네트워크 없이 setTimeout 으로 로딩 연출만 한다.
 * - JSON 의 __mock.mode 가 기본 진입 상태. `?state=empty` 처럼 쿼리로 덮어쓸 수 있다.
 */
export function useMockStatus(mode: string | undefined, delay = 700) {
  const [params] = useSearchParams();
  const override = params.get("state") as Status | null;
  const target: Status =
    override && VALID.includes(override) ? override : VALID.includes(mode as Status) ? (mode as Status) : "success";

  const [status, setStatus] = useState<Status>("initial");
  const timer = useRef<number>();

  const simulate = useCallback((next: Status, ms = delay) => {
    window.clearTimeout(timer.current);
    if (next === "loading") {
      setStatus("loading");
      return;
    }
    setStatus("loading");
    timer.current = window.setTimeout(() => setStatus(next), ms);
  }, [delay]);

  useEffect(() => {
    simulate(target);
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return { status, simulate, target };
}

export function formatNumber(n: number) {
  return n.toLocaleString("ko-KR");
}
