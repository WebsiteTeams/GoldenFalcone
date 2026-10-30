"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import { adminRequest, formatDate } from "@/lib/admin/client";
import {
  communicationChannels,
  communicationParties,
  connectionStatuses,
  interviewStatuses,
  statusLabel,
  toOptions,
} from "@/lib/admin/constants";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { Select, Textarea } from "./FormField";
import { useToast } from "./ToastNotification";
import { StatusBadge } from "./StatusBadge";

type StaffingRequest = {
  _id: string;
  salonName: string;
  contactName?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  location: string;
  professionalCategory: string;
  quantity: number;
  requiredSkills?: string;
  employmentType?: string;
  experienceRequired?: string;
  salaryRange?: string;
  preferredJoiningDate?: string;
  status: string;
  referenceNumber?: string;
  updatedAt?: string;
};

type Communication = {
  _id?: string;
  channel: string;
  party: string;
  contactedAt: string;
  outcome?: string;
  followUpAt?: string;
  notes?: string;
  createdByName?: string;
};

type StatusChange = { status: string; note?: string; changedAt: string; changedByName?: string };

type Connection = {
  _id?: string;
  connectionStatus: string;
  matchNotes?: string;
  adminNotes?: string;
  shortlistedAt?: string;
  sharedWithSalonAt?: string;
  salonFeedback?: string;
  interviewDate?: string;
  interviewStatus?: string;
  candidateResponse?: string;
  finalOutcome?: string;
  communications?: Communication[];
  statusHistory?: StatusChange[];
  updatedAt?: string;
};

type Candidate = {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  location: string;
  preferredWorkLocation?: string;
  professionalCategory: string;
  additionalSkills?: string[];
  customSkills?: string[];
  experience: string;
  employmentPreference?: string;
  expectedSalary?: string;
  availability?: string;
  status: string;
  matchScore: number;
  matchReasons?: string[];
  connectionStatus: string;
  connection: Connection | null;
  connected?: boolean;
};

const statusOptions = toOptions(connectionStatuses);
const interviewOptions = toOptions(interviewStatuses);
const channelOptions = toOptions(communicationChannels);
const partyOptions = toOptions(communicationParties);

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15";

const toLocalInput = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16);
};

const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : undefined);

