import { useState, useRef, useEffect } from "react";
import {
  Bell, ChevronDown, Filter, Download, MoreHorizontal, TrendingUp, TrendingDown,
  DollarSign, ArrowUpRight, CheckCircle, Clock, XCircle, Send, Mail, Phone, Users,
  Shield, Home, X, Eye, EyeOff, Upload, FileText, MessageSquare, Paperclip,
  ChevronRight, CreditCard, Landmark, Plus, GraduationCap, Building2, User,
  AlertCircle, CheckSquare, Square, ChevronLeft, Star,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "leads" | "loans" | "remittance" | "accommodation" | "cards" | "accounts";
type LeadStatus = "hot" | "warm" | "cold" | "lost";
type CallStatus = "connected" | "not_attempted" | "rescheduled" | "rejected";
type LoanStage = "application_started" | "doc_pending" | "doc_received" | "call_scheduled" | "sanctioned" | "disbursed" | "lost";
type LenderStage = "not_applied" | "applied" | "doc_pending" | "under_review" | "sanctioned" | "disbursed" | "rejected";

interface Lead {
  id: string; name: string; phone: string; products: string[]; status: LeadStatus;
  callStatus: CallStatus; rescheduleDate: string; intake: string; country: string;
  loanAppId?: string;
}
interface Comment { id: string; author: string; text: string; time: string; }
interface LeadDoc { id: string; name: string; size: string; date: string; type: string; }

interface LenderInfo {
  name: string; pos: number; stage: LenderStage;
  loginDate?: string; loginAmt?: string; sanctionDate?: string; sanctionAmt?: string;
  roi?: string; pfAmt?: string; pfDate?: string; disbDate?: string; disbAmt?: string; trancheNo?: string;
}

interface DocItem { name: string; uploaded: boolean; }
interface DocChecklist {
  p0: DocItem[]; p1: DocItem[]; p2: DocItem[]; p3: DocItem[];
}

interface LoanApp {
  id: string; zlId: string; student: string; university: string; course: string;
  targetCountry: string; intake: string; loanAmount: string;
  loanType: "collateral" | "non-collateral"; coAppType: "salaried" | "self-employed";
  stage: LoanStage; zrm: string; lrm: string;
  callStatus: CallStatus;
  connectivityStatus: "connected" | "not_attempted" | "abroad" | "not_reachable";
  abroadStatus: "in-india" | "departed" | "enrolled";
  lenders: LenderInfo[]; docs: DocChecklist;
  notes: string[]; rescheduleDate: string;
}

interface Remittance {
  zlId: string; sender: string; receiver: string; amount: string;
  converted: string; currency: string; status: "completed" | "processing" | "failed";
  date: string; fee: string; rescheduleDate: string; callStatus: CallStatus;
}
interface Accommodation {
  id: string; applicant: string; property: string; city: string; rent: string;
  moveIn: string; status: "approved" | "pending" | "reviewing"; lease: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const leads: Lead[] = [
  { id: "ZL-4821", name: "Priya Sharma",   phone: "+91 98765 43210", products: ["Global Credit Card", "Education Loan"], status: "hot",  callStatus: "connected",     rescheduleDate: "Jun 25, 2026", intake: "Fall 26",   country: "India",       loanAppId: "EL-1039" },
  { id: "ZL-4820", name: "Arjun Patel",    phone: "+91 91234 56789", products: ["Remittance"],                           status: "warm", callStatus: "rescheduled",   rescheduleDate: "Jun 27, 2026", intake: "Spring 27", country: "India"                        },
  { id: "ZL-4819", name: "Meera Nair",     phone: "+234 803 456 7890", products: ["Education Loan", "Remittance", "Accommodation"], status: "cold", callStatus: "not_attempted", rescheduleDate: "Jul 2, 2026",  intake: "Fall 26",   country: "Nigeria",     loanAppId: "EL-1035" },
  { id: "ZL-4818", name: "Karan Mehta",    phone: "+91 99887 76655", products: ["Global Credit Card", "Education Loan"], status: "hot",  callStatus: "connected",     rescheduleDate: "Jun 24, 2026", intake: "Summer 27", country: "India",       loanAppId: "EL-1037" },
  { id: "ZL-4817", name: "Divya Krishnan", phone: "+63 917 123 4567", products: ["Education Loan"],                      status: "lost", callStatus: "rejected",      rescheduleDate: "—",            intake: "Fall 26",   country: "Philippines"                  },
  { id: "ZL-4816", name: "Rahul Gupta",    phone: "+91 98001 12345", products: ["Education Loan", "Accommodation"],      status: "hot",  callStatus: "connected",     rescheduleDate: "Jun 23, 2026", intake: "Spring 27", country: "India",       loanAppId: "EL-1041" },
  { id: "ZL-4815", name: "Ananya Iyer",    phone: "+52 55 1234 5678", products: ["Remittance", "Global Credit Card"],    status: "warm", callStatus: "rescheduled",   rescheduleDate: "Jun 28, 2026", intake: "Summer 27", country: "Mexico",      loanAppId: "EL-1031" },
  { id: "ZL-4814", name: "Suresh Reddy",   phone: "+91 70123 45678", products: ["Education Loan"],                      status: "cold", callStatus: "not_attempted", rescheduleDate: "Jul 5, 2026",  intake: "Fall 27",   country: "India"                        },
];

const leadComments: Record<string, Comment[]> = {
  "ZL-4821": [
    { id: "c1", author: "Rohan M.", text: "Called Priya — interested in the Global Card, wants to know more about the credit limit.", time: "Jun 18, 2026 · 11:32 AM" },
    { id: "c2", author: "Sneha K.", text: "Follow-up scheduled for Jun 25. She's comparing with HDFC offer.", time: "Jun 19, 2026 · 2:15 PM" },
  ],
  "ZL-4820": [{ id: "c1", author: "Sneha K.", text: "Call rescheduled — Arjun was travelling. Booked for Jun 27.", time: "Jun 17, 2026 · 9:00 AM" }],
  "ZL-4819": [], "ZL-4814": [],
  "ZL-4818": [{ id: "c1", author: "Rohan M.", text: "Strong lead. Karan approved in principle for the Global Card.", time: "Jun 16, 2026 · 4:10 PM" }],
  "ZL-4817": [{ id: "c1", author: "Vikram S.", text: "Divya chose a competitor. Marking as lost.", time: "Jun 15, 2026 · 1:45 PM" }],
  "ZL-4816": [
    { id: "c1", author: "Rohan M.", text: "Rahul is relocating for work. Interested in both home loan and accommodation assistance.", time: "Jun 14, 2026 · 10:00 AM" },
    { id: "c2", author: "Rohan M.", text: "Shared loan eligibility document. High intent.", time: "Jun 15, 2026 · 11:00 AM" },
  ],
  "ZL-4815": [{ id: "c1", author: "Sneha K.", text: "Ananya needs to send ₹6L to India. Showed her the Zolve rate vs. wire transfer.", time: "Jun 13, 2026 · 3:30 PM" }],
};

const leadDocuments: Record<string, LeadDoc[]> = {
  "ZL-4821": [
    { id: "d1", name: "Passport_PriyaSharma.pdf", size: "1.2 MB", date: "Jun 18, 2026", type: "pdf" },
    { id: "d2", name: "Bank_Statement_6mo.pdf", size: "840 KB", date: "Jun 18, 2026", type: "pdf" },
  ],
  "ZL-4816": [{ id: "d1", name: "Loan_Eligibility_Letter.pdf", size: "310 KB", date: "Jun 15, 2026", type: "pdf" }],
  "ZL-4818": [{ id: "d1", name: "Karan_ID_Proof.jpg", size: "580 KB", date: "Jun 16, 2026", type: "img" }],
};

const mkDocs = (p0u: number, p1u: number, p2u: number, hasCollateral: boolean): DocChecklist => ({
  p0: [
    { name: "Student PAN", uploaded: p0u > 0 },
    { name: "Student Aadhaar", uploaded: p0u > 1 },
    { name: "Student Passport", uploaded: p0u > 2 },
    { name: "Co-Applicant PAN", uploaded: p0u > 3 },
    { name: "Co-Applicant Aadhaar", uploaded: p0u > 4 },
    { name: "Electricity Bill", uploaded: p0u > 5 },
  ],
  p1: [
    { name: "University Admit Letter", uploaded: p1u > 0 },
    { name: "GRE / TOEFL Scorecard", uploaded: p1u > 1 },
    { name: "10th Marksheet", uploaded: p1u > 2 },
    { name: "12th Marksheet", uploaded: p1u > 3 },
    { name: "UG Degree / Marksheets", uploaded: p1u > 4 },
  ],
  p2: [
    { name: "Co-App Salary Slips (3 mo)", uploaded: p2u > 0 },
    { name: "Co-App Bank Statements (6 mo)", uploaded: p2u > 1 },
    { name: "Co-App ITR / Form 16", uploaded: p2u > 2 },
    { name: "Student Bank Statements", uploaded: p2u > 3 },
  ],
  p3: hasCollateral ? [
    { name: "Registered Sale Deed", uploaded: false },
    { name: "Mutation / OC / CC", uploaded: false },
    { name: "Index II / Share Certificate", uploaded: false },
    { name: "Layout Map / Plan", uploaded: false },
    { name: "NA Certificate", uploaded: false },
  ] : [],
});

const loanApps: LoanApp[] = [
  {
    id: "EL-1041", zlId: "ZL-4816", callStatus: "connected" as CallStatus, student: "Rahul Gupta", university: "Carnegie Mellon University",
    course: "MS Computer Science", targetCountry: "USA", intake: "Fall 26",
    loanAmount: "₹45,00,000", loanType: "non-collateral", coAppType: "salaried",
    stage: "doc_received", zrm: "Rohan M.", lrm: "Sunita K.",
    connectivityStatus: "connected", abroadStatus: "in-india",
    docs: mkDocs(6, 5, 3, false),
    rescheduleDate: "Jun 25, 2026",
    notes: ["Student is highly motivated. GRE 325. CMU admit confirmed.", "Co-app is salaried at TCS with ₹18L annual income."],
    lenders: [
      { name: "HDFC Credila", pos: 88, stage: "under_review", loginDate: "Jun 10, 2026", loginAmt: "₹42L", roi: "11.5%", pfAmt: "₹42,000" },
      { name: "Avanse", pos: 72, stage: "doc_pending" },
      { name: "Auxilo", pos: 65, stage: "applied" },
      { name: "Prodigy Finance", pos: 81, stage: "not_applied" },
    ],
  },
  {
    id: "EL-1039", zlId: "ZL-4821", callStatus: "rescheduled" as CallStatus, student: "Priya Sharma", university: "University of Texas at Austin",
    course: "MS Data Science", targetCountry: "USA", intake: "Fall 26",
    loanAmount: "₹38,00,000", loanType: "collateral", coAppType: "self-employed",
    stage: "call_scheduled", zrm: "Sneha K.", lrm: "Vikram L.",
    connectivityStatus: "connected", abroadStatus: "in-india",
    docs: mkDocs(4, 3, 1, true),
    rescheduleDate: "Jun 27, 2026",
    notes: ["Co-app has property in Pune being pledged as collateral.", "Valuation pending."],
    lenders: [
      { name: "HDFC Credila", pos: 91, stage: "applied" },
      { name: "Avanse", pos: 84, stage: "not_applied" },
      { name: "SBI Scholar Loan", pos: 76, stage: "not_applied" },
    ],
  },
  {
    id: "EL-1037", zlId: "ZL-4818", callStatus: "connected" as CallStatus, student: "Karan Mehta", university: "Northeastern University",
    course: "MBA", targetCountry: "USA", intake: "Spring 27",
    loanAmount: "₹52,00,000", loanType: "non-collateral", coAppType: "salaried",
    stage: "sanctioned", zrm: "Rohan M.", lrm: "Sunita K.",
    connectivityStatus: "connected", abroadStatus: "in-india",
    docs: mkDocs(6, 5, 4, false),
    rescheduleDate: "—",
    notes: ["HDFC Credila sanctioned. Disbursement in 2 tranches after i20."],
    lenders: [
      { name: "HDFC Credila", pos: 94, stage: "sanctioned", loginDate: "May 20, 2026", loginAmt: "₹50L", sanctionDate: "Jun 5, 2026", sanctionAmt: "₹50L", roi: "10.75%", pfAmt: "₹50,000" },
      { name: "Auxilo", pos: 70, stage: "rejected" },
    ],
  },
  {
    id: "EL-1035", zlId: "ZL-4819", callStatus: "not_attempted" as CallStatus, student: "Meera Nair", university: "University of Melbourne",
    course: "MS Finance", targetCountry: "Australia", intake: "Summer 27",
    loanAmount: "₹28,00,000", loanType: "non-collateral", coAppType: "salaried",
    stage: "doc_pending", zrm: "Vikram S.", lrm: "",
    connectivityStatus: "not_reachable", abroadStatus: "in-india",
    docs: mkDocs(2, 1, 0, false),
    rescheduleDate: "Jul 3, 2026",
    notes: ["Student unresponsive. Tried calling 3 times. WhatsApp sent."],
    lenders: [
      { name: "Avanse", pos: 61, stage: "not_applied" },
      { name: "Prodigy Finance", pos: 74, stage: "not_applied" },
      { name: "MPower Financing", pos: 68, stage: "not_applied" },
    ],
  },
  {
    id: "EL-1031", zlId: "ZL-4815", callStatus: "connected" as CallStatus, student: "Ananya Iyer", university: "University of Toronto",
    course: "MS Electrical Engg.", targetCountry: "Canada", intake: "Fall 26",
    loanAmount: "₹35,00,000", loanType: "non-collateral", coAppType: "salaried",
    stage: "disbursed", zrm: "Sneha K.", lrm: "Vikram L.",
    connectivityStatus: "abroad", abroadStatus: "enrolled",
    docs: mkDocs(6, 5, 4, false),
    rescheduleDate: "—",
    notes: ["Fully disbursed in 2 tranches. Student enrolled in Sep 2025."],
    lenders: [
      { name: "Avanse", pos: 85, stage: "disbursed", loginDate: "Jan 10, 2026", loginAmt: "₹34L", sanctionDate: "Feb 1, 2026", sanctionAmt: "₹34L", roi: "11.2%", disbDate: "Aug 15, 2026", disbAmt: "₹34L", trancheNo: "2" },
      { name: "Prodigy Finance", pos: 79, stage: "not_applied" },
    ],
  },
];

const remittances: Remittance[] = [
  { zlId: "ZL-4819", sender: "Meera Nair",   receiver: "Lakshmi Nair",  amount: "$8,200",  converted: "₹6,83,460",  currency: "INR", status: "completed",  date: "Jun 18, 2026", fee: "$3.99",  rescheduleDate: "—",            callStatus: "connected"     },
  { zlId: "ZL-4815", sender: "Ananya Iyer",  receiver: "Chandru Iyer",  amount: "$15,600", converted: "₹12,99,480", currency: "INR", status: "processing", date: "Jun 17, 2026", fee: "$7.99",  rescheduleDate: "Jun 24, 2026", callStatus: "rescheduled"   },
  { zlId: "ZL-4821", sender: "Priya Sharma", receiver: "Sunita Sharma", amount: "$4,000",  converted: "₹3,33,200",  currency: "INR", status: "completed",  date: "Jun 15, 2026", fee: "$2.99",  rescheduleDate: "—",            callStatus: "connected"     },
  { zlId: "ZL-4820", sender: "Arjun Patel",  receiver: "Mona Patel",    amount: "$22,500", converted: "AED 82,575", currency: "AED", status: "failed",     date: "Jun 14, 2026", fee: "$11.99", rescheduleDate: "Jun 28, 2026", callStatus: "not_attempted" },
  { zlId: "ZL-4818", sender: "Karan Mehta",  receiver: "Geeta Mehta",   amount: "$6,800",  converted: "₹5,66,520",  currency: "INR", status: "completed",  date: "Jun 13, 2026", fee: "$3.99",  rescheduleDate: "—",            callStatus: "connected"     },
];

const accommodations: Accommodation[] = [
  { id: "AC-3041", applicant: "Rahul Gupta", property: "Sunrise Apts 2B", city: "San Jose, CA", rent: "$2,400/mo", moveIn: "Jul 1, 2026", status: "approved", lease: "12 months" },
  { id: "AC-3039", applicant: "Priya Sharma", property: "Oakhurst Studio", city: "Fremont, CA", rent: "$1,850/mo", moveIn: "Jul 15, 2026", status: "pending", lease: "6 months" },
  { id: "AC-3037", applicant: "Meera Nair", property: "Harbor View 4A", city: "Oakland, CA", rent: "$2,100/mo", moveIn: "Aug 1, 2026", status: "reviewing", lease: "12 months" },
  { id: "AC-3034", applicant: "Karan Mehta", property: "Willow Creek 1B", city: "Santa Clara, CA", rent: "$2,650/mo", moveIn: "Jul 1, 2026", status: "approved", lease: "24 months" },
  { id: "AC-3028", applicant: "Ananya Iyer", property: "The Glenview 3C", city: "San Francisco, CA", rent: "$3,200/mo", moveIn: "Jun 28, 2026", status: "pending", lease: "12 months" },
];

// ─── Status configs ────────────────────────────────────────────────────────────

const leadStatusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  hot:  { label: "Hot",  color: "#b91c1c", bg: "#fee2e2" },
  warm: { label: "Warm", color: "#92400e", bg: "#fef3c7" },
  cold: { label: "Cold", color: "#1e40af", bg: "#dbeafe" },
  lost: { label: "Lost", color: "#4b5563", bg: "#f3f4f6" },
};

const callStatusConfig: Record<CallStatus, { label: string; color: string; bg: string }> = {
  connected:     { label: "Connected",     color: "#007a55", bg: "#d1fae5" },
  not_attempted: { label: "Not Attempted", color: "#6b7280", bg: "#f3f4f6" },
  rescheduled:   { label: "Rescheduled",   color: "#1d4ed8", bg: "#dbeafe" },
  rejected:      { label: "Rejected",      color: "#991b1b", bg: "#fee2e2" },
};

const loanStageConfig: Record<LoanStage, { label: string; color: string; bg: string; step: number }> = {
  application_started: { label: "Application Started", color: "#6b7280", bg: "#f3f4f6", step: 1 },
  doc_pending:         { label: "Doc Pending",         color: "#b45309", bg: "#fef3c7", step: 2 },
  doc_received:        { label: "Doc Received",        color: "#cc5500", bg: "#fff2e8", step: 3 },
  call_scheduled:      { label: "Call Scheduled",      color: "#7c3aed", bg: "#ede9fe", step: 4 },
  sanctioned:          { label: "Sanctioned",          color: "#007a55", bg: "#d1fae5", step: 5 },
  disbursed:           { label: "Disbursed",           color: "#005940", bg: "#ccf5e7", step: 6 },
  lost:                { label: "Lost",                color: "#991b1b", bg: "#fee2e2", step: 0 },
};

const lenderStageConfig: Record<LenderStage, { label: string; color: string; bg: string }> = {
  not_applied:  { label: "Not Applied",  color: "#6b7280", bg: "#f3f4f6" },
  applied:      { label: "Applied",      color: "#1d4ed8", bg: "#dbeafe" },
  doc_pending:  { label: "Doc Pending",  color: "#b45309", bg: "#fef3c7" },
  under_review: { label: "Under Review", color: "#7c3aed", bg: "#ede9fe" },
  sanctioned:   { label: "Sanctioned",   color: "#007a55", bg: "#d1fae5" },
  disbursed:    { label: "Disbursed",    color: "#005940", bg: "#ccf5e7" },
  rejected:     { label: "Rejected",     color: "#991b1b", bg: "#fee2e2" },
};

const remitStatusConfig = {
  completed: { label: "Completed", color: "#007a55", bg: "#d1fae5" },
  processing: { label: "Processing", color: "#1d4ed8", bg: "#dbeafe" },
  failed:    { label: "Failed",    color: "#991b1b", bg: "#fee2e2" },
};

const accomStatusConfig = {
  approved: { label: "Approved", color: "#007a55", bg: "#d1fae5" },
  pending:  { label: "Pending",  color: "#92400e", bg: "#fef3c7" },
  reviewing:{ label: "Reviewing",color: "#1d4ed8", bg: "#dbeafe" },
};

const productColors: Record<string, { color: string; bg: string }> = {
  "Global Credit Card": { color: "#cc5500", bg: "#fff2e8" },
  "Education Loan":     { color: "#0d1521", bg: "#e8eaf0" },
  "Remittance":         { color: "#005940", bg: "#ccf5e7" },
  "Accommodation":      { color: "#7c3aed", bg: "#ede9fe" },
};

// Maps a product name to its CRM tab
const productTabMap: Record<string, Tab> = {
  "Education Loan":     "loans",
  "Remittance":         "remittance",
  "Accommodation":      "accommodation",
  "Global Credit Card": "cards",
};
function productStyle(name: string) { return productColors[name] ?? { color: "#374151", bg: "#f3f4f6" }; }

// ─── Shared UI ────────────────────────────────────────────────────────────────

function StatusBadge({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap" style={{ color, backgroundColor: bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub, trend, icon: Icon, accent }: {
  label: string; value: string; sub: string; trend: "up" | "down"; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
          <Icon size={15} style={{ color: accent }} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend === "up" ? <TrendingUp size={12} className="text-[#00c48c]" /> : <TrendingDown size={12} className="text-red-600" />}
          <span className={`text-xs font-medium ${trend === "up" ? "text-[#00c48c]" : "text-red-600"}`}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function ColFilter<T extends string>({ label, options, value, onChange }: {
  label: string; options: { value: T | "all"; label: string }[]; value: T | "all"; onChange: (v: T | "all") => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const active = value !== "all";
  return (
    <div className="relative inline-flex items-center gap-1 select-none" ref={ref}>
      <button onClick={() => setOpen(!open)} className={`flex items-center gap-1 ${active ? "text-primary" : "text-muted-foreground"}`}>
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        <Filter size={10} className={active ? "text-primary" : "text-muted-foreground/60"} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px]">
          {options.map((o) => (
            <button key={o.value} onClick={() => { onChange(o.value as T | "all"); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-[var(--input-background)] transition-colors ${value === o.value ? "text-primary font-medium" : "text-foreground"}`}>
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ placeholder, defaultValue }: { placeholder?: string; defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue ?? "");
  return (
    <input value={val} onChange={e => setVal(e.target.value)} placeholder={placeholder}
      className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
  );
}

function Select({ options, defaultValue }: { options: string[]; defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue ?? options[0] ?? "");
  return (
    <div className="relative">
      <select value={val} onChange={e => setVal(e.target.value)}
        className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );
}

// ─── Lead Detail Popup ─────────────────────────────────────────────────────────

function LeadDetailPopup({ lead, onClose, onUpdate, onStartApp, onNavigate, onStartProduct }: {
  lead: Lead; onClose: () => void; onUpdate: (changes: Partial<Lead>) => void;
  onStartApp: () => void; onNavigate: (tab: Tab) => void; onStartProduct: (product: string) => void;
}) {
  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState<Comment[]>(leadComments[lead.id] ?? []);
  const [docs, setDocs] = useState<LeadDoc[]>(leadDocuments[lead.id] ?? []);
  const [tab, setTab] = useState<"comments" | "documents" | "loan">("comments");
  const fileRef = useRef<HTMLInputElement>(null);
  const linkedLoan = lead.loanAppId ? loanApps.find(l => l.id === lead.loanAppId) : null;

  function addComment() {
    if (!newComment.trim()) return;
    setComments(p => [...p, { id: `c${Date.now()}`, author: "Rohan M.", text: newComment.trim(), time: "Just now" }]);
    setNewComment("");
  }
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    setDocs(p => [...p, { id: `d${Date.now()}`, name: f.name, size: `${(f.size / 1024).toFixed(0)} KB`, date: "Just now", type: f.name.endsWith(".pdf") ? "pdf" : "img" }]);
    e.target.value = "";
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-xl mx-4 flex flex-col overflow-hidden max-h-[90vh]">
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{lead.id}</span>
              <InlineBadgeSelect
                value={lead.status}
                options={Object.entries(leadStatusConfig).map(([v, c]) => ({ value: v as LeadStatus, ...c }))}
                onChange={v => onUpdate({ status: v })}
              />
              <InlineBadgeSelect
                value={lead.callStatus}
                options={Object.entries(callStatusConfig).map(([v, c]) => ({ value: v as CallStatus, ...c }))}
                onChange={v => onUpdate({ callStatus: v })}
              />
            </div>
            <h2 className="text-base font-semibold text-foreground mt-1">{lead.name}</h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {lead.products.map((p) => { const s = productStyle(p); return <span key={p} className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ color: s.color, backgroundColor: s.bg }}>{p}</span>; })}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors mt-0.5 shrink-0"><X size={15} className="text-muted-foreground" /></button>
        </div>
        <div className="flex items-center gap-4 px-6 py-2.5 bg-[var(--input-background)] border-b border-border text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1"><Phone size={10} /><span className="font-mono text-foreground">{lead.phone}</span></span>
          <span>Intake: <span className="text-foreground font-medium">{lead.intake}</span></span>
          <span>Country: <span className="text-foreground font-medium">{lead.country}</span></span>
          <span className="flex items-center gap-1.5">
            Reschedule:
            <InlineTextEdit
              value={lead.rescheduleDate === "—" ? "" : lead.rescheduleDate}
              placeholder="Set date"
              onChange={v => onUpdate({ rescheduleDate: v || "—" })}
            />
          </span>
        </div>
        <div className="flex border-b border-border px-6">
          {(["comments", "documents", "loan"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 py-3 mr-5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t === "comments" && <><MessageSquare size={13} />Comments{comments.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">{comments.length}</span>}</>}
              {t === "documents" && <><Paperclip size={13} />Documents{docs.length > 0 && <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground">{docs.length}</span>}</>}
              {t === "loan" && <><ArrowUpRight size={13} />Products</>}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {tab === "comments" && (
            <div className="flex flex-col gap-4">
              {comments.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No comments yet.</div>}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0 mt-0.5">{c.author.split(" ").map(w => w[0]).join("")}</div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2"><span className="text-xs font-semibold text-foreground">{c.author}</span><span className="text-[11px] text-muted-foreground">{c.time}</span></div>
                    <p className="text-sm text-foreground mt-0.5 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "documents" && (
            <div className="flex flex-col gap-3">
              {docs.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No documents uploaded yet.</div>}
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-[var(--input-background)] transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0"><FileText size={14} className="text-primary" /></div>
                  <div className="flex-1 min-w-0"><div className="text-sm font-medium text-foreground truncate">{d.name}</div><div className="text-xs text-muted-foreground">{d.size} · {d.date}</div></div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-muted transition-all"><Download size={13} className="text-muted-foreground" /></button>
                </div>
              ))}
            </div>
          )}
          {tab === "loan" && (() => {
            const allProducts: { name: string; destTab: Tab; icon: React.ElementType }[] = [
              { name: "Education Loan",    destTab: "loans",         icon: GraduationCap },
              { name: "Remittance",        destTab: "remittance",    icon: Send },
              { name: "Accommodation",     destTab: "accommodation", icon: Home },
              { name: "Global Credit Card",destTab: "cards",         icon: CreditCard },
              { name: "Accounts",          destTab: "accounts",      icon: Landmark },
            ];
            return (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {allProducts.map(({ name, destTab, icon: Icon }) => {
                    const active = lead.products.includes(name);
                    const isLoan = name === "Education Loan";
                    const s = productStyle(name);
                    const hasApp = isLoan && !!linkedLoan;

                    function handleClick() {
                      if (isLoan && !linkedLoan) { onClose(); onStartApp(); }
                      else if (!hasApp && !isLoan) { onClose(); onStartProduct(name); }
                      else { onClose(); onNavigate(destTab); }
                    }

                    return (
                      <button
                        key={name}
                        onClick={handleClick}
                        className={`flex flex-col items-start gap-2 p-3.5 rounded-xl border text-left transition-all group ${
                          active
                            ? "border-border bg-card hover:border-primary/40 hover:shadow-sm"
                            : "border-dashed border-border/50 bg-[var(--input-background)]/30 hover:border-border hover:bg-[var(--input-background)]"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: active ? s.bg : "#f3f4f6" }}>
                            <Icon size={13} style={{ color: active ? s.color : "#9ca3af" }} />
                          </div>
                          {hasApp && (
                            <span className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full" style={{ color: loanStageConfig[linkedLoan!.stage].color, backgroundColor: loanStageConfig[linkedLoan!.stage].bg }}>
                              {loanStageConfig[linkedLoan!.stage].label}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col gap-0.5 w-full">
                          <span className={`text-xs font-medium leading-tight ${active ? "text-foreground" : "text-muted-foreground"}`}>{name}</span>
                          <span className={`text-[10px] font-medium transition-colors ${active && !hasApp ? "text-amber-600" : !active ? "text-primary opacity-0 group-hover:opacity-100" : "text-[#00c48c]"}`}>
                            {hasApp ? "View details ↓" : active ? "Start now →" : "Start now →"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Detail cards for started products */}
                {linkedLoan && (
                  <div className="rounded-xl border border-border bg-[var(--input-background)] p-4 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-cyan-100 flex items-center justify-center"><GraduationCap size={11} className="text-cyan-700" /></div>
                        <span className="text-xs font-semibold text-foreground">Education Loan · {linkedLoan.zlId}</span>
                      </div>
                      <StatusBadge label={loanStageConfig[linkedLoan.stage].label} color={loanStageConfig[linkedLoan.stage].color} bg={loanStageConfig[linkedLoan.stage].bg} />
                    </div>
                    <div className="text-xs text-muted-foreground">{linkedLoan.course} · {linkedLoan.university}</div>
                    <div className="grid grid-cols-3 gap-3 pt-1 border-t border-border">
                      {[
                        { l: "Amount", v: linkedLoan.loanAmount },
                        { l: "ZRM", v: linkedLoan.zrm || "—" },
                        { l: "Lenders", v: `${linkedLoan.lenders.length} matched` },
                      ].map(({ l, v }) => (
                        <div key={l}>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">{l}</div>
                          <div className="text-xs font-medium text-foreground">{v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { onClose(); onNavigate("loans"); }} className="flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
                      Open full application <ChevronRight size={11} />
                    </button>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        <div className="px-6 py-4 border-t border-border">
          {tab === "comments" ? (
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)} onKeyDown={e => e.key === "Enter" && addComment()} placeholder="Add a comment…" className="flex-1 px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              <button onClick={addComment} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Post</button>
            </div>
          ) : tab === "loan" ? null : (
            <div>
              <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
              <button onClick={() => fileRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Upload size={14} />Upload Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk Upload Modal ─────────────────────────────────────────────────────────

function BulkUploadModal({ onClose }: { onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function downloadTemplate() {
    const csv = ["Lead ID,Name,Products,Status,Call Status,Reschedule Date,Target Intake,Target Country", "ZL-XXXX,Full Name,\"Global Credit Card,Home Loan\",hot,connected,Jun 30 2026,Fall 26,India"].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "zolve_leads_template.csv"; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div><h2 className="text-sm font-semibold text-foreground">Bulk Upload Leads</h2><p className="text-xs text-muted-foreground mt-0.5">Upload a CSV file to import leads</p></div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={15} className="text-muted-foreground" /></button>
        </div>
        <div className="px-6 py-5 flex flex-col gap-4">
          <button onClick={downloadTemplate} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-[var(--input-background)] hover:border-primary hover:bg-secondary transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10"><Download size={14} className="text-primary" /></div>
            <div className="text-left"><div className="text-sm font-medium text-foreground">Download Template</div><div className="text-xs text-muted-foreground">Get the sample CSV with correct column format</div></div>
            <ChevronRight size={14} className="text-muted-foreground ml-auto" />
          </button>
          <div onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }} onClick={() => fileRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${dragging ? "border-primary bg-secondary" : "border-border hover:border-primary/50 hover:bg-[var(--input-background)]"}`}>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
            <Upload size={20} className={dragging ? "text-primary" : "text-muted-foreground"} />
            {file ? (<div className="text-center"><div className="text-sm font-medium text-foreground">{file.name}</div><div className="text-xs text-muted-foreground mt-0.5">{(file.size / 1024).toFixed(0)} KB</div></div>)
              : (<div className="text-center"><div className="text-sm font-medium text-foreground">Drop your CSV here</div><div className="text-xs text-muted-foreground mt-0.5">or click to browse</div></div>)}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
            <button disabled={!file} className="flex-1 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Import Leads</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── New Loan Modal (multi-step) ───────────────────────────────────────────────

const NEW_LOAN_STEPS = ["Student KYC", "Academics", "Course & Loan", "Lender History"];

function NewLoanModal({ onClose, prefill }: { onClose: () => void; prefill?: Lead | null }) {
  const [step, setStep] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">New Education Loan Application</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Step {step + 1} of {NEW_LOAN_STEPS.length}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={15} className="text-muted-foreground" /></button>
        </div>
        {prefill && (
          <div className="flex items-center gap-2 px-6 py-2 bg-secondary border-b border-border">
            <span className="text-[11px] text-secondary-foreground">From lead</span>
            <span className="font-mono text-[11px] text-primary">{prefill.id}</span>
            <span className="text-[11px] text-foreground font-medium">· {prefill.name}</span>
            <span className="text-[11px] text-muted-foreground">· {prefill.intake} · {prefill.country}</span>
          </div>
        )}

        {/* Step pills */}
        <div className="flex items-center gap-0 px-6 pt-4 pb-0">
          {NEW_LOAN_STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex items-center gap-1.5 ${i <= step ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${i < step ? "bg-primary text-primary-foreground" : i === step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {i < step ? <CheckCircle size={12} /> : i + 1}
                </div>
                <span className={`text-xs font-medium whitespace-nowrap ${i === step ? "text-primary" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < NEW_LOAN_STEPS.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 0 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Full Name"><Input placeholder="Rahul Gupta" defaultValue={prefill?.name} /></Field>
              <Field label="Date of Birth"><Input placeholder="DD/MM/YYYY" /></Field>
              <Field label="PAN Number"><Input placeholder="ABCDE1234F" /></Field>
              <Field label="Aadhaar Number"><Input placeholder="XXXX XXXX XXXX" /></Field>
              <Field label="Passport Number"><Input placeholder="P1234567" /></Field>
              <Field label="Mobile"><Input placeholder="+91 98765 43210" /></Field>
              <Field label="Email"><Input placeholder="student@email.com" /></Field>
              <Field label="City / State"><Input placeholder="Mumbai, Maharashtra" /></Field>
              <div className="col-span-2"><Field label="Co-Applicant Name"><Input placeholder="Parent / Guardian name" /></Field></div>
              <Field label="Co-Applicant Type"><Select options={["Salaried", "Self-Employed"]} /></Field>
              <Field label="Co-Applicant PAN"><Input placeholder="ABCDE1234F" /></Field>
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="10th Board"><Input placeholder="CBSE" /></Field>
              <Field label="10th Score (%)"><Input placeholder="92%" /></Field>
              <Field label="12th Board"><Input placeholder="CBSE" /></Field>
              <Field label="12th Score (%)"><Input placeholder="88%" /></Field>
              <Field label="UG University"><Input placeholder="Delhi University" /></Field>
              <Field label="UG Degree & CGPA"><Input placeholder="B.Tech – 8.4" /></Field>
              <Field label="GRE Score"><Input placeholder="320 / 340" /></Field>
              <Field label="TOEFL / IELTS"><Input placeholder="TOEFL 108" /></Field>
              <div className="col-span-2"><Field label="Admit Letter Received?"><Select options={["Yes – upload below", "No – awaiting decision", "Applied – result pending"]} /></Field></div>
              <div className="col-span-2"><Field label="University Name (if admitted)"><Input placeholder="Carnegie Mellon University" /></Field></div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2"><Field label="Course Name"><Input placeholder="MS Computer Science" /></Field></div>
              <Field label="Target Country"><Select options={["USA", "Canada", "UK", "Australia", "Germany", "Other"]} defaultValue={prefill?.country} /></Field>
              <Field label="Target Intake"><Select options={["Fall 26", "Spring 27", "Summer 27", "Fall 27"]} defaultValue={prefill?.intake} /></Field>
              <Field label="Course Duration"><Select options={["12 Months", "18 Months", "24 Months", "36 Months"]} /></Field>
              <Field label="Tuition Fees (₹)"><Input placeholder="₹35,00,000" /></Field>
              <Field label="Loan Amount Required (₹)"><Input placeholder="₹40,00,000" /></Field>
              <Field label="Loan Type"><Select options={["Non-Collateral (Unsecured)", "Collateral (Secured)"]} /></Field>
              <Field label="Annual Family Income"><Input placeholder="₹18,00,000" /></Field>
              <Field label="Co-App Monthly Salary"><Input placeholder="₹1,20,000" /></Field>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <Field label="Already Applied to Any Lender?"><Select options={["No – first time", "Yes – details below"]} /></Field>
              <Field label="Lender Name (if applied)"><Input placeholder="HDFC Credila" /></Field>
              <Field label="Application Date"><Input placeholder="DD/MM/YYYY" /></Field>
              <Field label="Stage at that Lender"><Select options={["Applied", "Doc Pending", "Under Review", "Rejected"]} /></Field>
              <Field label="Rejection Reason (if any)"><Input placeholder="Low co-applicant income" /></Field>
              <div className="p-3 rounded-lg bg-secondary border border-border/50">
                <p className="text-xs text-secondary-foreground font-medium">After submission, the Lender Recommendation Page (LRP) will be generated based on your profile — showing matched lenders with Probability of Success (POS).</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
            <ChevronLeft size={13} />Back
          </button>
          {step < NEW_LOAN_STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-1.5 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Next<ChevronRight size={13} />
            </button>
          ) : (
            <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Submit & Generate LRP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Loan Detail Drawer ────────────────────────────────────────────────────────

type LoanDrawerTab = "overview" | "lenders" | "documents" | "zrm" | "lrm";

function DocChecklist({ title, priority, items, badge }: { title: string; priority: string; items: DocItem[]; badge: string }) {
  const done = items.filter(i => i.uploaded).length;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--input-background)]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{priority}</span>
          <span className="text-xs font-semibold text-foreground">{title}</span>
        </div>
        <span className="text-xs text-muted-foreground">{done}/{items.length}</span>
      </div>
      <div className="divide-y divide-border">
        {items.map((item) => (
          <div key={item.name} className="flex items-center gap-3 px-4 py-2.5">
            {item.uploaded ? <CheckSquare size={14} className="text-[#00c48c] shrink-0" /> : <Square size={14} className="text-muted-foreground shrink-0" />}
            <span className={`text-sm flex-1 ${item.uploaded ? "text-foreground" : "text-muted-foreground"}`}>{item.name}</span>
            {!item.uploaded && (
              <button className="text-[11px] text-primary font-medium hover:underline">Upload</button>
            )}
          </div>
        ))}
        {items.length === 0 && <div className="px-4 py-3 text-xs text-muted-foreground italic">Not applicable for this loan type.</div>}
      </div>
    </div>
  );
}

function PosBar({ value }: { value: number }) {
  const color = value >= 80 ? "#15803d" : value >= 60 ? "#b45309" : "#991b1b";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="font-mono text-xs font-semibold w-8 text-right" style={{ color }}>{value}%</span>
    </div>
  );
}

function LoanDetailDrawer({ loan, onClose }: { loan: LoanApp; onClose: () => void }) {
  const [tab, setTab] = useState<LoanDrawerTab>("overview");
  const [docs, setDocs] = useState(loan.docs);
  const drawerRef = useRef<HTMLDivElement>(null);
  const sc = loanStageConfig[loan.stage];

  const drawerTabs: { id: LoanDrawerTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "lenders", label: "Lenders" },
    { id: "documents", label: "Documents" },
    { id: "zrm", label: "ZRM Actions" },
    { id: "lrm", label: "LRM Updates" },
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      <div ref={drawerRef} className="fixed top-0 right-0 h-full w-[520px] bg-card shadow-2xl z-40 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-medium text-foreground">{loan.zlId}</span>
              <StatusBadge label={sc.label} color={sc.color} bg={sc.bg} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loan.loanType === "collateral" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                {loan.loanType === "collateral" ? "Collateral" : "Non-Collateral"}
              </span>
            </div>
            <h2 className="text-base font-semibold text-foreground mt-1">{loan.student}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{loan.course} · {loan.university}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"><X size={15} className="text-muted-foreground" /></button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-border px-4 overflow-x-auto">
          {drawerTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap transition-colors -mb-px ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "overview" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Loan Amount", val: loan.loanAmount },
                  { label: "Target Country", val: loan.targetCountry },
                  { label: "Target Intake", val: loan.intake },
                  { label: "Co-App Type", val: loan.coAppType === "salaried" ? "Salaried" : "Self-Employed" },
                  { label: "ZRM", val: loan.zrm || "—" },
                  { label: "LRM", val: loan.lrm || "Unassigned" },
                ].map(({ label, val }) => (
                  <div key={label}><div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div><div className="text-sm font-medium text-foreground">{val}</div></div>
                ))}
              </div>

              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Loan Stage Progress</div>
                <div className="flex items-center gap-1">
                  {(["application_started", "doc_pending", "doc_received", "call_scheduled", "sanctioned", "disbursed"] as LoanStage[]).map((s, i) => {
                    const cfg = loanStageConfig[s];
                    const active = loanStageConfig[loan.stage].step >= cfg.step && loan.stage !== "lost";
                    return (
                      <div key={s} className="flex items-center flex-1">
                        <div className={`w-4 h-4 rounded-full shrink-0 ${active ? "bg-primary" : "bg-muted"}`} title={cfg.label} />
                        {i < 5 && <div className={`flex-1 h-0.5 ${loanStageConfig[loan.stage].step > cfg.step && loan.stage !== "lost" ? "bg-primary" : "bg-muted"}`} />}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {(["application_started", "doc_pending", "doc_received", "call_scheduled", "sanctioned", "disbursed"] as LoanStage[]).map(s => (
                    <div key={s} className="text-[9px] text-muted-foreground text-center" style={{ width: "14%" }}>{loanStageConfig[s].label.split(" ")[0]}</div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">ZRM Notes</div>
                <div className="flex flex-col gap-2">
                  {loan.notes.map((n, i) => (
                    <div key={i} className="flex gap-2 text-sm text-foreground p-3 rounded-lg bg-[var(--input-background)] border border-border">
                      <AlertCircle size={13} className="text-primary mt-0.5 shrink-0" />{n}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "lenders" && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-xs font-semibold text-foreground mb-3">Lender Recommendation (LRP)</div>
                <div className="flex flex-col gap-3">
                  {loan.lenders.sort((a, b) => b.pos - a.pos).map((l) => {
                    const ls = lenderStageConfig[l.stage];
                    return (
                      <div key={l.name} className="border border-border rounded-xl p-4 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center"><Building2 size={13} className="text-primary" /></div>
                            <span className="text-sm font-semibold text-foreground">{l.name}</span>
                          </div>
                          <StatusBadge label={ls.label} color={ls.color} bg={ls.bg} />
                        </div>
                        <div>
                          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Probability of Success</div>
                          <PosBar value={l.pos} />
                        </div>
                        {(l.loginDate || l.sanctionDate || l.disbDate) && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
                            {l.loginDate && <><div className="text-[10px] text-muted-foreground">Login Date</div><div className="text-xs font-medium text-foreground text-right">{l.loginDate}</div></>}
                            {l.loginAmt && <><div className="text-[10px] text-muted-foreground">Login Amt</div><div className="text-xs font-medium text-foreground text-right">{l.loginAmt}</div></>}
                            {l.sanctionDate && <><div className="text-[10px] text-muted-foreground">Sanction Date</div><div className="text-xs font-medium text-foreground text-right">{l.sanctionDate}</div></>}
                            {l.sanctionAmt && <><div className="text-[10px] text-muted-foreground">Sanction Amt</div><div className="text-xs font-medium text-foreground text-right">{l.sanctionAmt}</div></>}
                            {l.roi && <><div className="text-[10px] text-muted-foreground">ROI</div><div className="text-xs font-medium text-foreground text-right">{l.roi}</div></>}
                            {l.pfAmt && <><div className="text-[10px] text-muted-foreground">PF Amt</div><div className="text-xs font-medium text-foreground text-right">{l.pfAmt}</div></>}
                            {l.disbDate && <><div className="text-[10px] text-muted-foreground">Disb. Date</div><div className="text-xs font-medium text-foreground text-right">{l.disbDate}</div></>}
                            {l.disbAmt && <><div className="text-[10px] text-muted-foreground">Disb. Amt</div><div className="text-xs font-medium text-foreground text-right">{l.disbAmt}</div></>}
                            {l.trancheNo && <><div className="text-[10px] text-muted-foreground">Tranche No.</div><div className="text-xs font-medium text-foreground text-right">{l.trancheNo}</div></>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {tab === "documents" && (
            <div className="flex flex-col gap-4">
              <DocChecklist title="KYC" priority="P0" badge="p0" items={docs.p0} />
              <DocChecklist title="Academics" priority="P1" badge="p1" items={docs.p1} />
              <DocChecklist title="Financials" priority="P2" badge="p2" items={docs.p2} />
              <DocChecklist title="Collateral" priority="P3" badge="p3" items={docs.p3} />
            </div>
          )}

          {tab === "zrm" && (
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><Field label="Connectivity Status"><Select options={["Connected", "Not Reachable", "Abroad", "Not Attempted"]} defaultValue={loan.connectivityStatus === "connected" ? "Connected" : "Not Reachable"} /></Field></div>
                <div className="col-span-2"><Field label="Abroad / Enrollment Status"><Select options={["In India", "Departed", "Enrolled"]} defaultValue="In India" /></Field></div>
                <div className="col-span-2"><Field label="Loan Stage"><Select options={["Application Started", "Doc Pending", "Doc Received", "Call Scheduled", "Sanctioned", "Disbursed", "Lost"]} defaultValue={loanStageConfig[loan.stage].label} /></Field></div>
                <div className="col-span-2"><Field label="Other Lenders Status"><Input placeholder="Applied to SBI separately, waiting for response" /></Field></div>
                <div className="col-span-2"><Field label="Raise Query for LRM"><Input placeholder="Clarify HDFC login checklist for self-employed co-app" /></Field></div>
              </div>
              <div className="border-t border-border pt-4">
                <div className="text-xs font-semibold text-foreground mb-3">Trigger Communication</div>
                <div className="flex flex-col gap-2">
                  {["We tried calling you, what would be the best time to connect?", "Submit your Financial Docs to unlock the Special PF offer.", "Schedule a call-back with your Zolve RM."].map(msg => (
                    <button key={msg} className="flex items-center gap-3 p-3 text-left rounded-lg border border-border hover:border-primary hover:bg-secondary transition-colors group">
                      <Send size={12} className="text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="text-xs text-foreground">{msg}</span>
                    </button>
                  ))}
                </div>
              </div>
              <button className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Save ZRM Updates</button>
            </div>
          )}

          {tab === "lrm" && (
            <div className="flex flex-col gap-4">
              <div className="col-span-2"><Field label="Select Lender to Update"><Select options={loan.lenders.map(l => l.name)} /></Field></div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Lender Stage"><Select options={["Not Applied", "Applied", "Doc Pending", "Under Review", "Sanctioned", "Disbursed", "Rejected"]} /></Field>
                <Field label="Reason for Lead Lost (if any)"><Input placeholder="Income insufficient" /></Field>
                <Field label="Login Date"><Input placeholder="DD/MM/YYYY" /></Field>
                <Field label="Login Amount (₹)"><Input placeholder="₹42,00,000" /></Field>
                <Field label="Sanction Date"><Input placeholder="DD/MM/YYYY" /></Field>
                <Field label="Sanction Amount (₹)"><Input placeholder="₹40,00,000" /></Field>
                <Field label="ROI (% p.a.)"><Input placeholder="11.5%" /></Field>
                <Field label="PF Amount (₹)"><Input placeholder="₹40,000" /></Field>
                <Field label="PF Date"><Input placeholder="DD/MM/YYYY" /></Field>
                <Field label="Disbursement Date"><Input placeholder="DD/MM/YYYY" /></Field>
                <Field label="Disbursement Amount (₹)"><Input placeholder="₹40,00,000" /></Field>
                <Field label="Tranche Number"><Input placeholder="1" /></Field>
                <div className="col-span-2"><Field label="Doc Pending Status"><Input placeholder="ITR for FY25 still pending from co-applicant" /></Field></div>
              </div>
              <button className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Save LRM Updates</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Loans Tab ─────────────────────────────────────────────────────────────────

function LoansTab() {
  const [loansData, setLoansData] = useState<LoanApp[]>(loanApps);
  const [selectedLoan, setSelectedLoan] = useState<LoanApp | null>(null);
  const [newLoanOpen, setNewLoanOpen] = useState(false);
  const [stageFilter, setStageFilter] = useState<LoanStage | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"collateral" | "non-collateral" | "all">("all");

  function updateLoan(id: string, changes: Partial<LoanApp>) {
    setLoansData(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }

  const filtered = loansData.filter(l =>
    (stageFilter === "all" || l.stage === stageFilter) &&
    (typeFilter === "all" || l.loanType === typeFilter)
  );

  const totalDisbursed = loanApps.filter(l => l.stage === "disbursed").length;
  const totalSanctioned = loanApps.filter(l => l.stage === "sanctioned").length;
  const docPending = loanApps.filter(l => l.stage === "doc_pending").length;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Applications" value={`${loanApps.length}`} sub="+3 this week" trend="up" icon={GraduationCap} accent="#ff6b00" />
        <MetricCard label="Disbursed" value={`${totalDisbursed}`} sub="+1 this month" trend="up" icon={CheckCircle} accent="#00c48c" />
        <MetricCard label="Sanctioned" value={`${totalSanctioned}`} sub="Awaiting disbursement" trend="up" icon={Star} accent="#8b5cf6" />
        <MetricCard label="Doc Pending" value={`${docPending}`} sub="Needs follow-up" trend="up" icon={Clock} accent="#f59e0b" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">Education Loan Applications</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} applications</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewLoanOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              <Plus size={13} />New Loan
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground bg-[var(--input-background)] border border-border rounded-lg hover:bg-muted transition-colors">
              <Download size={13} />Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--input-background)]">
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ZL ID</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Student</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">University / Course</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap">
                  <ColFilter label="Type" value={typeFilter} onChange={setTypeFilter} options={[{ value: "all", label: "All" }, { value: "collateral", label: "Collateral" }, { value: "non-collateral", label: "Non-Collateral" }]} />
                </th>
                <th className="text-left px-5 py-3 whitespace-nowrap">
                  <ColFilter label="Stage" value={stageFilter} onChange={setStageFilter} options={[
                    { value: "all", label: "All" },
                    { value: "application_started", label: "Application Started" },
                    { value: "doc_pending", label: "Doc Pending" },
                    { value: "doc_received", label: "Doc Received" },
                    { value: "call_scheduled", label: "Call Scheduled" },
                    { value: "sanctioned", label: "Sanctioned" },
                    { value: "disbursed", label: "Disbursed" },
                    { value: "lost", label: "Lost" },
                  ]} />
                </th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lenders</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">ZRM</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Call Status</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reschedule</span></th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((loan) => {
                const sc = loanStageConfig[loan.stage];
                const docsDone = [...loan.docs.p0, ...loan.docs.p1, ...loan.docs.p2, ...loan.docs.p3].filter(d => d.uploaded).length;
                const docsTotal = [...loan.docs.p0, ...loan.docs.p1, ...loan.docs.p2, ...loan.docs.p3].length;
                const topLender = loan.lenders.sort((a, b) => b.pos - a.pos)[0];
                return (
                  <tr key={loan.zlId} onClick={() => setSelectedLoan(loan)} className="hover:bg-[var(--input-background)]/50 transition-colors cursor-pointer group">
                    <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-foreground">{loan.id}</span></td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-foreground">{loan.student}</div>
                      <div className="text-xs text-muted-foreground">{loan.targetCountry} · {loan.intake}</div>
                    </td>
                    <td className="px-5 py-3.5 max-w-[180px]">
                      <div className="text-sm text-foreground truncate">{loan.university}</div>
                      <div className="text-xs text-muted-foreground truncate">{loan.course}</div>
                    </td>
                    <td className="px-5 py-3.5"><span className="font-mono text-sm font-medium text-foreground">{loan.loanAmount}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${loan.loanType === "collateral" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                        {loan.loanType === "collateral" ? "Collateral" : "Non-Collateral"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineBadgeSelect
                        value={loan.stage}
                        options={(Object.entries(loanStageConfig) as [LoanStage, typeof loanStageConfig[LoanStage]][]).map(([v, c]) => ({ value: v, label: c.label, color: c.color, bg: c.bg }))}
                        onChange={v => updateLoan(loan.id, { stage: v })}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-xs text-foreground">{topLender?.name}</div>
                      <div className="text-[11px] text-muted-foreground">{loan.lenders.length} matched · docs {docsDone}/{docsTotal}</div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap text-sm">{loan.zrm || "—"}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineBadgeSelect
                        value={loan.callStatus}
                        options={Object.entries(callStatusConfig).map(([v, c]) => ({ value: v as CallStatus, ...c }))}
                        onChange={v => updateLoan(loan.id, { callStatus: v })}
                      />
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineTextEdit
                        value={loan.rescheduleDate === "—" ? "" : loan.rescheduleDate}
                        placeholder="Set date"
                        onChange={v => updateLoan(loan.id, { rescheduleDate: v || "—" })}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <button onClick={e => { e.stopPropagation(); setSelectedLoan(loan); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all">
                        <MoreHorizontal size={15} className="text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLoan && <LoanDetailDrawer loan={selectedLoan} onClose={() => setSelectedLoan(null)} />}
      {newLoanOpen && <NewLoanModal prefill={null} onClose={() => setNewLoanOpen(false)} />}
    </div>
  );
}

// ─── All Leads Tab ─────────────────────────────────────────────────────────────

// ─── Inline editable badge (click to change) ─────────────────────────────────

function InlineBadgeSelect<T extends string>({
  value, options, onChange,
}: {
  value: T;
  options: { value: T; label: string; color: string; bg: string }[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const current = options.find(o => o.value === value)!;
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-offset-1 transition-all"
        style={{ color: current.color, backgroundColor: current.bg, '--tw-ring-color': current.color } as React.CSSProperties}
        title="Click to edit"
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: current.color }} />
        {current.label}
        <ChevronDown size={10} className="opacity-60" />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px]" onClick={e => e.stopPropagation()}>
          {options.map(o => (
            <button key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-[var(--input-background)] transition-colors ${value === o.value ? "font-semibold" : ""}`}>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: o.color }} />
              <span style={{ color: o.color }}>{o.label}</span>
              {value === o.value && <CheckCircle size={10} className="ml-auto" style={{ color: o.color }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Inline text edit (click to edit, blur/enter to save) ────────────────────

function InlineTextEdit({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  function save() { onChange(draft); setEditing(false); }

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        onClick={e => e.stopPropagation()}
        className="w-32 px-2 py-0.5 text-xs font-mono border border-primary rounded bg-card outline-none focus:ring-2 focus:ring-primary/20"
      />
    );
  }
  return (
    <button
      onClick={e => { e.stopPropagation(); setEditing(true); }}
      className="font-mono text-xs text-muted-foreground whitespace-nowrap hover:text-foreground hover:underline decoration-dashed underline-offset-2 transition-colors"
      title="Click to edit"
    >
      {value || <span className="opacity-40">{placeholder ?? "—"}</span>}
    </button>
  );
}

// ─── All Leads Tab ─────────────────────────────────────────────────────────────

function AllLeadsTab({ onNavigate, onStartProduct }: { onNavigate: (tab: Tab) => void; onStartProduct: (product: string, lead: Lead) => void }) {
  const [leadsData, setLeadsData] = useState<Lead[]>(leads);
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [callFilter, setCallFilter] = useState<CallStatus | "all">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [newLoanFromLead, setNewLoanFromLead] = useState<Lead | null>(null);

  const selectedLead = selectedLeadId ? leadsData.find(l => l.id === selectedLeadId) ?? null : null;

  function updateLead(id: string, changes: Partial<Lead>) {
    setLeadsData(prev => prev.map(l => l.id === id ? { ...l, ...changes } : l));
  }

  const countries = Array.from(new Set(leadsData.map(l => l.country)));
  const filtered = leadsData.filter(l =>
    (statusFilter === "all" || l.status === statusFilter) &&
    (callFilter === "all" || l.callStatus === callFilter) &&
    (countryFilter === "all" || l.country === countryFilter)
  );

  const leadStatusOptions = Object.entries(leadStatusConfig).map(([v, c]) => ({ value: v as LeadStatus, ...c }));
  const callStatusOptions = Object.entries(callStatusConfig).map(([v, c]) => ({ value: v as CallStatus, ...c }));

  const TODAY = "Jun 23, 2026";
  const rescheduledToday = leadsData.filter(l => l.rescheduleDate === TODAY);
  const notAttempted = leadsData.filter(l => l.callStatus === "not_attempted");
  const hotLeads = leadsData.filter(l => l.status === "hot");
  const newThisWeek = leadsData.filter(l => l.intake === "Fall 26" || l.intake === "Summer 27");

  const summaryCards = [
    {
      label: "Rescheduled Today",
      count: rescheduledToday.length,
      names: rescheduledToday.map(l => l.name),
      color: "#7c3aed", bg: "#ede9fe",
      icon: Clock,
      onClick: () => setStatusFilter("all"),
    },
    {
      label: "Not Attempted",
      count: notAttempted.length,
      names: notAttempted.map(l => l.name),
      color: "#6b7280", bg: "#f3f4f6",
      icon: Phone,
      onClick: () => setCallFilter("not_attempted"),
    },
    {
      label: "Hot Leads",
      count: hotLeads.length,
      names: hotLeads.map(l => l.name),
      color: "#b91c1c", bg: "#fee2e2",
      icon: ArrowUpRight,
      onClick: () => setStatusFilter("hot"),
    },
    {
      label: "New This Intake",
      count: newThisWeek.length,
      names: newThisWeek.map(l => l.name),
      color: "#0e7490", bg: "#cffafe",
      icon: Users,
      onClick: () => setStatusFilter("all"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map(({ label, count, names, color, bg, icon: Icon, onClick }) => (
          <button key={label} onClick={onClick} className="bg-card rounded-xl border border-border p-4 text-left hover:border-primary/30 hover:shadow-sm transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: bg }}>
                <Icon size={15} style={{ color }} />
              </div>
              <span className="text-2xl font-bold text-foreground">{count}</span>
            </div>
            <div className="text-xs font-semibold text-foreground mb-1">{label}</div>
            {names.length > 0 ? (
              <div className="text-[11px] text-muted-foreground truncate">{names.slice(0, 2).join(", ")}{names.length > 2 ? ` +${names.length - 2}` : ""}</div>
            ) : (
              <div className="text-[11px] text-muted-foreground">None today</div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
          <div><h2 className="text-base font-semibold text-foreground">All Leads</h2><p className="text-xs text-muted-foreground mt-0.5">{filtered.length} results</p></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setBulkOpen(true)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground bg-[var(--input-background)] border border-border rounded-lg hover:bg-muted transition-colors"><Upload size={13} />Bulk Upload</button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground bg-[var(--input-background)] border border-border rounded-lg hover:bg-muted transition-colors"><Download size={13} />Export</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[var(--input-background)]">
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lead ID</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contact</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Products</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><ColFilter label="Status" value={statusFilter} onChange={setStatusFilter} options={[{ value: "all", label: "All" }, { value: "hot", label: "Hot" }, { value: "warm", label: "Warm" }, { value: "cold", label: "Cold" }, { value: "lost", label: "Lost" }]} /></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><ColFilter label="Call Status" value={callFilter} onChange={setCallFilter} options={[{ value: "all", label: "All" }, { value: "connected", label: "Connected" }, { value: "not_attempted", label: "Not Attempted" }, { value: "rescheduled", label: "Rescheduled" }, { value: "rejected", label: "Rejected" }]} /></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Reschedule</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Target Intake</span></th>
                <th className="text-left px-5 py-3 whitespace-nowrap"><ColFilter label="Target Country" value={countryFilter} onChange={setCountryFilter} options={[{ value: "all", label: "All" }, ...countries.map(c => ({ value: c, label: c }))]} /></th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lead) => (
                <tr key={lead.id} onClick={() => setSelectedLeadId(lead.id)} className="hover:bg-[var(--input-background)]/50 transition-colors cursor-pointer group">
                  <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-foreground">{lead.id}</span></td>
                  <td className="px-5 py-3.5 font-medium text-foreground whitespace-nowrap">{lead.name}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground whitespace-nowrap">{lead.phone}</td>
                  <td className="px-5 py-3.5"><div className="flex flex-wrap gap-1.5">{lead.products.map(p => { const s = productStyle(p); return <span key={p} className="px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap" style={{ color: s.color, backgroundColor: s.bg }}>{p}</span>; })}</div></td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <InlineBadgeSelect
                      value={lead.status}
                      options={leadStatusOptions}
                      onChange={v => updateLead(lead.id, { status: v })}
                    />
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <InlineBadgeSelect
                      value={lead.callStatus}
                      options={callStatusOptions}
                      onChange={v => updateLead(lead.id, { callStatus: v })}
                    />
                  </td>
                  <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                    <InlineTextEdit
                      value={lead.rescheduleDate}
                      placeholder="Set date"
                      onChange={v => updateLead(lead.id, { rescheduleDate: v })}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap font-mono text-xs">{lead.intake}</td>
                  <td className="px-5 py-3.5 text-foreground whitespace-nowrap">{lead.country}</td>
                  <td className="px-5 py-3.5"><button onClick={e => { e.stopPropagation(); setSelectedLeadId(lead.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"><MoreHorizontal size={15} className="text-muted-foreground" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedLead && (
        <LeadDetailPopup
          lead={selectedLead}
          onClose={() => setSelectedLeadId(null)}
          onUpdate={changes => updateLead(selectedLead.id, changes)}
          onStartApp={() => { setNewLoanFromLead(selectedLead); setSelectedLeadId(null); }}
          onNavigate={(tab) => { setSelectedLeadId(null); onNavigate(tab); }}
          onStartProduct={(product) => {
            updateLead(selectedLead.id, { products: selectedLead.products.includes(product) ? selectedLead.products : [...selectedLead.products, product] });
            setSelectedLeadId(null);
            onStartProduct(product, { ...selectedLead, products: selectedLead.products.includes(product) ? selectedLead.products : [...selectedLead.products, product] });
          }}
        />
      )}
      {bulkOpen && <BulkUploadModal onClose={() => setBulkOpen(false)} />}
      {newLoanFromLead && <NewLoanModal prefill={newLoanFromLead} onClose={() => { setNewLoanFromLead(null); onNavigate("loans"); }} />}
    </div>
  );
}

// ─── Remittance Tab ────────────────────────────────────────────────────────────

// ─── Remittance Calculator Modal ──────────────────────────────────────────────

const CURRENCY_RATES: Record<string, { symbol: string; flag: string; rate: number; swift: number }> = {
  "US USA - USD": { symbol: "$", flag: "🇺🇸", rate: 84.83, swift: 500 },
  "GB GBP - GBP": { symbol: "£", flag: "🇬🇧", rate: 107.20, swift: 650 },
  "CA CAD - CAD": { symbol: "CA$", flag: "🇨🇦", rate: 62.40, swift: 450 },
  "AU AUD - AUD": { symbol: "A$", flag: "🇦🇺", rate: 55.80, swift: 450 },
  "DE EUR - EUR": { symbol: "€", flag: "🇩🇪", rate: 91.50, swift: 600 },
};

function RemittanceCalculatorModal({ onClose, prefill }: { onClose: () => void; prefill?: ProductPrefill | null }) {
  const [name, setName] = useState(prefill?.name ?? "");
  const [phone, setPhone] = useState(prefill?.phone ?? "");
  const [currency, setCurrency] = useState("US USA - USD");
  const [rate, setRate] = useState(84.83);
  const [forexPaisa, setForexPaisa] = useState(50);
  const [amount, setAmount] = useState(10000);
  const [date, setDate] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const quoteRef = useRef<HTMLDivElement>(null);

  const curr = CURRENCY_RATES[currency];

  // Fee calculation
  const baseAmount = amount * rate;
  const forexFee = (forexPaisa / 100) * amount;
  const swiftFee = curr.swift;
  const platformCharges = Math.round(amount * 0.15);
  const gst = Math.round((swiftFee + platformCharges) * 0.18);
  const totalCharges = forexFee + swiftFee + platformCharges + gst;
  const totalINR = baseAmount + totalCharges;

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

  function handleCurrencyChange(c: string) {
    setCurrency(c);
    setRate(CURRENCY_RATES[c].rate);
    setShowQuote(false);
  }

  function downloadQuote(type: "pdf" | "image") {
    // Visual affordance only — print dialog for PDF
    if (type === "pdf") window.print();
  }

  const feeRows = [
    { label: "Base Transfer Amount", value: fmt(baseAmount) },
    { label: "Forex Fee", value: fmt(forexFee) },
    { label: "SWIFT Fee", value: fmt(swiftFee) },
    { label: "Platform Charges", value: fmt(platformCharges) },
    { label: "GST (18%)", value: fmt(gst) },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-foreground">International Student Transfer Quote</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Calculate fees and generate a quote instantly</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={15} className="text-muted-foreground" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">

            {/* ── Left: Form ── */}
            <div className="px-6 py-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</label>
                  <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                    className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="1234567890"
                    className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Remittance Country & Currency</label>
                <div className="relative">
                  <select value={currency} onChange={e => handleCurrencyChange(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer">
                    {Object.keys(CURRENCY_RATES).map(c => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Exchange Rate (₹ per 1 unit)</label>
                  <input type="number" value={rate} onChange={e => { setRate(+e.target.value); setShowQuote(false); }}
                    className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Forex Fee in Paisa</label>
                  <input type="number" value={forexPaisa} onChange={e => { setForexPaisa(+e.target.value); setShowQuote(false); }}
                    className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" />
                  <p className="text-[10px] text-muted-foreground leading-tight">e.g. write 50 for ₹0.50 per unit</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Amount ({curr.symbol})</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-mono">{curr.symbol}</span>
                  <input type="number" value={amount} onChange={e => { setAmount(+e.target.value); setShowQuote(false); }}
                    className="w-full pl-7 pr-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Remittance Date (Optional)</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="px-3 py-2 text-sm bg-[var(--input-background)] border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>

              <button
                onClick={() => setShowQuote(true)}
                className="w-full py-3 text-sm font-semibold bg-[#00c48c] text-white rounded-xl hover:bg-[#00b87a] transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={15} />Generate Quote
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[#00a87a] font-medium">
                <CheckCircle size={12} className="text-[#00c48c]" />Lowest Price Guaranteed
              </div>
            </div>

            {/* ── Right: Quote Result ── */}
            <div className="px-6 py-5 flex flex-col gap-4" ref={quoteRef}>
              {!showQuote ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                    <Send size={22} className="text-primary" />
                  </div>
                  <div className="text-sm font-medium text-foreground">Fill in the details and generate a quote</div>
                  <div className="text-xs text-muted-foreground max-w-[200px]">Your fee breakdown and total payable amount will appear here.</div>
                </div>
              ) : (
                <>
                  {/* Quote header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">Customer Name</div>
                      <div className="text-sm font-semibold text-foreground">{name || "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Contact Number</div>
                      <div className="text-sm font-semibold text-foreground">{phone || "—"}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--input-background)] border border-border">
                    <span className="text-xs text-muted-foreground">Live Rate</span>
                    <span className="font-mono text-sm font-semibold text-foreground">₹{rate.toFixed(2)}</span>
                  </div>

                  {/* Big numbers */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-primary p-4 text-white">
                      <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider mb-1">Recipient Will Get</div>
                      <div className="text-xl font-bold font-mono">{curr.symbol}{amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div className="rounded-xl bg-[#00c48c] p-4 text-white">
                      <div className="text-[10px] font-semibold opacity-80 uppercase tracking-wider mb-1">Total INR You'll Pay</div>
                      <div className="text-xl font-bold font-mono">₹{Math.round(totalINR).toLocaleString("en-IN")}</div>
                      <div className="text-[10px] opacity-70 mt-0.5">incl. all charges</div>
                    </div>
                  </div>

                  {/* Fee breakdown */}
                  <div className="rounded-xl border border-border overflow-hidden">
                    <div className="px-4 py-2.5 bg-[var(--input-background)] border-b border-border">
                      <span className="text-xs font-semibold text-foreground">Fee Breakdown</span>
                    </div>
                    <div className="divide-y divide-border">
                      {feeRows.map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between px-4 py-2.5">
                          <span className="text-xs text-muted-foreground">{label}</span>
                          <span className="font-mono text-xs font-medium text-foreground">{value}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[var(--input-background)] border-t border-border">
                      <span className="text-xs font-semibold text-foreground">Total Charges</span>
                      <span className="font-mono text-xs font-bold text-foreground">{fmt(totalCharges)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-[#00a87a] font-semibold py-1">
                    <CheckCircle size={12} className="text-[#00c48c]" />Lowest Price Guaranteed
                  </div>

                  {/* Download buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => downloadQuote("pdf")}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
                      <Download size={13} />Download as PDF
                    </button>
                    <button onClick={() => downloadQuote("image")}
                      className="flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold bg-[#00c48c] text-white rounded-xl hover:bg-[#00b87a] transition-colors">
                      <Download size={13} />Download as Image
                    </button>
                  </div>

                  <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-3">
                    <strong>Disclaimer:</strong> This quote is indicative and provided solely for reference purposes. The exchange rates may vary and applicable TDS will be determined at the time the transaction is processed. Remittances are executed through a licensed Authorized Dealer. GST is applicable in accordance with prevailing tax regulations.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RemittanceTab({ prefill, onPrefillConsumed }: { prefill?: ProductPrefill | null; onPrefillConsumed?: () => void } = {}) {
  const [remitData, setRemitData] = useState<Remittance[]>(remittances);
  const [calcOpen, setCalcOpen] = useState(false);
  const [calcPrefill, setCalcPrefill] = useState<ProductPrefill | null>(null);

  function updateRemit(zlId: string, changes: Partial<Remittance>) {
    setRemitData(prev => prev.map(r => r.zlId === zlId ? { ...r, ...changes } : r));
  }

  useEffect(() => {
    if (prefill) { setCalcPrefill(prefill); setCalcOpen(true); onPrefillConsumed?.(); }
  }, [prefill]);
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Sent" value="$2.1M" sub="+18.3% this month" trend="up" icon={Send} accent="#ff6b00" />
        <MetricCard label="Transactions" value="3,847" sub="+14.9% vs last month" trend="up" icon={ArrowUpRight} accent="#00c48c" />
        <MetricCard label="Avg. Transfer" value="$548" sub="+2.1% vs last month" trend="up" icon={DollarSign} accent="#f59e0b" />
        <MetricCard label="Failed" value="12" sub="-4.6% vs last month" trend="down" icon={XCircle} accent="#e02d3c" />
      </div>
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div><h2 className="text-base font-semibold text-foreground">Remittance Transactions</h2><p className="text-xs text-muted-foreground mt-0.5">{remittances.length} recent</p></div>
          <button onClick={() => { setCalcPrefill(null); setCalcOpen(true); }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"><Send size={13} />New Transfer</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-[var(--input-background)]">{["ZL ID", "Sender", "Receiver", "Amount", "Converted", "Fee", "Status", "Call Status", "Date", "Reschedule", ""].map(h => <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-5 py-3 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {remitData.map(r => {
                const sc = remitStatusConfig[r.status];
                return (
                  <tr key={r.zlId} className="hover:bg-[var(--input-background)]/50 transition-colors group">
                    <td className="px-5 py-3.5"><span className="font-mono text-xs font-medium text-foreground">{r.zlId}</span></td>
                    <td className="px-5 py-3.5 font-medium text-foreground">{r.sender}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{r.receiver}</td>
                    <td className="px-5 py-3.5"><span className="font-mono text-sm font-medium text-foreground">{r.amount}</span></td>
                    <td className="px-5 py-3.5"><span className="font-mono text-sm text-foreground">{r.converted}</span><span className="ml-1.5 text-xs text-muted-foreground">{r.currency}</span></td>
                    <td className="px-5 py-3.5"><span className="font-mono text-xs text-muted-foreground">{r.fee}</span></td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineBadgeSelect
                        value={r.status}
                        options={Object.entries(remitStatusConfig).map(([v, c]) => ({ value: v as "completed" | "processing" | "failed", ...c }))}
                        onChange={v => updateRemit(r.zlId, { status: v })}
                      />
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineBadgeSelect
                        value={r.callStatus}
                        options={Object.entries(callStatusConfig).map(([v, c]) => ({ value: v as CallStatus, ...c }))}
                        onChange={v => updateRemit(r.zlId, { callStatus: v })}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{r.date}</td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <InlineTextEdit
                        value={r.rescheduleDate === "—" ? "" : r.rescheduleDate}
                        placeholder="Set date"
                        onChange={v => updateRemit(r.zlId, { rescheduleDate: v || "—" })}
                      />
                    </td>
                    <td className="px-5 py-3.5"><button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-all"><MoreHorizontal size={15} className="text-muted-foreground" /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {calcOpen && <RemittanceCalculatorModal prefill={calcPrefill} onClose={() => { setCalcOpen(false); setCalcPrefill(null); }} />}
    </div>
  );
}

// ─── Accommodation Tab ─────────────────────────────────────────────────────────

function AccommodationTab({ prefill, onPrefillConsumed }: { prefill?: ProductPrefill | null; onPrefillConsumed?: () => void } = {}) {
  useEffect(() => { if (prefill) onPrefillConsumed?.(); }, [prefill]);
  return (
    <div className="bg-card rounded-xl border border-border flex flex-col items-center justify-center py-20 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
        <Home size={24} className="text-primary" />
      </div>
      <div>
        <div className="text-base font-semibold text-foreground">Accommodation — Coming Soon</div>
        <div className="text-sm text-muted-foreground mt-1 max-w-xs">Rental placement and student housing management will be available in the next release.</div>
      </div>
      <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground">In Development</span>
    </div>
  );
}

function CardsTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Active Cards" value="4,821" sub="+8.4% this month" trend="up" icon={CreditCard} accent="#ff6b00" />
        <MetricCard label="Issued MTD" value="312" sub="+11.1% vs last month" trend="up" icon={CheckCircle} accent="#00c48c" />
        <MetricCard label="Blocked" value="14" sub="-2.3% vs last month" trend="down" icon={XCircle} accent="#e02d3c" />
        <MetricCard label="Avg. Limit" value="$8.4K" sub="+3.9% vs last month" trend="up" icon={ArrowUpRight} accent="#8b5cf6" />
      </div>
      <div className="bg-card rounded-xl border border-border p-10 flex items-center justify-center">
        <div className="text-center"><CreditCard size={32} className="text-muted-foreground mx-auto mb-3" /><div className="text-sm font-medium text-foreground">Cards data coming soon</div><div className="text-xs text-muted-foreground mt-1">Card issuance and management details will appear here.</div></div>
      </div>
    </div>
  );
}

function AccountsTab() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Accounts" value="9,204" sub="+6.2% this month" trend="up" icon={Landmark} accent="#ff6b00" />
        <MetricCard label="Opened MTD" value="481" sub="+9.7% vs last month" trend="up" icon={CheckCircle} accent="#00c48c" />
        <MetricCard label="Dormant" value="38" sub="+1.1% vs last month" trend="up" icon={Clock} accent="#f59e0b" />
        <MetricCard label="Avg. Balance" value="$3.2K" sub="+4.5% vs last month" trend="up" icon={ArrowUpRight} accent="#8b5cf6" />
      </div>
      <div className="bg-card rounded-xl border border-border p-10 flex items-center justify-center">
        <div className="text-center"><Landmark size={32} className="text-muted-foreground mx-auto mb-3" /><div className="text-sm font-medium text-foreground">Accounts data coming soon</div><div className="text-xs text-muted-foreground mt-1">Account opening and management details will appear here.</div></div>
      </div>
    </div>
  );
}

// ─── Profile Drawer ────────────────────────────────────────────────────────────

function ProfileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [showPw, setShowPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => { if (open && drawerRef.current && !drawerRef.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, onClose]);

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`} />
      <div ref={drawerRef} className={`fixed top-0 right-0 h-full w-80 bg-card shadow-2xl z-40 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">My Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={15} className="text-muted-foreground" /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">RS</div>
            <div className="text-center"><div className="text-base font-semibold text-foreground">Rohan Sharma</div><div className="text-xs text-muted-foreground mt-0.5">Senior Relationship Manager</div></div>
          </div>
          <div className="flex flex-col gap-4">
            {[{ label: "Full Name", value: "Rohan Sharma", icon: Shield }, { label: "Designation", value: "Senior Relationship Manager", icon: Shield }, { label: "Phone", value: "+1 408 555 0192", icon: Phone }, { label: "Email", value: "rohan.sharma@zolve.com", icon: Mail }].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
                <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--input-background)] rounded-lg border border-border"><Icon size={13} className="text-muted-foreground shrink-0" /><span className="text-sm text-foreground truncate">{value}</span></div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2"><div className="h-px flex-1 bg-border" /><span className="text-xs font-medium text-muted-foreground">Change Password</span><div className="h-px flex-1 bg-border" /></div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Current Password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--input-background)] rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input type={showPw ? "text" : "password"} value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="Enter current password" className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="text-muted-foreground hover:text-foreground transition-colors">{showPw ? <EyeOff size={13} /> : <Eye size={13} />}</button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">New Password</label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--input-background)] rounded-lg border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <input type={showNewPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Enter new password" className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="text-muted-foreground hover:text-foreground transition-colors">{showNewPw ? <EyeOff size={13} /> : <Eye size={13} />}</button>
              </div>
            </div>
            <button className="w-full py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">Update Password</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

const tabs: { id: Tab; label: string }[] = [
  { id: "leads", label: "All Leads" },
  { id: "loans", label: "Loans" },
  { id: "remittance", label: "Remittance" },
  { id: "accommodation", label: "Accommodation" },
  { id: "cards", label: "Cards" },
  { id: "accounts", label: "Accounts" },
];

interface ProductPrefill { name: string; phone: string; }

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("loans");
  const [profileOpen, setProfileOpen] = useState(false);
  const [remittancePrefill, setRemittancePrefill] = useState<ProductPrefill | null>(null);
  const [accommodationPrefill, setAccommodationPrefill] = useState<ProductPrefill | null>(null);

  function handleStartProduct(product: string, lead: Lead) {
    const prefill: ProductPrefill = { name: lead.name, phone: lead.phone };
    if (product === "Remittance") { setRemittancePrefill(prefill); setActiveTab("remittance"); }
    else if (product === "Accommodation") { setAccommodationPrefill(prefill); setActiveTab("accommodation"); }
    else if (product === "Global Credit Card") { setActiveTab("cards"); }
    else if (product === "Accounts") { setActiveTab("accounts"); }
  }

  return (
    <div className="min-h-screen bg-background font-['Plus_Jakarta_Sans',sans-serif]">
      <header className="bg-card border-b border-border sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center"><span className="text-primary-foreground text-xs font-bold tracking-tight">Z</span></div>
              <span className="text-lg font-bold text-foreground tracking-tight">zolve</span>
            </div>
            <nav className="hidden md:flex items-center gap-0.5">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-[var(--input-background)]"}`}>
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-[var(--input-background)] transition-colors">
                <Bell size={16} className="text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
              </button>
              <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-[var(--input-background)] transition-colors">
                <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center"><span className="text-primary-foreground text-[10px] font-bold">RS</span></div>
                <span className="text-sm font-medium text-foreground hidden sm:block">Rohan</span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="flex md:hidden gap-0.5 pb-2 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${activeTab === tab.id ? "text-primary bg-secondary" : "text-muted-foreground hover:text-foreground"}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-6">
        {activeTab === "leads" && <AllLeadsTab onNavigate={(tab) => setActiveTab(tab)} onStartProduct={handleStartProduct} />}
        {activeTab === "loans" && <LoansTab />}
        {activeTab === "remittance" && <RemittanceTab prefill={remittancePrefill} onPrefillConsumed={() => setRemittancePrefill(null)} />}
        {activeTab === "accommodation" && <AccommodationTab prefill={accommodationPrefill} onPrefillConsumed={() => setAccommodationPrefill(null)} />}
        {activeTab === "cards" && <CardsTab />}
        {activeTab === "accounts" && <AccountsTab />}
      </main>

      <ProfileDrawer open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
