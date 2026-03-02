import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MessageSquareWarning,
  ThermometerSun,
  Monitor,
  Lightbulb,
  Fan,
  Projector,
  FlaskConical,
  XCircle,
  Award,
  ChevronDown,
  ChevronUp,
  Filter,
  RefreshCw,
  Loader2,
  User,
  MapPin,
  Calendar,
  Coins,
  ShieldCheck,
  Flame,
} from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "";

/* ── Category icons ──────────────────────────────────────── */
const CATEGORY_ICON = {
  AC: ThermometerSun,
  PC: Monitor,
  Lights: Lightbulb,
  Fan: Fan,
  Projector: Projector,
  Equipment: FlaskConical,
};

const CATEGORY_COLOR = {
  AC: "text-blue-400",
  PC: "text-violet-400",
  Lights: "text-amber-400",
  Fan: "text-teal-400",
  Projector: "text-orange-400",
  Equipment: "text-rose-400",
};

const PRIORITY_STYLE = {
  critical: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", label: "Critical" },
  high:     { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", label: "High" },
  medium:   { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", label: "Medium" },
  low:      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", label: "Low" },
};

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ═══════════════════════════════════════════════════════════
   ComplaintsPage
   ═══════════════════════════════════════════════════════════ */
export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(null); // complaint ID being closed
  const [filter, setFilter] = useState("all"); // all | open | closed
  const [expandedId, setExpandedId] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  /* ── Fetch complaints ──────────────────────────────────── */
  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/complaints`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setComplaints(data);
    } catch (err) {
      console.error("Failed to fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  /* ── Close complaint ───────────────────────────────────── */
  const handleClose = async (id) => {
    setClosing(id);
    try {
      const res = await fetch(`${BASE}/api/complaints/${id}/close`, { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSuccessMsg(data.message);
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchComplaints();
    } catch (err) {
      console.error("Failed to close complaint:", err);
    } finally {
      setClosing(null);
    }
  };

  /* ── Filtered list ─────────────────────────────────────── */
  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);
  const openCount = complaints.filter((c) => c.status === "open").length;
  const closedCount = complaints.filter((c) => c.status === "closed").length;
  const totalPoints = complaints.reduce((s, c) => s + (c.green_points_credited || 0), 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-400/20">
            <MessageSquareWarning className="w-6 h-6 text-orange-400" />
            <div className="absolute -inset-1 rounded-xl bg-orange-400/10 blur-md -z-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Energy Waste Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Student-reported energy waste · Close complaints to credit 50 Green Points
            </p>
          </div>
        </div>
        <button
          onClick={fetchComplaints}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs hover:bg-white/[0.08] hover:text-white transition-all"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          Refresh
        </button>
      </div>

      {/* ── Success message ────────────────────────────────── */}
      {successMsg && (
        <div className="glass-card border-emerald-500/20 p-4 flex items-center gap-3 animate-fade-in-up">
          <div className="p-2 rounded-xl bg-emerald-500/15">
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-400">{successMsg}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Green Points have been credited to the student's wallet</p>
          </div>
        </div>
      )}

      {/* ── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 to-red-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10"><AlertTriangle className="w-4 h-4 text-orange-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Total Complaints</span>
          </div>
          <p className="text-3xl font-bold text-white font-mono">{complaints.length}</p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10"><Clock className="w-4 h-4 text-rose-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Open</span>
          </div>
          <p className="text-3xl font-bold text-rose-400 font-mono">{openCount}</p>
          <p className="text-[10px] text-slate-600 mt-1">Pending resolution</p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10"><CheckCircle2 className="w-4 h-4 text-emerald-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Resolved</span>
          </div>
          <p className="text-3xl font-bold text-emerald-400 font-mono">{closedCount}</p>
          <p className="text-[10px] text-slate-600 mt-1">Actions taken</p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10"><Coins className="w-4 h-4 text-amber-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Green Points Awarded</span>
          </div>
          <p className="text-3xl font-bold text-amber-400 font-mono">{totalPoints}</p>
          <p className="text-[10px] text-slate-600 mt-1">50 pts per resolved complaint</p>
        </div>
      </div>

      {/* ── Filter Tabs ────────────────────────────────────── */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        {[
          { key: "all", label: "All", count: complaints.length },
          { key: "open", label: "Open", count: openCount },
          { key: "closed", label: "Resolved", count: closedCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.key
                ? "bg-white/[0.1] text-white border border-white/[0.15]"
                : "bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:bg-white/[0.06] hover:text-slate-300"
            }`}
          >
            {tab.label} <span className="ml-1 text-[10px] opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* ── Complaints List ────────────────────────────────── */}
      <div className="space-y-3">
        {loading && !complaints.length ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
            <p className="text-sm text-slate-500">Loading complaints...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center gap-3">
            <ShieldCheck className="w-10 h-10 text-emerald-400/50" />
            <p className="text-sm text-slate-500">No {filter !== "all" ? filter : ""} complaints found</p>
          </div>
        ) : (
          filtered.map((c) => {
            const isExpanded = expandedId === c.id;
            const isOpen = c.status === "open";
            const pStyle = PRIORITY_STYLE[c.priority] || PRIORITY_STYLE.medium;
            const CatIcon = CATEGORY_ICON[c.category] || AlertTriangle;
            const catColor = CATEGORY_COLOR[c.category] || "text-slate-400";

            return (
              <div
                key={c.id}
                className={`glass-card relative overflow-hidden transition-all duration-300 ${
                  isOpen ? "border-l-2 border-l-orange-500/50" : "border-l-2 border-l-emerald-500/30 opacity-80"
                }`}
              >
                {/* Main row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  {/* Category icon */}
                  <div className={`p-2.5 rounded-xl ${isOpen ? "bg-orange-500/10" : "bg-emerald-500/10"}`}>
                    <CatIcon className={`w-5 h-5 ${catColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white truncate">{c.title}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${pStyle.bg} ${pStyle.text} border ${pStyle.border}`}>
                        {pStyle.label}
                      </span>
                      {!isOpen && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Resolved
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.student_name}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.room}</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{fmtDate(c.timestamp)}</span>
                    </div>
                  </div>

                  {/* ID + expand */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-600 font-mono">{c.id}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/[0.04] animate-fade-in-up">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
                      {/* Description */}
                      <div className="lg:col-span-2 space-y-3">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Description</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{c.description}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                            <p className="text-[10px] text-slate-600 uppercase">Category</p>
                            <p className={`text-sm font-bold ${catColor}`}>{c.category}</p>
                          </div>
                          <div className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                            <p className="text-[10px] text-slate-600 uppercase">Student ID</p>
                            <p className="text-sm font-bold text-white font-mono">{c.student_id}</p>
                          </div>
                        </div>

                        {c.closed_at && (
                          <div className="bg-emerald-500/[0.06] rounded-xl p-3 border border-emerald-500/20">
                            <p className="text-[10px] text-emerald-400/70 uppercase">Resolved On</p>
                            <p className="text-sm font-bold text-emerald-400">{fmtDate(c.closed_at)}</p>
                          </div>
                        )}
                      </div>

                      {/* Action panel */}
                      <div className="space-y-3">
                        {isOpen ? (
                          <div className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05] space-y-3">
                            <div className="flex items-center gap-2">
                              <Flame className="w-4 h-4 text-orange-400" />
                              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Action Required</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              Closing this complaint confirms the issue has been addressed and credits
                              <span className="text-amber-400 font-bold"> 50 Green Points</span> to {c.student_name}'s account.
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose(c.id);
                              }}
                              disabled={closing === c.id}
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold
                                hover:from-emerald-500 hover:to-teal-500 transition-all
                                disabled:opacity-50 disabled:cursor-not-allowed
                                shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            >
                              {closing === c.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                              {closing === c.id ? "Closing..." : "Close & Credit 50 Green Points"}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/[0.06] rounded-xl p-4 border border-emerald-500/20 space-y-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Resolved</span>
                            </div>
                            <div className="flex items-center gap-2 bg-amber-500/[0.08] rounded-lg p-2 border border-amber-500/20">
                              <Coins className="w-4 h-4 text-amber-400" />
                              <span className="text-sm font-bold text-amber-400">+{c.green_points_credited} Green Points</span>
                              <span className="text-[10px] text-slate-500">credited</span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              Awarded to {c.student_name} ({c.student_id})
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
