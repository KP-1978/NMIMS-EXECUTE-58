import React, { useState, useEffect, useCallback } from "react";
import {
  Camera,
  Video,
  AlertTriangle,
  Activity,
  Zap,
  Clock,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  Eye,
  Users,
  Lightbulb,
  DollarSign,
  Maximize2,
  IndianRupee,
  Flame,
  Leaf,
  ShieldAlert,
  BarChart3,
  X,
} from "lucide-react";

const BASE = process.env.REACT_APP_API_URL || "";

/* Video base URL — always point at the Flask backend directly */
const VIDEO_BASE = "http://localhost:5000/videos";

/* Hardcoded fallback videos — ensures cards always render even if API is slow */
const FALLBACK_VIDEOS = [
  {
    id: "vid-1",
    title: "Classroom Live Detection",
    filename: "classroom_v3_monitored.mp4",
    scenario: "live",
    description: "Real-time YOLOv8 detection of students entering and leaving a classroom. Tracks occupancy state changes and light waste events.",
    duration: "1:01",
    date: "2026-03-01",
    alerts_fired: 6,
    wasted_kwh: 0.82,
  },
  {
    id: "vid-2",
    title: "Ambient Light Monitoring",
    filename: "video2_ambient_monitored.mp4",
    scenario: "ambient",
    description: "Monitoring of a room with only ambient light (lights OFF). Demonstrates that the system correctly identifies no energy waste.",
    duration: "0:20",
    date: "2026-03-01",
    alerts_fired: 0,
    wasted_kwh: 0.0,
  },
  {
    id: "vid-3",
    title: "Lights ON - Empty Room Alert",
    filename: "video3_lights_on_v3_monitored.mp4",
    scenario: "waste",
    description: "Empty classroom with lights ON. System detects zero occupancy and fires waste alerts with estimated cost and CO2 impact.",
    duration: "0:31",
    date: "2026-03-01",
    alerts_fired: 11,
    wasted_kwh: 1.995,
  },
];

