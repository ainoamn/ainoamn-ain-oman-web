import React from "react";
import { useRouter } from "next/router";
import Layout from "../../components/layout/Layout";
import CaseOverview from "../../components/legal/CaseOverview";
import CaseTimeline from "../../components/legal/CaseTimeline";
import DocumentManager from "../../components/legal/DocumentManager";
import ActionButtons from "../../components/legal/ActionButtons";
import PrintExport from "../../components/legal/PrintExport";
import LegalChat from "../../components/legal/LegalChat";
import ExpenseManager from "../../components/legal/ExpenseManager";

type Tab = "overview"|"timeline"|"documents"|"chat"|"expenses";

export default function CasePage() {
  const router = useRouter();
  const caseId = String(router.query.caseId||"");
  const [tab, setTab] = React.useState<Tab>("overview");

  const onChanged = () => {};

  const TabLink = ({t,label}:{t:Tab;label:string}) => (
    <button className={`px-3 py-2 border-b-2 ${tab===t?"border-black":"border-transparent"}`} onClick={()=>setTab(t)}>{label}</button>
  );

  return (
    <Layout>
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">القضية</h1>
        <PrintExport caseId={caseId} />
      </div>

      <div className="flex gap-3 border-b mb-3">
        <TabLink t="overview" label="تفاصيل الواقعة" />
        <TabLink t="timeline" label="الجدول الزمني" />
        <TabLink t="documents" label="المستندات" />
        <TabLink t="chat" label="المحادثة" />
        <TabLink t="expenses" label="المصاريف" />
      </div>

      {tab==="overview" && <CaseOverview caseId={caseId} />}

      {tab==="timeline" && (
        <div className="space-y-3">
          <ActionButtons caseId={caseId} onChanged={onChanged} />
          <CaseTimeline caseId={caseId} />
        </div>
      )}

      {tab==="documents" && <DocumentManager caseId={caseId} />}

      {tab==="chat" && <LegalChat caseId={caseId} />}

      {tab==="expenses" && <ExpenseManager caseId={caseId} />}
    </Layout>
  );
}
