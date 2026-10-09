import { NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, FlaskConical, Inbox, LayoutDashboard, ListChecks, MessageCircle, Send } from "lucide-react";
import { Toaster } from "sonner";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "대시보드", icon: LayoutDashboard, end: true },
  { to: "/rules", label: "규칙 관리", icon: ListChecks, end: false },
  { to: "/logs/incoming", label: "수신 로그", icon: Inbox, end: false },
  { to: "/logs/outgoing", label: "발송 로그", icon: Send, end: false },
  { to: "/test", label: "테스트", icon: FlaskConical, end: false },
];

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/90 px-6 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 text-white">
            <MessageCircle className="h-4 w-4" />
          </div>
          <span className="text-base font-bold tracking-tight">Instagram DM Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-muted-foreground xl:flex">
            <Bell className="h-3.5 w-3.5" /> 더미 데이터로 동작 중
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Local Mock Run
          </span>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-60 shrink-0 border-r bg-white px-3 py-5">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">메뉴</p>
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-8 py-8">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="mx-auto w-full max-w-[1200px]"
            >
              <Outlet />
            </motion.div>
          </main>
          <footer className="border-t bg-white px-8 py-4 text-center text-xs text-muted-foreground">
            Mock UI for local internal testing
          </footer>
        </div>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
