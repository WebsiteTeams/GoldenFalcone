"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronDown,
  Loader2,
  MapPin,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

type StaffingRequest = {
  _id: string;
  salonName: string;
  location: string;
  professionalCategory: string;
  quantity: number;
  requiredSkills?: string;
  employmentType?: string;
  experienceRequired?: string;
  salaryRange?: string;
  referenceNumber?: string;
  status: string;
};

type MatchedCandidate = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  preferredWorkLocation?: string;
  professionalCategory: string;
  additionalSkills?: string[];
  customSkills?: string;
  experience: string;
  employmentPreference?: string;
  expectedSalary?: string;
  availability?: string;
  status: string;
  matchScore: number;
  matchStatus: string | null;
  createdAt: string;
};

function StatusPill({ status }: { status: string }) {
  const colour: Record<string, string> = {
    suggested: "bg-champagne/60 text-gold-dark",
    reviewed: "bg-blue-50 text-blue-800",
    shortlisted: "bg-emerald/10 text-emerald",
    introduced: "bg-purple-50 text-purple-800",
    selected: "bg-forest/10 text-forest",
    "not-selected": "bg-red-50 text-red-800",
  };
  const label = status.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", colour[status] || "bg-ivory text-muted")}>
      {label}
    </span>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const bg = score >= 7 ? "bg-forest text-gold" : score >= 4 ? "bg-gold/20 text-gold-dark" : "bg-ivory text-muted";
  return (
    <span className={cn("inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold", bg)} title={`Match score: ${score}`}>
      {score}
    </span>
  );
}

