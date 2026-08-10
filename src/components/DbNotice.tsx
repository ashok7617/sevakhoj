/** Shown when the database isn't reachable yet (fresh checkout, no Postgres). */
export function DbNotice() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
      <p className="font-medium text-slate-800">Database not connected yet.</p>
      <p className="mt-1">
        Start Postgres + PostGIS and load data, then refresh:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-100">
        docker compose up -d{"\n"}npm run db:setup
      </pre>
      <p className="mt-2 text-xs text-slate-500">
        See the README for a Docker-free setup (Postgres.app on macOS).
      </p>
    </div>
  );
}
