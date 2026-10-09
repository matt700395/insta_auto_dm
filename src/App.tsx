import { Route, Routes } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import RulesPage from "@/pages/RulesPage";
import RuleNewPage from "@/pages/RuleNewPage";
import RuleDetailPage from "@/pages/RuleDetailPage";
import IncomingLogsPage from "@/pages/IncomingLogsPage";
import OutgoingLogsPage from "@/pages/OutgoingLogsPage";
import TestPage from "@/pages/TestPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/rules/new" element={<RuleNewPage />} />
        <Route path="/rules/:ruleId" element={<RuleDetailPage />} />
        <Route path="/logs/incoming" element={<IncomingLogsPage />} />
        <Route path="/logs/outgoing" element={<OutgoingLogsPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
