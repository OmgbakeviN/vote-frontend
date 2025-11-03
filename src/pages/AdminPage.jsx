import { useEffect, useState } from "react";
import { getElectionAggregates, openElection, closeElection } from "../api.js";
import PieResults from "../components/PieResults.jsx";

export default function AdminPage() {
  const [electionId, setElectionId] = useState("");
  const [data, setData] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    if (!electionId) return;
    try {
      const { data } = await getElectionAggregates(Number(electionId));
      setData(data);
      setMsg("");
    } catch (e) {
      setMsg("Introuvable / erreur.");
      setData(null);
    }
  };

  const doOpen = async () => {
    if (!electionId) return;
    try {
      const { data } = await openElection(Number(electionId));
      setData(data?.election || null);
      setMsg("Élection ouverte.");
    } catch {
      setMsg("Erreur à l’ouverture.");
    }
  };

  const doClose = async () => {
    if (!electionId) return;
    try {
      const { data } = await closeElection(Number(electionId));
      setData(data?.election || null);
      setMsg("Élection fermée.");
    } catch {
      setMsg("Erreur à la fermeture.");
    }
  };

  useEffect(() => {
    setData(null);
    setMsg("");
  }, [electionId]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <div className="p-4 rounded-xl border bg-white flex items-center gap-3">
        <input
          className="px-3 py-2 border rounded-lg w-40"
          placeholder="ID élection"
          value={electionId}
          onChange={e => setElectionId(e.target.value)}
        />
        <button onClick={load} className="px-3 py-2 rounded-lg bg-slate-900 text-white">Charger</button>
        <div className="flex-1" />
        <button onClick={doOpen} className="px-3 py-2 rounded-lg bg-green-600 text-white">Ouvrir</button>
        <button onClick={doClose} className="px-3 py-2 rounded-lg bg-red-600 text-white">Fermer</button>
      </div>

      {!!msg && <div className="p-3 rounded-lg bg-slate-100 border">{msg}</div>}

      {data && (
        <div className="rounded-2xl border bg-white p-4 space-y-3">
          <div className="text-sm text-slate-600">Status: <b>{data.status}</b> — Remaining: <b>{data.remaining_seconds}s</b></div>
          <PieResults candidates={data.candidates} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {(data.candidates || []).map(c => (
              <div key={c.id} className="text-sm p-2 border rounded-lg">
                <div className="font-medium">{c.number}. {c.name}</div>
                <div>Votes: <b>{c.count ?? 0}</b></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
