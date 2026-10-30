"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/admin/Button";

export default function PanelError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="mx-auto max-w-lg rounded-2xl border border-line bg-white p-8 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-800">
        <AlertTriangle aria-hidden className="h-5 w-5" />
      </span>
      <h1 className="mt-4 font-serif text-3xl text-forest">This page could not load</h1>
      <p className="mt-2 text-sm text-muted">
        The database may be temporarily unavailable. Please try again in a moment. If it keeps happening, check the server
        logs and the <code className="font-mono text-xs">MONGODB_URI</code> setting.
      </p>
      <Button className="mt-6" onClick={reset} icon={<RotateCcw aria-hidden className="h-4 w-4" />}>
        Try again
      </Button>
    </div>
  );
}
