// خادم فقط: لا تستورد هذا الملف في المكونات العميلية
import fs from "fs";
import path from "path";
import type {
  AuditLog, CaseAssignment, CaseDocument, CaseMessage, CaseStageHistory,
  LegalCase, ID, DirectoryPerson, DirectoryKind, Expense, CaseStage
} from "./types";

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "legal.json");

type DB = {
  cases: LegalCase[];
  msgs: CaseMessage[];
  docs: CaseDocument[];
  stages: CaseStageHistory[];
  assigns: CaseAssignment[];
  audits: AuditLog[];
  directory: DirectoryPerson[];
  expenses: Expense[];
};

function ensureFile() { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed(), null, 2)); }
function readDB(): DB { ensureFile(); const raw = fs.readFileSync(DB_FILE, "utf-8"); return JSON.parse(raw||"{}") as DB; }
function writeDB(db: DB) { ensureFile(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function seed(): DB {
  const now = new Date().toISOString();
  const u1 = { id:"U1", tenantId:"TENANT-1", kind:"LAWYER" as const, subscriptionNo:"U1", name:"محامي النظام", phoneNumbers:[], emails:[], createdAt:now, updatedAt:now };
  const c1 = { id:"C1", tenantId:"TENANT-1", kind:"CLIENT" as const, subscriptionNo:"C1", name:"عميل تجريبي", phoneNumbers:[], emails:[], createdAt:now, updatedAt:now };
  return { cases: [], msgs: [], docs: [], stages: [], assigns: [], audits: [], directory: [u1, c1], expenses: [] };
}

let db = readDB();

export const now = () => new Date().toISOString();
export const uid = () => {
  const g: any = globalThis as any;
  return g.crypto?.randomUUID ? g.crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
};

function save() { writeDB(db); }

export const Cases = {
  listByTenant(tenantId: ID) { return db.cases.filter(c=>c.tenantId===tenantId); },
  get(tenantId: ID, id: ID) { return db.cases.find(c=>c.tenantId===tenantId && c.id===id) || null; },
  /** إنشاء بقيمة id محددة عند الحاجة */
  create(tenantId: ID, title: string, clientId: ID, primaryLawyerId: ID, id?: ID): LegalCase {
    const c: LegalCase = { id: id || uid(), tenantId, title, clientId, primaryLawyerId, numbers: [], status: "OPEN", stage: "FILING", createdAt: now(), updatedAt: now() };
    db.cases.push(c); save(); return c;
  },
  upsertById(p: Partial<LegalCase> & { id: ID; tenantId: ID }) {
    const i = db.cases.findIndex(x=>x.id===p.id && x.tenantId===p.tenantId);
    if (i<0) { // أنشئ
      const title = p.title || `قضية ${p.id.slice(0,6)}`;
      const clientId = p.clientId || "C1";
      const primaryLawyerId = p.primaryLawyerId || "U1";
      return this.create(p.tenantId, title, clientId, primaryLawyerId, p.id);
    }
    db.cases[i] = { ...db.cases[i], ...p, updatedAt: now() }; save(); return db.cases[i];
  }
};

export const Messages = {
  list(t:ID,c:ID){return db.msgs.filter(m=>m.tenantId===t && m.caseId===c);},
  add(m:CaseMessage){db.msgs.push(m); save(); return m;},
  update(id:ID,patch:Partial<CaseMessage>){const i=db.msgs.findIndex(x=>x.id===id); if(i<0)return null; db.msgs[i]={...db.msgs[i],...patch}; save(); return db.msgs[i];}
};

export const Documents = {
  list(t:ID,c:ID){return db.docs.filter(d=>d.tenantId===t && d.caseId===c);},
  add(d:CaseDocument){db.docs.push(d); save(); return d;},
  markVoid(id:ID,reason:string){const i=db.docs.findIndex(x=>x.id===id); if(i<0)return null; db.docs[i].voided=true; db.docs[i].voidReason=reason; save(); return db.docs[i];}
};

export const Stages = {
  history(t:ID,c:ID){return db.stages.filter(s=>s.tenantId===t && s.caseId===c);},
  add(h:CaseStageHistory){db.stages.push(h); save(); return h;},
  update(id:ID,patch:Partial<CaseStageHistory>){const i=db.stages.findIndex(s=>s.id===id); if(i<0)return null; db.stages[i]={...db.stages[i],...patch}; save(); return db.stages[i];},
  void(id:ID,reason:string){const i=db.stages.findIndex(s=>s.id===id); if(i<0)return null; db.stages[i].voided=true; db.stages[i].voidReason=reason; save(); return db.stages[i];}
};

export const Assignments = { history(t:ID,c:ID){return db.assigns.filter(a=>a.tenantId===t && a.caseId===c);}, addMany(list:CaseAssignment[]){list.forEach(a=>db.assigns.push(a)); save(); return list;} };

export const Expenses = {
  list(t:ID,c:ID){return db.expenses.filter(x=>x.tenantId===t && x.caseId===c);},
  add(e:Expense){db.expenses.push(e); save(); return e;},
  void(id:ID,reason:string){const i=db.expenses.findIndex(x=>x.id===id); if(i<0) return null; db.expenses[i].voided=true; db.expenses[i].voidReason=reason; save(); return db.expenses[i];}
};

export const Directory = {
  list(t:ID,kind?:DirectoryKind){return db.directory.filter(d=>d.tenantId===t && (!kind || d.kind===kind));},
  upsert(p: Omit<DirectoryPerson,"createdAt"|"updatedAt">){const i=db.directory.findIndex(d=>d.id===p.id && d.tenantId===p.tenantId); const t=now(); if(i>=0) db.directory[i]={...db.directory[i],...p,updatedAt:t}; else db.directory.push({...p,phoneNumbers:p.phoneNumbers||[],emails:p.emails||[],createdAt:t,updatedAt:t}); save(); return p.id;},
  importMany(t:ID,kind:DirectoryKind,entries:{subscriptionNo:string;name:string;id?:ID}[]){const out:DirectoryPerson[]=[]; for(const e of entries){const id=e.id||e.subscriptionNo; const person:Omit<DirectoryPerson,"createdAt"|"updatedAt">={id,tenantId:t,kind,subscriptionNo:e.subscriptionNo,name:e.name,phoneNumbers:[],emails:[]}; this.upsert(person); out.push({...person,createdAt:now(),updatedAt:now()} as DirectoryPerson);} return out;}
};

export const Audit = { add(a:AuditLog){db.audits.push(a); save();}, listByCase(t:ID,c:ID){return db.audits.filter(a=>a.tenantId===t && (a.entityId===c || (a.meta as any)?.caseId===c)).sort((x,y)=>+new Date(y.at)-+new Date(x.at));} };