const splitSkills = (value: unknown) =>
  Array.isArray(value)
    ? value.map(String).filter(Boolean)
    : String(value ?? "")
        .split(/[,;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

function ScoreRing({ score }: { score: number }) {
  const tone = score >= 70 ? "border-emerald text-forest" : score >= 45 ? "border-gold text-gold-dark" : "border-line text-muted";
  return (
    <span
      className={cn("inline-flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-full border-2 text-sm font-semibold tabular-nums", tone)}
      title={`Match score ${score} of 100`}
    >
      {score}
      <span className="text-[0.5rem] font-medium uppercase tracking-[0.08em]">fit</span>
    </span>
  );
}

function Comparison({ request, candidate }: { request: StaffingRequest; candidate: Candidate }) {
  const requested = splitSkills(request.requiredSkills);
  const own = [...splitSkills(candidate.additionalSkills), ...splitSkills(candidate.customSkills)];
  const matched = requested.filter((skill) => own.some((mine) => mine.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(mine.toLowerCase())));

  const rows = [
    { label: "Role", request: request.professionalCategory, candidate: candidate.professionalCategory },
    { label: "Experience", request: request.experienceRequired || "Flexible", candidate: candidate.experience },
    { label: "Location", request: request.location, candidate: `${candidate.location}${candidate.preferredWorkLocation ? ` · prefers ${candidate.preferredWorkLocation}` : ""}` },
    { label: "Employment", request: request.employmentType || "Not specified", candidate: candidate.employmentPreference || "Not specified" },
    { label: "Salary", request: request.salaryRange || "Not specified", candidate: candidate.expectedSalary || "Not specified" },
    { label: "Availability", request: request.preferredJoiningDate || "Not specified", candidate: candidate.availability || "Not specified" },
  ];

  return (
    <div className="border border-line bg-white">
      <div className="grid grid-cols-[7.5rem_1fr_1fr] border-b border-line bg-ivory/70 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
        <span className="px-3 py-2.5">Compare</span>
        <span className="border-l border-line px-3 py-2.5">Requirement</span>
        <span className="border-l border-line px-3 py-2.5">Candidate</span>
      </div>
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[7.5rem_1fr_1fr] border-b border-line/70 text-xs last:border-0">
          <span className="px-3 py-2.5 font-medium text-muted">{row.label}</span>
          <span className="border-l border-line px-3 py-2.5 text-ink">{row.request}</span>
          <span className="border-l border-line px-3 py-2.5 text-ink">{row.candidate}</span>
        </div>
      ))}
      <div className="border-t border-line px-3 py-3">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Skills · {matched.length}/{requested.length} requested matched
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {own.length ? (
            own.map((skill) => {
              const isMatch = requested.some((r) => r.toLowerCase() === skill.toLowerCase() || skill.toLowerCase().includes(r.toLowerCase()));
              return (
                <span
                  key={skill}
                  className={cn(
                    "border px-2 py-0.5 text-[0.65rem]",
                    isMatch ? "border-emerald/30 bg-emerald/10 text-emerald" : "border-line bg-ivory text-ink/80",
                  )}
                >
                  {skill}
                </span>
              );
            })
          ) : (
            <span className="text-xs text-muted">No skills recorded.</span>
          )}
        </div>
        {requested.length ? (
          <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
            <span className="font-semibold text-ink">Requested:</span> {requested.join(", ")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function CandidatePanel({
  request,
  candidate,
  onSaved,
}: {
  request: StaffingRequest;
  candidate: Candidate;
  onSaved: (connection: Connection, status: string) => void;
}) {
  const toast = useToast();
  const connection = candidate.connection;

  const [form, setForm] = useState({
    connectionStatus: candidate.connectionStatus || "suggested",
    matchNotes: connection?.matchNotes ?? "",
    adminNotes: connection?.adminNotes ?? "",
    salonFeedback: connection?.salonFeedback ?? "",
    candidateResponse: connection?.candidateResponse ?? "",
    finalOutcome: connection?.finalOutcome ?? "",
    interviewStatus: connection?.interviewStatus ?? "not-scheduled",
    interviewDate: toLocalInput(connection?.interviewDate),
    sharedWithSalonAt: toLocalInput(connection?.sharedWithSalonAt),
  });
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState({
    channel: "call",
    party: "candidate",
    contactedAt: toLocalInput(new Date().toISOString()),
    outcome: "",
    followUpAt: "",
    notes: "",
  });
  const [logging, setLogging] = useState(false);

  const set = (key: keyof typeof form) => (value: string) => setForm((previous) => ({ ...previous, [key]: value }));

  const save = async (override?: Partial<typeof form>) => {
    const next = { ...form, ...override };
    setSaving(true);
    const result = await adminRequest<Connection>("/api/admin/matching", {
      method: "POST",
      body: {
        candidateId: candidate._id,
        staffingRequestId: request._id,
        connectionStatus: next.connectionStatus,
        matchNotes: next.matchNotes,
        adminNotes: next.adminNotes,
        salonFeedback: next.salonFeedback,
        candidateResponse: next.candidateResponse,
        finalOutcome: next.finalOutcome,
        interviewStatus: next.interviewStatus,
        interviewDate: fromLocalInput(next.interviewDate),
        sharedWithSalonAt: fromLocalInput(next.sharedWithSalonAt),
      },
    });
    setSaving(false);
    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }
    setForm(next);
    onSaved(result.data, next.connectionStatus);
    toast.success(result.message);
  };

  const quickStatus = (status: Connection["connectionStatus"]) => {
    const patch: Partial<typeof form> = { connectionStatus: status };
    if (status === "shared-with-salon" && !form.sharedWithSalonAt) patch.sharedWithSalonAt = toLocalInput(new Date().toISOString());
    if (status === "interview-scheduled" && form.interviewStatus === "not-scheduled") {
      patch.interviewStatus = "scheduled";
      if (!form.interviewDate) patch.interviewDate = toLocalInput(new Date().toISOString());
    }
    void save(patch);
  };

  const logContact = async () => {
    setLogging(true);
    const result = await adminRequest<Connection>("/api/admin/matching", {
      method: "POST",
      body: {
        action: "log-contact",
        candidateId: candidate._id,
        staffingRequestId: request._id,
        channel: contact.channel,
        party: contact.party,
        contactedAt: fromLocalInput(contact.contactedAt),
        outcome: contact.outcome,
        followUpAt: fromLocalInput(contact.followUpAt),
        notes: contact.notes,
      },
    });
    setLogging(false);
    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }
    onSaved(result.data, form.connectionStatus);
    setContact((previous) => ({ ...previous, outcome: "", followUpAt: "", notes: "" }));
    toast.success("Contact logged.");
  };

  const comms = connection?.communications ?? [];
  const history = connection?.statusHistory ?? [];
  const followUps = comms.filter((c) => c.followUpAt && new Date(c.followUpAt) >= new Date(new Date().toDateString()));

  const waPhone = (candidate.whatsapp || candidate.phone).replace(/\s/g, "");

  return (
    <div className="border-t border-line bg-ivory/40 p-4 sm:p-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <Comparison request={request} candidate={candidate} />

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <a href={`tel:${candidate.phone.replace(/\s/g, "")}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-forest hover:border-gold/50">
              <Phone aria-hidden className="h-3.5 w-3.5" /> Call
            </a>
            <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-forest hover:border-gold/50">
              <MessageSquare aria-hidden className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a href={`mailto:${candidate.email}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-forest hover:border-gold/50">
              <Mail aria-hidden className="h-3.5 w-3.5" /> Email
            </a>
            <Link href={`/admin/candidates/${candidate._id}`} className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs font-medium text-gold-dark hover:border-gold/50">
              Open profile <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="border border-line bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-medium text-muted">
                Relationship status
                <Select
                  className="mt-1"
                  value={form.connectionStatus}
                  onChange={(e) => set("connectionStatus")(e.target.value)}
                  options={statusOptions}
                  placeholder="Select status"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Interview status
                <Select
                  className="mt-1"
                  value={form.interviewStatus}
                  onChange={(e) => set("interviewStatus")(e.target.value)}
                  options={interviewOptions}
                  placeholder="Select interview status"
                />
              </label>
              <label className="text-xs font-medium text-muted">
                Interview date
                <input type="datetime-local" value={form.interviewDate} onChange={(e) => set("interviewDate")(e.target.value)} className={`mt-1 ${inputClass}`} />
              </label>
              <label className="text-xs font-medium text-muted">
                Shared with salon
                <input type="datetime-local" value={form.sharedWithSalonAt} onChange={(e) => set("sharedWithSalonAt")(e.target.value)} className={`mt-1 ${inputClass}`} />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(["shortlisted", "shared-with-salon", "interview-scheduled"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => quickStatus(status)}
                  disabled={saving}
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 border px-2.5 text-[0.7rem] font-semibold transition-colors disabled:opacity-60",
                    form.connectionStatus === status
                      ? "border-forest bg-forest text-ivory"
                      : "border-line bg-white text-forest hover:border-gold/60",
                  )}
                >
                  {statusLabel(status)}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-3">
              <label className="text-xs font-medium text-muted">
                Internal match notes
                <Textarea className="mt-1" rows={2} value={form.matchNotes} onChange={(e) => set("matchNotes")(e.target.value)} placeholder="Why this candidate fits, or what to verify." />
              </label>
              <label className="text-xs font-medium text-muted">
                Salon feedback
                <Textarea className="mt-1" rows={2} value={form.salonFeedback} onChange={(e) => set("salonFeedback")(e.target.value)} placeholder="What the salon said after reviewing the profile." />
              </label>
              <label className="text-xs font-medium text-muted">
                Candidate response
                <Textarea className="mt-1" rows={2} value={form.candidateResponse} onChange={(e) => set("candidateResponse")(e.target.value)} placeholder="Interest, notice period, questions." />
              </label>
              <label className="text-xs font-medium text-muted">
                Final outcome
                <Textarea className="mt-1" rows={2} value={form.finalOutcome} onChange={(e) => set("finalOutcome")(e.target.value)} placeholder="Outcome, offer terms or reason for closing." />
              </label>
            </div>

            <div className="mt-3 flex justify-end">
              <Button onClick={() => void save()} pending={saving} icon={<CheckCircle2 aria-hidden className="h-4 w-4" />}>
                Save connection
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="border border-line bg-white p-4">
          <h4 className="flex items-center gap-2 font-serif text-xl text-forest">
            <CalendarClock aria-hidden className="h-4 w-4 text-gold-dark" /> Log a contact
          </h4>
          <p className="mt-1 text-xs text-muted">Record every call, message or meeting so the next person has context.</p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-medium text-muted">
              Channel
              <Select className="mt-1" value={contact.channel} onChange={(e) => setContact({ ...contact, channel: e.target.value })} options={channelOptions} />
            </label>
            <label className="text-xs font-medium text-muted">
              Party
              <Select className="mt-1" value={contact.party} onChange={(e) => setContact({ ...contact, party: e.target.value })} options={partyOptions} />
            </label>
            <label className="text-xs font-medium text-muted">
              Contacted at
              <input type="datetime-local" value={contact.contactedAt} onChange={(e) => setContact({ ...contact, contactedAt: e.target.value })} className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-xs font-medium text-muted">
              Follow-up reminder
              <input type="datetime-local" value={contact.followUpAt} onChange={(e) => setContact({ ...contact, followUpAt: e.target.value })} className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-xs font-medium text-muted sm:col-span-2">
              Outcome
              <input value={contact.outcome} onChange={(e) => setContact({ ...contact, outcome: e.target.value })} placeholder="e.g. Interested, asked for salary details" className={`mt-1 ${inputClass}`} />
            </label>
            <label className="text-xs font-medium text-muted sm:col-span-2">
              Notes
              <Textarea className="mt-1" rows={2} value={contact.notes} onChange={(e) => setContact({ ...contact, notes: e.target.value })} placeholder="Anything else worth remembering." />
            </label>
          </div>

          <div className="mt-3 flex justify-end">
            <Button onClick={logContact} pending={logging} variant="secondary" icon={<Send aria-hidden className="h-4 w-4" />}>
              Log contact
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {followUps.length ? (
            <div className="border border-gold/40 bg-champagne/25 p-4">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-forest">
                <CalendarClock aria-hidden className="h-4 w-4 text-gold-dark" /> Pending follow-ups
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs text-ink/80">
                {followUps.map((item, i) => (
                  <li key={item._id ?? i} className="flex flex-wrap items-center gap-x-2">
                    <span className="font-semibold">{statusLabel(item.party)}</span>
                    <span>·</span>
                    <span>{statusLabel(item.channel)}</span>
                    <span>·</span>
                    <span>{formatDate(item.followUpAt, true)}</span>
                    {item.outcome ? <span className="text-muted">— {item.outcome}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="border border-line bg-white p-4">
            <h4 className="font-serif text-xl text-forest">Contact history</h4>
            {comms.length ? (
              <ol className="mt-3 space-y-3">
                {[...comms].reverse().map((item, i) => (
                  <li key={item._id ?? i} className="border-t border-line pt-2.5 text-xs first:border-0 first:pt-0">
                    <p className="font-medium text-ink">
                      {statusLabel(item.channel)} with {statusLabel(item.party)} · {formatDate(item.contactedAt, true)}
                    </p>
                    {item.outcome ? <p className="mt-0.5 text-muted">{item.outcome}</p> : null}
                    {item.notes ? <p className="mt-0.5 text-muted/90">{item.notes}</p> : null}
                    <p className="mt-0.5 text-[0.65rem] text-muted">
                      {item.createdByName ? `Logged by ${item.createdByName}` : "Logged"}
                      {item.followUpAt ? ` · Follow up ${formatDate(item.followUpAt, true)}` : ""}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-2 text-xs text-muted">No contact has been logged for this connection yet.</p>
            )}
          </div>

          {history.length ? (
            <div className="border border-line bg-white p-4">
              <h4 className="font-serif text-xl text-forest">Status history</h4>
              <ol className="mt-3 space-y-2 text-xs">
                {[...history].reverse().map((item, i) => (
                  <li key={i} className="flex flex-wrap items-baseline gap-x-2">
                    <StatusBadge status={item.status} />
                    <span className="text-muted">{formatDate(item.changedAt, true)}</span>
                    {item.changedByName ? <span className="text-muted">· {item.changedByName}</span> : null}
                    {item.note ? <span className="w-full text-muted/90">{item.note}</span> : null}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function StaffingMatchWorkbench({
  staffingId,
  compact,
}: {
  /** When provided, the workbench is locked to this requirement. */
  staffingId?: string;
  compact?: boolean;
}) {
  const [requests, setRequests] = useState<StaffingRequest[]>([]);
  const [selectedId, setSelectedId] = useState(staffingId ?? "");
  const [request, setRequest] = useState<StaffingRequest | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(!staffingId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [openId, setOpenId] = useState<string>();
  const [query, setQuery] = useState("");
  const [scoreFilter, setScoreFilter] = useState("all");

  useEffect(() => {
    if (staffingId) return;
    let active = true;
    adminRequest<{ items: StaffingRequest[] }>("/api/admin/staffing?page=1&sort=newest")
      .then((result) => {
        if (!active) return;
        if (result.ok && result.data) setRequests(result.data.items);
        else setError(result.message);
      })
      .finally(() => active && setLoadingRequests(false));
    return () => {
      active = false;
    };
  }, [staffingId]);

  const load = useCallback(
    async (id: string) => {
      if (!id) {
        setRequest(null);
        setCandidates([]);
        return;
      }
      setLoading(true);
      setError(undefined);
      setOpenId(undefined);
      const result = await adminRequest<{ staffingRequest: StaffingRequest; candidates: Candidate[] }>(
        `/api/admin/matching?staffingId=${id}`,
      );
      setLoading(false);
      if (!result.ok || !result.data) {
        setError(result.message);
        return;
      }
      setRequest(result.data.staffingRequest);
      setCandidates(result.data.candidates);
    },
    [],
  );

  useEffect(() => {
    if (staffingId) {
      setSelectedId(staffingId);
      void load(staffingId);
    }
  }, [staffingId, load]);

  const onSaved = (candidateId: string, connection: Connection, status: string) => {
    setCandidates((previous) =>
      previous.map((c) => (c._id === candidateId ? { ...c, connection, connectionStatus: status, connected: true } : c)),
    );
  };

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return candidates.filter((candidate) => {
      if (scoreFilter === "strong" && candidate.matchScore < 65) return false;
      if (scoreFilter === "connected" && !candidate.connected) return false;
      if (!term) return true;
      return [candidate.fullName, candidate.professionalCategory, candidate.location, candidate.experience, candidate.email, candidate.phone, ...(candidate.additionalSkills ?? []), ...(candidate.customSkills ?? [])]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [candidates, query, scoreFilter]);

  const strongCount = candidates.filter((c) => c.matchScore >= 65).length;
  const connectedCount = candidates.filter((c) => c.connected).length;
  const followUpCount = candidates.reduce(
    (total, c) => total + (c.connection?.communications ?? []).filter((item) => item.followUpAt && new Date(item.followUpAt) >= new Date(new Date().toDateString())).length,
    0,
  );

  const select = (id: string) => {
    setSelectedId(id);
    void load(id);
  };

  return (
    <div className="space-y-5">
      {!staffingId ? (
        <div className="border border-line bg-white p-4">
          <label htmlFor="match-request" className="text-xs font-medium text-muted">
            Hiring requirement
          </label>
          {loadingRequests ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted">
              <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Loading requests…
            </p>
          ) : (
            <div className="relative mt-1">
              <select
                id="match-request"
                value={selectedId}
                onChange={(e) => select(e.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-line bg-white px-3 pr-9 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
              >
                <option value="">Choose a requirement to begin…</option>
                {requests.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.salonName} — {r.professionalCategory} × {r.quantity} — {r.location}
                    {r.referenceNumber ? ` (${r.referenceNumber})` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            </div>
          )}
        </div>
      ) : null}

      {request ? (
        <div className="border border-line bg-ivory-dark/50 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-dark">Active requirement</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <h2 className="font-serif text-2xl text-forest">{request.salonName}</h2>
                <StatusBadge status={request.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {request.quantity} × {request.professionalCategory} · {request.location}
                {request.employmentType ? ` · ${request.employmentType}` : ""}
                {request.experienceRequired ? ` · ${request.experienceRequired}` : ""}
              </p>
              {request.requiredSkills ? (
                <p className="mt-1.5 text-xs text-muted">
                  <span className="font-semibold text-ink">Skills:</span> {request.requiredSkills}
                </p>
              ) : null}
            </div>
            <Link href={`/admin/staffing/${request._id}`} className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-gold-dark hover:text-forest">
              Full requirement <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-line pt-3 text-xs sm:grid-cols-4">
            {[
              ["Candidates", candidates.length],
              ["Strong fits", strongCount],
              ["Attached", connectedCount],
              ["Follow-ups", followUpCount],
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-[0.62rem] uppercase tracking-[0.12em] text-muted">{label}</p>
                <p className="mt-0.5 font-serif text-2xl text-forest tabular-nums">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {error ? <p role="alert" className="border border-red-800/20 bg-red-50 px-4 py-3 text-sm text-red-900">{error}</p> : null}

      {request ? (
        <div className={cn("flex flex-col gap-3 sm:flex-row", compact && "sm:items-center")}>
          <div className="relative flex-1">
            <Search aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name, skill, location or contact"
              aria-label="Filter suggested candidates"
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm text-ink focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
            />
          </div>
          <div className="flex gap-2">
            {[
              ["all", "All"],
              ["strong", "Strong fits"],
              ["connected", "Attached"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setScoreFilter(value)}
                aria-pressed={scoreFilter === value}
                className={cn(
                  "h-10 border px-3 text-xs font-semibold transition-colors",
                  scoreFilter === value ? "border-forest bg-forest text-ivory" : "border-line bg-white text-forest hover:border-gold/60",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
          <Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Scoring candidates…
        </p>
      ) : null}

      {!loading && request && filtered.length ? (
        <ul className="divide-y divide-line border border-line bg-white">
          {filtered.map((candidate) => {
            const open = openId === candidate._id;
            return (
              <li key={candidate._id}>
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
                  <div className="flex min-w-0 items-start gap-4">
                    <ScoreRing score={candidate.matchScore} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/admin/candidates/${candidate._id}`} className="font-medium text-forest hover:text-gold-dark">
                          {candidate.fullName}
                        </Link>
                        <StatusBadge status={candidate.connectionStatus} />
                        {candidate.connected ? (
                          <span className="inline-flex items-center gap-1 text-[0.65rem] font-medium text-emerald">
                            <CheckCircle2 aria-hidden className="h-3 w-3" /> attached
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {candidate.professionalCategory} · {candidate.experience}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                        <span className="inline-flex items-center gap-1">
                          <MapPin aria-hidden className="h-3 w-3" /> {candidate.location}
                        </span>
                        {candidate.employmentPreference ? <span>{candidate.employmentPreference}</span> : null}
                        {candidate.expectedSalary ? <span>{candidate.expectedSalary}</span> : null}
                        {candidate.availability ? <span>Available: {candidate.availability}</span> : null}
                      </div>
                      {candidate.matchReasons?.length ? (
                        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.68rem] text-muted">
                          <Sparkles aria-hidden className="h-3 w-3 text-gold-dark" />
                          {candidate.matchReasons.join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      variant={open ? "primary" : "secondary"}
                      onClick={() => setOpenId(open ? undefined : candidate._id)}
                      className="h-9 px-3 text-xs"
                      icon={<UserRound aria-hidden className="h-3.5 w-3.5" />}
                    >
                      {open ? "Close" : "Review"}
                    </Button>
                    <Link href={`/admin/candidates/${candidate._id}`} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-xs font-semibold text-gold-dark hover:border-gold/50">
                      Profile <ArrowRight aria-hidden className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {open ? <CandidatePanel request={request} candidate={candidate} onSaved={(connection, status) => onSaved(candidate._id, connection, status)} /> : null}
              </li>
            );
          })}
        </ul>
      ) : null}

      {!loading && request && !filtered.length ? (
        <p className="border border-line bg-white px-4 py-10 text-center text-sm text-muted">
          No candidates match this filter. Try clearing the search or choosing another discipline.
        </p>
      ) : null}

      {!request && !loadingRequests ? (
        <div className="border border-dashed border-line px-4 py-12 text-center">
          <p className="font-serif text-2xl text-forest">Select a requirement to begin</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Candidates are scored on role, skills, location, experience, employment preference and salary. Every score
            is explainable, and nothing is shared with a salon until you mark it.
          </p>
        </div>
      ) : null}
    </div>
  );
}
