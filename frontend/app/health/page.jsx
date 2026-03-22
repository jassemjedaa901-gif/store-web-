"use client";

import { useEffect, useState } from "react";

export default function HealthPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    fetch(`${base}/api/health`)
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e.message || e)));
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-lg">
      <div className="flex flex-col items-center text-center gap-6 rounded-xl border border-border bg-background/90 p-8 shadow-sm">
        <img src="/icon.svg" alt="Store Web" width={72} height={72} className="rounded-2xl w-[72px] h-[72px]" />
        <div>
          <h1 className="font-display text-2xl font-semibold text-foreground">Store Web</h1>
          <p className="text-sm text-muted-foreground mt-1">État de l’API</p>
        </div>
        {err && (
          <p className="text-sm text-destructive w-full break-words text-left">{err}</p>
        )}
        {data && (
          <pre className="w-full text-left text-xs bg-muted/60 rounded-lg p-4 overflow-x-auto text-foreground">
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
        {!data && !err && (
          <p className="text-sm text-muted-foreground">Chargement…</p>
        )}
        <p className="text-xs text-muted-foreground">
          L’endpoint brut JSON reste sur <code className="rounded bg-muted px-1">/api/health</code>
        </p>
      </div>
    </div>
  );
}
