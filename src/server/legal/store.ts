// خادم فقط: لا تستورد هذا الملف في المكونات العميلية
import fs from "fs";
import path from "path";
import type {
  AuditLog, CaseAssignment, CaseDocument, CaseMessage, CaseStageHistory,
  LegalCase, ID, DirectoryPerson, DirectoryKind, Expense, CaseStage,
  LegalAnalytics, CasePrediction, LegalWorkflow, AIInsights, CaseType, CasePriority,
  CaseTransfer, LegalAppointment, LegalTask, TransferType, TransferStatus
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
  workflows: LegalWorkflow[];
  predictions: CasePrediction[];
  analytics: LegalAnalytics[];
  transfers: CaseTransfer[];
  appointments: LegalAppointment[];
  legalTasks: LegalTask[];
};

function ensureFile() { if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true }); if (!fs.existsSync(DB_FILE)) fs.writeFileSync(DB_FILE, JSON.stringify(seed(), null, 2)); }
function readDB(): DB { ensureFile(); const raw = fs.readFileSync(DB_FILE, "utf-8"); return JSON.parse(raw||"{}") as DB; }
function writeDB(db: DB) { ensureFile(); fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function seed(): DB {
  const now = new Date().toISOString();
  const u1 = { 
    id:"U1", 
    tenantId:"TENANT-1", 
    kind:"LAWYER" as const, 
    subscriptionNo:"U1", 
    name:"محامي النظام", 
    phoneNumbers:["96812345678"], 
    emails:["lawyer@system.com"],
    specialization:["العقارات", "الإيجارات", "القانون التجاري"],
    experience: 10,
    rating: 4.8,
    availability: "AVAILABLE" as const,
    hourlyRate: 150,
    createdAt:now, 
    updatedAt:now 
  };
  const c1 = { 
    id:"C1", 
    tenantId:"TENANT-1", 
    kind:"CLIENT" as const, 
    subscriptionNo:"C1", 
    name:"عميل تجريبي", 
    phoneNumbers:["96887654321"], 
    emails:["client@example.com"],
    address: "مسقط، سلطنة عمان",
    createdAt:now, 
    updatedAt:now 
  };
  
  // Sample workflow for rental disputes
  const rentalWorkflow: LegalWorkflow = {
    id: "WF-RENTAL-001",
    name: "سير عمل نزاعات الإيجار",
    description: "سير عمل شامل لإدارة نزاعات الإيجار من البداية حتى النهاية",
    caseType: "RENTAL_DISPUTE" as CaseType,
    stages: [
      {
        stage: "INVESTIGATION" as CaseStage,
        name: "التحقيق الأولي",
        description: "جمع المعلومات والوثائق الأولية",
        estimatedDays: 7,
        requiredDocuments: ["عقد الإيجار", "إيصالات الدفع", "إشعارات الإخلاء"],
        actions: ["مراجعة العقد", "جمع الأدلة", "مقابلة العميل"],
        assignees: ["LAWYER", "PARALEGAL"]
      },
      {
        stage: "NEGOTIATION" as CaseStage,
        name: "المفاوضات",
        description: "محاولة حل النزاع ودياً",
        estimatedDays: 14,
        requiredDocuments: ["عرض التسوية", "مراسلات الطرف الآخر"],
        actions: ["إرسال إنذار قانوني", "عقد جلسات تفاوض", "إعداد عروض التسوية"],
        assignees: ["LAWYER"]
      },
      {
        stage: "FILING" as CaseStage,
        name: "رفع الدعوى",
        description: "رفع الدعوى أمام المحكمة",
        estimatedDays: 21,
        requiredDocuments: ["لائحة الدعوى", "المستندات المؤيدة", "رسوم المحكمة"],
        actions: ["إعداد لائحة الدعوى", "دفع الرسوم", "تقديم الدعوى"],
        assignees: ["LAWYER"]
      }
    ],
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  return { 
    cases: [], 
    msgs: [], 
    docs: [], 
    stages: [], 
    assigns: [], 
    audits: [], 
    directory: [u1, c1], 
    expenses: [],
    workflows: [rentalWorkflow],
    predictions: [],
    analytics: [],
    transfers: [],
    appointments: [],
    legalTasks: []
  };
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
  listByProperty(tenantId: ID, propertyId: ID) { 
    return db.cases.filter(c=>c.tenantId===tenantId && c.propertyReference?.propertyId===propertyId); 
  },
  get(tenantId: ID, id: ID) { return db.cases.find(c=>c.tenantId===tenantId && c.id===id) || null; },
  /** إنشاء بقيمة id محددة عند الحاجة */
  async create(tenantId: ID, title: string, clientId: ID, primaryLawyerId: ID, options?: {
    id?: ID;
    type?: CaseType;
    priority?: CasePriority;
    propertyReference?: any;
    description?: string;
    plaintiff?: string;
    defendant?: string;
    courtNumber?: string;
    registrationDate?: string;
    hearingDate?: string;
    caseSummary?: string;
    legalBasis?: string;
    requestedRelief?: string;
    evidence?: string;
    witnesses?: string;
    estimatedValue?: number;
    expectedOutcome?: string;
    expenses?: number;
    fees?: number;
    notes?: string;
  }): Promise<LegalCase> {
    const { getNextLegalCaseNumber } = require('../serialNumbers');
    const caseNumber = await getNextLegalCaseNumber();
    
    const c: LegalCase = { 
      id: options?.id || caseNumber, 
      tenantId, 
      title, 
      clientId, 
      primaryLawyerId, 
      numbers: [], 
      status: "OPEN", 
      stage: "INVESTIGATION", 
      type: options?.type || "OTHER",
      priority: options?.priority || "MEDIUM",
      description: options?.description,
      propertyReference: options?.propertyReference,
      plaintiff: options?.plaintiff,
      defendant: options?.defendant,
      courtNumber: options?.courtNumber,
      registrationDate: options?.registrationDate,
      hearingDate: options?.hearingDate,
      caseSummary: options?.caseSummary,
      legalBasis: options?.legalBasis,
      requestedRelief: options?.requestedRelief,
      evidence: options?.evidence,
      witnesses: options?.witnesses,
      estimatedValue: options?.estimatedValue,
      expectedOutcome: options?.expectedOutcome,
      expenses: options?.expenses,
      fees: options?.fees,
      notes: options?.notes,
      createdAt: now(), 
      updatedAt: now() 
    };
    db.cases.push(c); save(); return c;
  },
  async upsertById(tenantId: ID, id: ID, updates: Partial<LegalCase>) {
    const i = db.cases.findIndex(x=>x.id===id && x.tenantId===tenantId);
    if (i<0) { // أنشئ
      const title = updates.title || `قضية ${id.slice(0,6)}`;
      const clientId = updates.clientId || "C1";
      const primaryLawyerId = updates.primaryLawyerId || "U1";
      return await this.create(tenantId, title, clientId, primaryLawyerId, { id, ...updates });
    }
    db.cases[i] = { ...db.cases[i], ...updates, updatedAt: now() }; save(); return db.cases[i];
  },
  delete(tenantId: ID, id: ID): LegalCase | null {
    const i = db.cases.findIndex(x=>x.id===id && x.tenantId===tenantId);
    if (i<0) return null;
    const deleted = db.cases[i];
    db.cases.splice(i, 1);
    save();
    return deleted;
  },
  updateStatus(tenantId: ID, id: ID, status: any, reason?: string) {
    const case_ = this.get(tenantId, id);
    if (!case_) return null;
    case_.status = status;
    if (status === "CLOSED" || status === "RESOLVED") {
      case_.closedAt = now();
      case_.closedReason = reason;
    }
    case_.updatedAt = now();
    save();
    return case_;
  },
  updateStage(tenantId: ID, id: ID, stage: CaseStage, note?: string, by?: ID) {
    const case_ = this.get(tenantId, id);
    if (!case_) return null;
    
    // Add to stage history
    const historyEntry: CaseStageHistory = {
      id: uid(),
      tenantId,
      caseId: id,
      from: case_.stage,
      to: stage,
      at: now(),
      note,
      by
    };
    db.stages.push(historyEntry);
    
    case_.stage = stage;
    case_.updatedAt = now();
    save();
    return case_;
  },
  generateAIInsights(tenantId: ID, id: ID): AIInsights {
    const case_ = this.get(tenantId, id);
    if (!case_) throw new Error("Case not found");
    
    // Mock AI insights - in real implementation, this would call an AI service
    const insights: AIInsights = {
      caseComplexity: case_.type === "RENTAL_DISPUTE" ? "MODERATE" : "SIMPLE",
      successProbability: Math.floor(Math.random() * 40) + 60, // 60-100%
      estimatedDuration: case_.type === "RENTAL_DISPUTE" ? 90 : 60,
      recommendedActions: [
        "جمع جميع الوثائق المتعلقة بالعقد",
        "مراجعة تاريخ المدفوعات",
        "إعداد إنذار قانوني",
        "محاولة التسوية الودية"
      ],
      similarCases: ["CASE-001", "CASE-002"],
      riskFactors: [
        "عدم وجود وثائق كافية",
        "تعقيدات قانونية في العقد"
      ],
      opportunities: [
        "إمكانية التسوية الودية",
        "وجود سوابق قضائية مؤيدة"
      ],
      legalPrecedents: [
        "قرار محكمة الاستئناف رقم 123/2023",
        "حكم المحكمة العليا رقم 456/2022"
      ],
      costEstimate: {
        min: 500,
        max: 2000,
        average: 1200
      },
      timeline: [
        {
          phase: "التحقيق الأولي",
          estimatedDays: 14,
          dependencies: ["جمع الوثائق"]
        },
        {
          phase: "المفاوضات",
          estimatedDays: 30,
          dependencies: ["التحقيق الأولي"]
        },
        {
          phase: "رفع الدعوى",
          estimatedDays: 45,
          dependencies: ["المفاوضات"]
        }
      ]
    };
    
    case_.aiInsights = insights;
    case_.updatedAt = now();
    save();
    
    return insights;
  }
};

export const Stages = {
  history(t:ID,c:ID){return db.stages.filter(s=>s.tenantId===t && s.caseId===c);},
  add(h:CaseStageHistory){db.stages.push(h); save(); return h;},
  update(id:ID,patch:Partial<CaseStageHistory>){const i=db.stages.findIndex(s=>s.id===id); if(i<0)return null; db.stages[i]={...db.stages[i],...patch}; save(); return db.stages[i];},
  void(id:ID,reason:string){const i=db.stages.findIndex(s=>s.id===id); if(i<0)return null; db.stages[i].voided=true; db.stages[i].voidReason=reason; save(); return db.stages[i];}
};

export const Assignments = { history(t:ID,c:ID){return db.assigns.filter(a=>a.tenantId===t && a.caseId===c);}, addMany(list:CaseAssignment[]){list.forEach(a=>db.assigns.push(a)); save(); return list;} };

export const Directory = {
  list(t:ID,kind?:DirectoryKind){return (db.directory || []).filter(d=>d.tenantId===t && (!kind || d.kind===kind));},
  upsert(p: Omit<DirectoryPerson,"createdAt"|"updatedAt">){if(!db.directory) db.directory=[]; const i=db.directory.findIndex(d=>d.id===p.id && d.tenantId===p.tenantId); const t=now(); if(i>=0) db.directory[i]={...db.directory[i],...p,updatedAt:t}; else db.directory.push({...p,phoneNumbers:p.phoneNumbers||[],emails:p.emails||[],createdAt:t,updatedAt:t}); save(); return p.id;},
  importMany(t:ID,kind:DirectoryKind,entries:{subscriptionNo:string;name:string;id?:ID}[]){if(!db.directory) db.directory=[]; const out:DirectoryPerson[]=[]; for(const e of entries){const id=e.id||e.subscriptionNo; const person:Omit<DirectoryPerson,"createdAt"|"updatedAt">={id,tenantId:t,kind,subscriptionNo:e.subscriptionNo,name:e.name,phoneNumbers:[],emails:[]}; this.upsert(person); out.push({...person,createdAt:now(),updatedAt:now()} as DirectoryPerson);} return out;}
};

export const Audit = { add(a:AuditLog){db.audits.push(a); save();}, listByCase(t:ID,c:ID){return db.audits.filter(a=>a.tenantId===t && (a.entityId===c || (a.meta as any)?.caseId===c)).sort((x,y)=>+new Date(y.at)-+new Date(x.at));} };

export const Analytics = {
  generate(tenantId: ID): LegalAnalytics {
    const cases = (db.cases || []).filter(c => c.tenantId === tenantId);
    const expenses = (db.expenses || []).filter(e => e.tenantId === tenantId);
    
    const totalCases = cases.length;
    const activeCases = cases.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS").length;
    const closedCases = cases.filter(c => c.status === "CLOSED" || c.status === "RESOLVED").length;
    
    const totalRevenue = expenses
      .filter(e => e.category === "LEGAL_FEES" && !e.voided)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalExpenses = expenses
      .filter(e => !e.voided)
      .reduce((sum, e) => sum + e.amount, 0);
    
    const netProfit = totalRevenue - totalExpenses;
    
    // Calculate success rate
    const resolvedCases = cases.filter(c => c.status === "RESOLVED");
    const successRate = totalCases > 0 ? (resolvedCases.length / totalCases) * 100 : 0;
    
    // Calculate average resolution time
    const closedCasesWithDuration = cases.filter(c => c.closedAt && c.createdAt);
    const averageResolutionTime = closedCasesWithDuration.length > 0 
      ? closedCasesWithDuration.reduce((sum, c) => {
          const duration = new Date(c.closedAt!).getTime() - new Date(c.createdAt).getTime();
          return sum + (duration / (1000 * 60 * 60 * 24)); // Convert to days
        }, 0) / closedCasesWithDuration.length
      : 0;
    
    // Cases by type
    const casesByType = cases.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {} as Record<CaseType, number>);
    
    // Cases by status
    const casesByStatus = cases.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Cases by stage
    const casesByStage = cases.reduce((acc, c) => {
      acc[c.stage] = (acc[c.stage] || 0) + 1;
      return acc;
    }, {} as Record<CaseStage, number>);
    
    // Top performing lawyers
    const lawyerStats = new Map<ID, { casesWon: number; totalCases: number; revenue: number; name: string }>();
    
    cases.forEach(c => {
      const lawyer = db.directory.find(d => d.id === c.primaryLawyerId);
      if (lawyer) {
        const stats = lawyerStats.get(c.primaryLawyerId) || { casesWon: 0, totalCases: 0, revenue: 0, name: lawyer.name };
        stats.totalCases++;
        if (c.status === "RESOLVED") stats.casesWon++;
        
        const lawyerExpenses = expenses.filter(e => e.caseId === c.id && e.category === "LEGAL_FEES");
        stats.revenue += lawyerExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        lawyerStats.set(c.primaryLawyerId, stats);
      }
    });
    
    const topPerformingLawyers = Array.from(lawyerStats.entries())
      .map(([lawyerId, stats]) => ({
        lawyerId,
        name: stats.name,
        casesWon: stats.casesWon,
        successRate: stats.totalCases > 0 ? (stats.casesWon / stats.totalCases) * 100 : 0,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.successRate - a.successRate)
      .slice(0, 5);
    
    // Monthly trends (last 12 months)
    const monthlyTrends = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7);
      
      const monthCases = cases.filter(c => c.createdAt.startsWith(monthKey));
      const monthClosed = cases.filter(c => c.closedAt?.startsWith(monthKey));
      const monthExpenses = expenses.filter(e => e.at.startsWith(monthKey) && !e.voided);
      
      monthlyTrends.push({
        month: monthKey,
        casesOpened: monthCases.length,
        casesClosed: monthClosed.length,
        revenue: monthExpenses.filter(e => e.category === "LEGAL_FEES").reduce((sum, e) => sum + e.amount, 0),
        expenses: monthExpenses.reduce((sum, e) => sum + e.amount, 0)
      });
    }
    
    const analytics: LegalAnalytics = {
      totalCases,
      activeCases,
      closedCases,
      openCases: cases.filter(c => c.status === "OPEN").length,
      inProgressCases: cases.filter(c => c.status === "IN_PROGRESS").length,
      resolvedCases: cases.filter(c => c.status === "RESOLVED").length,
      averageResolutionTime: Math.round(averageResolutionTime),
      successRate: Math.round(successRate * 100) / 100,
      totalRevenue,
      totalExpenses,
      netProfit,
      casesByType,
      casesByStatus,
      casesByStage,
      topPerformingLawyers,
      monthlyTrends
    };
    
    // Store analytics
    if (!db.analytics) {
      db.analytics = [];
    }
    const existingIndex = db.analytics.findIndex((a: any) => a.tenantId === tenantId);
    if (existingIndex >= 0) {
      db.analytics[existingIndex] = { ...analytics, tenantId, generatedAt: now } as any;
    } else {
      db.analytics.push({ ...analytics, tenantId, generatedAt: now } as any);
    }
    save();
    
    return analytics;
  }
};

export const Predictions = {
  generate(tenantId: ID, caseId: ID): CasePrediction {
    const case_ = Cases.get(tenantId, caseId);
    if (!case_) throw new Error("Case not found");
    
    // Mock prediction - in real implementation, this would use ML models
    const similarCases = db.cases.filter(c => 
      c.tenantId === tenantId && 
      c.id !== caseId && 
      c.type === case_.type &&
      c.status === "RESOLVED"
    ).slice(0, 5);
    
    const prediction: CasePrediction = {
      caseId,
      predictedOutcome: case_.type === "RENTAL_DISPUTE" ? "SETTLEMENT" : "WIN",
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      estimatedDuration: case_.type === "RENTAL_DISPUTE" ? 90 : 60,
      estimatedCost: case_.type === "RENTAL_DISPUTE" ? 1200 : 800,
      riskFactors: [
        "عدم وجود وثائق كافية",
        "تعقيدات قانونية في العقد",
        "مقاومة الطرف الآخر"
      ],
      recommendedStrategy: [
        "جمع جميع الوثائق المتعلقة بالعقد",
        "إعداد إنذار قانوني قوي",
        "محاولة التسوية الودية أولاً",
        "الاستعداد للدعوى القضائية"
      ],
      similarCases: similarCases.map(c => ({
        caseId: c.id,
        title: c.title,
        outcome: c.status === "RESOLVED" ? "WIN" : "LOSE",
        duration: c.closedAt ? Math.floor((new Date(c.closedAt).getTime() - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        cost: c.actualCost || 0
      }))
    };
    
    // Store prediction
    const existingIndex = db.predictions.findIndex(p => p.caseId === caseId);
    if (existingIndex >= 0) {
      db.predictions[existingIndex] = prediction;
    } else {
      db.predictions.push(prediction);
    }
    save();
    
    return prediction;
  },
  
  get(tenantId: ID, caseId: ID): CasePrediction | null {
    return db.predictions.find(p => p.caseId === caseId) || null;
  }
};

export const Workflows = {
  list(tenantId: ID, caseType?: CaseType): LegalWorkflow[] {
    return db.workflows.filter(w => w.isActive && (!caseType || w.caseType === caseType));
  },
  
  get(tenantId: ID, id: ID): LegalWorkflow | null {
    return db.workflows.find(w => w.id === id) || null;
  },
  
  create(tenantId: ID, workflow: Omit<LegalWorkflow, 'id' | 'createdAt' | 'updatedAt'>): LegalWorkflow {
    const newWorkflow: LegalWorkflow = {
      ...workflow,
      id: uid(),
      createdAt: now(),
      updatedAt: now()
    };
    db.workflows.push(newWorkflow);
    save();
    return newWorkflow;
  }
};

export const Transfers = {
  list(tenantId: ID, caseId?: ID): CaseTransfer[] {
    return db.transfers.filter(t => t.tenantId === tenantId && (!caseId || t.caseId === caseId));
  },
  
  get(tenantId: ID, id: ID): CaseTransfer | null {
    return db.transfers.find(t => t.tenantId === tenantId && t.id === id) || null;
  },
  
  create(tenantId: ID, transfer: Omit<CaseTransfer, 'id' | 'transferNumber' | 'transferredAt'>): CaseTransfer {
    const { getNextTransferNumber } = require('../serialNumbers');
    const newTransfer: CaseTransfer = {
      ...transfer,
      id: uid(),
      transferNumber: getNextTransferNumber(),
      transferredAt: now()
    };
    db.transfers.push(newTransfer);
    save();
    return newTransfer;
  },
  
  updateStatus(tenantId: ID, id: ID, status: TransferStatus, updatedBy: ID, notes?: string): CaseTransfer | null {
    const transfer = this.get(tenantId, id);
    if (!transfer) return null;
    
    transfer.status = status;
    
    if (status === 'ACCEPTED') {
      transfer.acceptedAt = now();
      transfer.acceptedBy = updatedBy;
    } else if (status === 'REJECTED') {
      transfer.rejectedAt = now();
      transfer.rejectedBy = updatedBy;
      transfer.rejectionReason = notes;
    }
    
    save();
    return transfer;
  }
};

export const Appointments = {
  list(tenantId: ID, caseId?: ID): LegalAppointment[] {
    return db.appointments.filter(a => a.tenantId === tenantId && (!caseId || a.caseId === caseId));
  },
  
  get(tenantId: ID, id: ID): LegalAppointment | null {
    return db.appointments.find(a => a.tenantId === tenantId && a.id === id) || null;
  },
  
  create(tenantId: ID, appointment: Omit<LegalAppointment, 'id'>): LegalAppointment {
    const newAppointment: LegalAppointment = {
      ...appointment,
      id: uid()
    };
    db.appointments.push(newAppointment);
    save();
    return newAppointment;
  },
  
  updateStatus(tenantId: ID, id: ID, status: string): LegalAppointment | null {
    const appointment = this.get(tenantId, id);
    if (!appointment) return null;
    
    appointment.status = status as any;
    save();
    return appointment;
  }
};

export const LegalTasks = {
  list(tenantId: ID, caseId?: ID, assignedTo?: ID): LegalTask[] {
    return db.legalTasks.filter(t => 
      t.tenantId === tenantId && 
      (!caseId || t.caseId === caseId) &&
      (!assignedTo || t.assignedTo === assignedTo)
    );
  },
  
  get(tenantId: ID, id: ID): LegalTask | null {
    return db.legalTasks.find(t => t.tenantId === tenantId && t.id === id) || null;
  },
  
  create(tenantId: ID, task: Omit<LegalTask, 'id'>): LegalTask {
    const newTask: LegalTask = {
      ...task,
      id: uid()
    };
    db.legalTasks.push(newTask);
    save();
    return newTask;
  },
  
  updateStatus(tenantId: ID, id: ID, status: string, completedBy?: ID): LegalTask | null {
    const task = this.get(tenantId, id);
    if (!task) return null;
    
    task.status = status as any;
    
    if (status === 'COMPLETED') {
      task.completedAt = now();
      task.completedBy = completedBy;
    }
    
    save();
    return task;
  }
};

export const Messages = {
  list(tenantId: ID, caseId?: ID): CaseMessage[] {
    return db.msgs.filter(m => m.tenantId === tenantId && (!caseId || m.caseId === caseId));
  },
  
  get(tenantId: ID, id: ID): CaseMessage | null {
    return db.msgs.find(m => m.tenantId === tenantId && m.id === id) || null;
  },
  
  add(tenantId: ID, caseId: ID, message: Omit<CaseMessage, 'id' | 'tenantId' | 'caseId' | 'createdAt'>): CaseMessage {
    const newMessage: CaseMessage = {
      id: uid(),
      tenantId,
      caseId,
      by: message.createdBy || message.by || 'U1',
      text: message.content || message.text || '',
      at: now(),
      content: message.content,
      type: message.type,
      createdBy: message.createdBy,
      createdAt: now(),
      attachments: message.attachments
    };
    db.msgs.push(newMessage);
    save();
    return newMessage;
  },
  
  update(tenantId: ID, id: ID, updates: Partial<CaseMessage>): CaseMessage | null {
    const message = this.get(tenantId, id);
    if (!message) return null;
    
    Object.assign(message, updates);
    save();
    return message;
  },
  
  delete(tenantId: ID, id: ID): boolean {
    const index = db.msgs.findIndex(m => m.tenantId === tenantId && m.id === id);
    if (index === -1) return false;
    
    db.msgs.splice(index, 1);
    save();
    return true;
  }
};

export const Expenses = {
  list(tenantId: ID, caseId?: ID): Expense[] {
    return db.expenses.filter(e => e.tenantId === tenantId && (!caseId || e.caseId === caseId));
  },
  
  get(tenantId: ID, id: ID): Expense | null {
    return db.expenses.find(e => e.tenantId === tenantId && e.id === id) || null;
  },
  
  add(tenantId: ID, caseId: ID, expense: Omit<Expense, 'id' | 'tenantId' | 'caseId'>): Expense {
    const newExpense: Expense = {
      id: uid(),
      tenantId,
      caseId,
      by: expense.createdBy || expense.by || 'U1',
      label: expense.description || expense.label || '',
      amount: expense.amount,
      at: expense.date || expense.at || now(),
      type: expense.type,
      date: expense.date,
      status: expense.status || 'pending',
      receipt: expense.receipt,
      createdBy: expense.createdBy,
      category: expense.type === 'legal_fee' ? 'LEGAL_FEES' : 
                expense.type === 'court_fee' ? 'COURT_FEES' :
                expense.type === 'document_fee' ? 'DOCUMENTATION' :
                expense.type === 'travel' ? 'TRAVEL' : 'OTHER',
      description: expense.description
    };
    db.expenses.push(newExpense);
    save();
    return newExpense;
  },
  
  update(tenantId: ID, id: ID, updates: Partial<Expense>): Expense | null {
    const expense = this.get(tenantId, id);
    if (!expense) return null;
    
    Object.assign(expense, updates);
    save();
    return expense;
  },
  
  delete(tenantId: ID, id: ID): boolean {
    const index = db.expenses.findIndex(e => e.tenantId === tenantId && e.id === id);
    if (index === -1) return false;
    
    db.expenses.splice(index, 1);
    save();
    return true;
  }
};

export const Documents = {
  list(tenantId: ID, caseId?: ID): CaseDocument[] {
    return db.docs.filter(d => d.tenantId === tenantId && (!caseId || d.caseId === caseId));
  },
  
  get(tenantId: ID, id: ID): CaseDocument | null {
    return db.docs.find(d => d.tenantId === tenantId && d.id === id) || null;
  },
  
  add(tenantId: ID, caseId: ID, document: Omit<CaseDocument, 'id' | 'tenantId' | 'caseId' | 'uploadedAt'>): CaseDocument {
    const newDocument: CaseDocument = {
      id: uid(),
      tenantId,
      caseId,
      name: document.name,
      mime: document.type || 'application/octet-stream',
      size: document.size || 0,
      url: document.url,
      version: 1,
      uploadedBy: document.uploadedBy || 'U1',
      confidentiality: 'INTERNAL',
      documentType: 'OTHER',
      description: document.name,
      createdAt: now(),
      type: document.type,
      uploadedAt: now()
    };
    db.docs.push(newDocument);
    save();
    return newDocument;
  },
  
  update(tenantId: ID, id: ID, updates: Partial<CaseDocument>): CaseDocument | null {
    const document = this.get(tenantId, id);
    if (!document) return null;
    
    Object.assign(document, updates);
    save();
    return document;
  },
  
  delete(tenantId: ID, id: ID): boolean {
    const index = db.docs.findIndex(d => d.tenantId === tenantId && d.id === id);
    if (index === -1) return false;
    
    db.docs.splice(index, 1);
    save();
    return true;
  }
};