export default function MatchingPage() {
  const [staffingRequests, setStaffingRequests] = useState<StaffingRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedReq, setSelectedReq] = useState<StaffingRequest | null>(null);
  const [candidates, setCandidates] = useState<MatchedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingReqs, setLoadingReqs] = useState(true);
  const [error, setError] = useState<string>();
  const [updatingId, setUpdatingId] = useState<string>();

  // Load all open staffing requests
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/staffing?page=1&sort=newest");
        const json = await res.json();
        if (json.ok) setStaffingRequests(json.data.items);
      } catch {
        setError("Failed to load staffing requests.");
      } finally {
        setLoadingReqs(false);
      }
    }
    load();
  }, []);

  // Load matching candidates for selected request
  const loadMatches = async (id: string) => {
    setSelectedId(id);
    setError(undefined);
    if (!id) { setCandidates([]); setSelectedReq(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/matching?staffingId=${id}`);
      const json = await res.json();
      if (json.ok) {
        setSelectedReq(json.data.staffingRequest);
        setCandidates(json.data.candidates);
      } else {
        setError(json.message);
      }
    } catch {
      setError("Failed to load matching candidates.");
    } finally {
      setLoading(false);
    }
  };

  const updateMatchStatus = async (candidateId: string, status: string) => {
    setUpdatingId(candidateId);
    try {
      const res = await fetch("/api/admin/matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, staffingRequestId: selectedId, applicationStatus: status }),
      });
      const json = await res.json();
      if (json.ok) {
        setCandidates((prev) => prev.map((c) => c._id === candidateId ? { ...c, matchStatus: status } : c));
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-forest">Candidate Matching</h1>
        <p className="mt-1 text-sm text-muted">
          Select a staffing request to see matching candidates ranked by relevance. Match scores are based on job role, skills, location, employment type and availability.
        </p>
      </div>

      {/* Request selector */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <label htmlFor="req-select" className="mb-2 block text-sm font-medium text-ink">
          Select a staffing request
        </label>
        {loadingReqs ? (
          <div className="flex items-center gap-2 py-3 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading requests…
          </div>
        ) : (
          <div className="relative">
            <select
              id="req-select"
              value={selectedId}
              onChange={(e) => loadMatches(e.target.value)}
              className="w-full appearance-none rounded-xl border border-line bg-white px-4 py-3 pr-10 text-sm text-ink transition-[border-color] focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            >
              <option value="">Choose a request…</option>
              {staffingRequests.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.salonName} — {r.professionalCategory} × {r.quantity} — {r.location}
                  {r.referenceNumber ? ` (${r.referenceNumber})` : ""}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </div>
        )}
      </div>

      {/* Requirement summary */}
      {selectedReq && (
        <div className="rounded-2xl border border-line bg-ivory-dark/60 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Selected Requirement</p>
              <h2 className="mt-1 font-serif text-2xl text-forest">{selectedReq.salonName}</h2>
              <p className="mt-1 text-sm text-muted">
                {selectedReq.quantity} × {selectedReq.professionalCategory} · {selectedReq.location}
                {selectedReq.employmentType ? ` · ${selectedReq.employmentType}` : ""}
                {selectedReq.experienceRequired ? ` · ${selectedReq.experienceRequired}` : ""}
              </p>
              {selectedReq.requiredSkills && (
                <p className="mt-2 text-sm text-muted"><strong className="text-ink">Skills needed:</strong> {selectedReq.requiredSkills}</p>
              )}
              {selectedReq.salaryRange && (
                <p className="mt-1 text-sm text-muted"><strong className="text-ink">Salary range:</strong> {selectedReq.salaryRange}</p>
              )}
            </div>
            <Link href={`/admin/staffing/${selectedReq._id}`} className="text-sm font-medium text-gold-dark hover:text-forest">
              View full details →
            </Link>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding matching candidates…
        </div>
      )}

      {/* Candidates */}
      {!loading && selectedId && candidates.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted">{candidates.length} candidate{candidates.length !== 1 ? "s" : ""} found for this role</p>
          {candidates.map((c) => (
            <div key={c._id} className="rounded-2xl border border-line bg-white p-5 transition-[border-color] hover:border-gold/40">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <ScoreBadge score={c.matchScore} />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/candidates/${c._id}`} className="font-medium text-forest hover:text-gold-dark">
                        {c.fullName}
                      </Link>
                      {c.matchStatus && <StatusPill status={c.matchStatus} />}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {c.professionalCategory} · {c.experience}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.location}</span>
                      {c.employmentPreference && <span>{c.employmentPreference}</span>}
                      {c.expectedSalary && <span>{c.expectedSalary}</span>}
                      {c.availability && <span>Available: {c.availability}</span>}
                    </div>
                    {(c.additionalSkills?.length || c.customSkills) && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {(c.additionalSkills || []).slice(0, 8).map((s) => (
                          <span key={s} className="rounded-full border border-line bg-ivory px-2 py-0.5 text-[0.65rem] text-ink">{s}</span>
                        ))}
                        {c.customSkills?.split(",").filter(Boolean).slice(0, 4).map((s) => (
                          <span key={s} className="rounded-full border border-gold/40 bg-champagne/30 px-2 py-0.5 text-[0.65rem] text-forest">{s.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {/* Quick match status actions */}
                  {(["shortlisted", "introduced", "not-selected"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={updatingId === c._id || c.matchStatus === status}
                      onClick={() => updateMatchStatus(c._id, status)}
                      className={cn(
                        "rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors",
                        c.matchStatus === status
                          ? "border-forest bg-forest text-ivory"
                          : "border-line text-forest hover:border-gold/50",
                        updatingId === c._id && "cursor-wait opacity-60",
                      )}
                    >
                      {status.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    </button>
                  ))}
                  <Link
                    href={`/admin/candidates/${c._id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-gold-dark hover:border-gold/50"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && selectedId && candidates.length === 0 && !error && (
        <div className="py-12 text-center text-sm text-muted">
          No matching candidates found for this requirement. Candidates who have registered for the "{selectedReq?.professionalCategory}" role will appear here.
        </div>
      )}

      {!selectedId && !loadingReqs && (
        <div className="py-12 text-center text-sm text-muted">
          Select a staffing request above to see suggested candidate matches.
        </div>
      )}
    </div>
  );
}