/* ── Severity styles ─────────────────────────────────────── */
const SEV_STYLE = {
  CRITICAL: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30", dot: "bg-red-400" },
  HIGH:     { bg: "bg-orange-500/15", text: "text-orange-400", border: "border-orange-500/30", dot: "bg-orange-400" },
  MEDIUM:   { bg: "bg-yellow-500/15", text: "text-yellow-400", border: "border-yellow-500/30", dot: "bg-yellow-400" },
  LOW:      { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30", dot: "bg-emerald-400" },
};

/* ── Scenario badges ─────────────────────────────────────── */
const SCENARIO_STYLE = {
  live:    { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "Live Detection" },
  ambient: { bg: "bg-sky-500/15", text: "text-sky-400", label: "Ambient Light" },
  waste:   { bg: "bg-red-500/15", text: "text-red-400", label: "Waste Detection" },
  dark:    { bg: "bg-slate-500/15", text: "text-slate-400", label: "Dark Room" },
};

/* ═══════════════════════════════════════════════════════════
   CameraAnalysisPage
   ═══════════════════════════════════════════════════════════ */
export default function CameraAnalysisPage() {
  const [log, setLog] = useState(null);
  const [videos, setVideos] = useState(FALLBACK_VIDEOS);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [alertFilter, setAlertFilter] = useState("all");
  const [fullscreenVideo, setFullscreenVideo] = useState(null);

  /* ── Fetch data ────────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [logRes, vidRes] = await Promise.all([
        fetch(`${BASE}/api/camera-analysis/log`),
        fetch(`${BASE}/api/camera-analysis/videos`),
      ]);
      if (logRes.ok) setLog(await logRes.json());
      if (vidRes.ok) {
        const data = await vidRes.json();
        if (data && data.length > 0) setVideos(data);
      }
    } catch (err) {
      console.error("Camera analysis fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── Filtered alerts ───────────────────────────────────── */
  const alerts = log?.alert_log ?? [];
  const filteredAlerts = alertFilter === "all"
    ? alerts
    : alerts.filter((a) => a.severity === alertFilter);

  const highCount = alerts.filter((a) => a.severity === "HIGH" || a.severity === "CRITICAL").length;
  const medCount = alerts.filter((a) => a.severity === "MEDIUM").length;
  const avgWaste = alerts.length > 0
    ? (alerts.reduce((s, a) => s + a.wasted_kw, 0) / alerts.length).toFixed(2)
    : 0;

  if (loading && !log) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-400/20">
            <Camera className="w-6 h-6 text-violet-400" />
            <div className="absolute -inset-1 rounded-xl bg-violet-400/10 blur-md -z-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              AI Camera Analysis
            </h2>
            <p className="text-xs text-slate-500">
              YOLOv8 occupancy detection · Light state monitoring · Energy waste alerts
            </p>
          </div>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs hover:bg-white/[0.08] hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* ── System Overview Banner ─────────────────────────── */}
      <div className="glass-card relative overflow-hidden p-5">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
        <div className="flex items-center gap-3 mb-4">
          <Eye className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">How It Works</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Camera, title: "Camera Feed", desc: "Live CCTV feed from classroom cameras", color: "text-violet-400" },
            { icon: Users, title: "YOLOv8 Detection", desc: "Real-time person & face detection with false-positive filtering", color: "text-sky-400" },
            { icon: Lightbulb, title: "Light State", desc: "CV-based brightness analysis to detect lights ON/OFF", color: "text-amber-400" },
            { icon: AlertTriangle, title: "Waste Alert", desc: "Auto-alert when lights ON + zero occupancy detected", color: "text-red-400" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 bg-white/[0.02] rounded-xl p-3 border border-white/[0.05]">
              <div className="p-2 rounded-lg bg-white/[0.05]">
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{step.title}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-orange-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-red-500/10"><ShieldAlert className="w-4 h-4 text-red-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Total Alerts</span>
          </div>
          <p className="text-3xl font-bold text-red-400 font-mono">{log?.total_alerts ?? 0}</p>
          <p className="text-[10px] text-slate-600 mt-1">
            {highCount} high · {medCount} medium
          </p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 to-yellow-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10"><Zap className="w-4 h-4 text-amber-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Energy Wasted</span>
          </div>
          <p className="text-3xl font-bold text-amber-400 font-mono">{log?.waste_kwh?.toFixed(3) ?? 0} <span className="text-sm text-slate-500">kWh</span></p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500 to-pink-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-rose-500/10"><IndianRupee className="w-4 h-4 text-rose-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Waste Cost</span>
          </div>
          <p className="text-3xl font-bold text-rose-400 font-mono">₹{log?.waste_inr?.toFixed(2) ?? 0}</p>
          <p className="text-[10px] text-slate-600 mt-1">@ ₹8/kWh commercial rate</p>
        </div>

        <div className="glass-card relative overflow-hidden p-5">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-purple-500" />
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10"><Activity className="w-4 h-4 text-violet-400" /></div>
            <span className="text-[10px] text-slate-500 font-mono uppercase">Avg Wasted Load</span>
          </div>
          <p className="text-3xl font-bold text-violet-400 font-mono">{avgWaste} <span className="text-sm text-slate-500">kW</span></p>
          <p className="text-[10px] text-slate-600 mt-1">Per alert event</p>
        </div>
      </div>

      {/* ── Analysis Videos ────────────────────────────────── */}
      <div className="glass-card relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
        <div className="flex items-center gap-2 mb-5">
          <Video className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Analysis Video History</span>
          <span className="ml-auto text-[10px] text-slate-600 font-mono">{videos.length} recordings</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {videos.map((vid) => {
            const scenarioStyle = SCENARIO_STYLE[vid.scenario] || SCENARIO_STYLE.live;
            const isActive = activeVideo === vid.id;

            return (
              <div
                key={vid.id}
                className={`bg-white/[0.02] rounded-xl border transition-all duration-300 overflow-hidden ${
                  isActive ? "border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]" : "border-white/[0.05] hover:border-white/[0.1]"
                }`}
              >
                {/* Video player */}
                <div className="relative bg-black/50 aspect-video">
                  {isActive ? (
                    <>
                      <video
                        src={`http://localhost:5000/videos/${vid.filename}`}
                        controls
                        autoPlay
                        muted
                        playsInline
                        preload="auto"
                        className="w-full h-full object-contain"
                        onError={(e) => console.error('Video load error:', vid.filename, e)}
                      >
                        <source src={`${VIDEO_BASE}/${vid.filename}`} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <button
                        onClick={() => setFullscreenVideo(vid)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-white hover:bg-black/80 transition-all"
                      >
                        <Maximize2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveVideo(vid.id)}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 group hover:bg-white/[0.02] transition-all"
                    >
                      <div className="p-3 rounded-full bg-violet-500/20 border border-violet-500/30 group-hover:bg-violet-500/30 transition-all">
                        <Play className="w-6 h-6 text-violet-400" />
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-300">Click to play</span>
                    </button>
                  )}
                </div>

                {/* Video info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{vid.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${scenarioStyle.bg} ${scenarioStyle.text}`}>
                      {scenarioStyle.label}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">{vid.description}</p>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04] text-center">
                      <p className="text-[9px] text-slate-600 uppercase">Duration</p>
                      <p className="text-xs font-bold text-white font-mono">{vid.duration}</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04] text-center">
                      <p className="text-[9px] text-slate-600 uppercase">Alerts</p>
                      <p className={`text-xs font-bold font-mono ${vid.alerts_fired > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {vid.alerts_fired}
                      </p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg p-2 border border-white/[0.04] text-center">
                      <p className="text-[9px] text-slate-600 uppercase">Waste</p>
                      <p className={`text-xs font-bold font-mono ${vid.wasted_kwh > 0 ? "text-amber-400" : "text-emerald-400"}`}>
                        {vid.wasted_kwh} kWh
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {vid.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Fullscreen Video Modal ─────────────────────────── */}
      {fullscreenVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
          <button
            onClick={() => setFullscreenVideo(null)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all z-10"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-5xl">
            <video
              src={`http://localhost:5000/videos/${fullscreenVideo.filename}`}
              controls
              autoPlay
              muted
              playsInline
              preload="auto"
              onError={(e) => console.error('Fullscreen video error:', fullscreenVideo.filename, e)}
              className="w-full rounded-xl shadow-2xl"
            >
              <source src={`${VIDEO_BASE}/${fullscreenVideo.filename}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <p className="text-center text-sm text-slate-400 mt-3">{fullscreenVideo.title}</p>
          </div>
        </div>
      )}

      {/* ── Alert History ──────────────────────────────────── */}
      <div className="glass-card relative overflow-hidden p-6">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-500 to-amber-500" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Alert History Log</span>
          </div>
          <div className="flex items-center gap-2">
            {["all", "HIGH", "MEDIUM"].map((f) => (
              <button
                key={f}
                onClick={() => setAlertFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  alertFilter === f
                    ? "bg-white/[0.1] text-white border border-white/[0.15]"
                    : "bg-white/[0.03] text-slate-500 border border-white/[0.06] hover:bg-white/[0.06]"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Alert table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Time</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Severity</th>
                <th className="text-left py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Room State</th>
                <th className="text-right py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Empty (s)</th>
                <th className="text-right py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Load (kW)</th>
                <th className="text-right py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Wasted (kW)</th>
                <th className="text-right py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">Monthly Cost</th>
                <th className="text-right py-2 px-3 text-slate-500 font-mono uppercase tracking-wider text-[10px]">CO₂/hr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredAlerts.map((a, i) => {
                const sev = SEV_STYLE[a.severity] || SEV_STYLE.MEDIUM;
                return (
                  <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 px-3 text-white font-mono">{a.time}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold ${sev.bg} ${sev.text} border ${sev.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-red-400 text-[10px] font-mono">
                        {a.room_state?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 font-mono">{a.empty_sec?.toFixed(1)}</td>
                    <td className="py-2 px-3 text-right text-white font-mono">{a.load_kw?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-amber-400 font-bold font-mono">{a.wasted_kw?.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-rose-400 font-mono">₹{a.monthly_inr?.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-violet-400 font-mono">{a.co2_hr?.toFixed(3)} kg</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAlerts.length === 0 && (
          <div className="py-8 text-center text-sm text-slate-500">No alerts matching filter</div>
        )}

        {/* Summary footer */}
        <div className="mt-4 pt-4 border-t border-white/[0.06] grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-slate-600 uppercase">Total Waste Energy</p>
            <p className="text-sm font-bold text-amber-400 font-mono">{log?.waste_kwh?.toFixed(4)} kWh</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-slate-600 uppercase">Session Cost</p>
            <p className="text-sm font-bold text-rose-400 font-mono">₹{log?.waste_inr?.toFixed(4)}</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-slate-600 uppercase">CO₂ Impact</p>
            <p className="text-sm font-bold text-violet-400 font-mono">{((log?.waste_kwh || 0) * 0.82 * 1000).toFixed(2)} g</p>
          </div>
          <div className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
            <p className="text-[9px] text-slate-600 uppercase">Timestamp</p>
            <p className="text-sm font-bold text-slate-300 font-mono text-[11px]">
              {log?.timestamp ? new Date(log.timestamp).toLocaleString() : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
