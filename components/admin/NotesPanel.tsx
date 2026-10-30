"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, MessageSquarePlus } from "lucide-react";
import { adminRequest, formatDate } from "@/lib/admin/client";
import { Button } from "./Button";
import { useToast } from "./ToastNotification";

export type Note = { _id: string; body: string; authorName?: string; createdAt: string };

/** Private internal notes. They are never returned by public endpoints. */
export function NotesPanel({ endpoint, initialNotes }: { endpoint: string; initialNotes: Note[] }) {
  const toast = useToast();
  const [notes, setNotes] = useState(initialNotes);
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return setError("Write a note first");
    setSaving(true);
    const result = await adminRequest<Note[]>(`${endpoint}/notes`, { body: { body } });
    setSaving(false);
    if (result.ok && result.data) {
      setNotes(result.data);
      setBody("");
      setError(undefined);
      toast.success("Note added.");
    } else {
      setError(result.errors?.body);
      toast.error(result.message);
    }
  };

  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-muted">
        <Lock aria-hidden className="h-3.5 w-3.5" /> Visible to administrators only.
      </p>

      <form onSubmit={add} className="mt-4">
        <label htmlFor="note-body" className="sr-only">
          New note
        </label>
        <textarea
          id="note-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          maxLength={2000}
          placeholder="Add an internal note — call outcome, follow-up date, next step…"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "note-error" : undefined}
          className="w-full resize-y rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/60 focus:border-gold focus:outline-none focus:ring-4 focus:ring-gold/15"
        />
        {error ? (
          <p id="note-error" role="alert" className="mt-1 text-xs font-medium text-red-800">
            {error}
          </p>
        ) : null}
        <Button type="submit" variant="secondary" pending={saving} icon={<MessageSquarePlus aria-hidden className="h-4 w-4" />} className="mt-2">
          Add note
        </Button>
      </form>

      {notes.length ? (
        <ol className="mt-6 space-y-3">
          <AnimatePresence initial={false}>
            {[...notes].reverse().map((n) => (
              <motion.li
                key={n._id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-line bg-ivory/60 px-4 py-3"
              >
                <p className="whitespace-pre-line text-sm text-ink">{n.body}</p>
                <p className="mt-1.5 text-xs text-muted">
                  {n.authorName ?? "Administrator"} · {formatDate(n.createdAt, true)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ol>
      ) : (
        <p className="mt-6 text-sm text-muted">No notes yet.</p>
      )}
    </div>
  );
}
