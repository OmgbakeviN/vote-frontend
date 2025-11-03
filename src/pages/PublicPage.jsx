import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getActiveElection, getElectionAggregates, postVote } from "../api.js";
import CandidateCard from "../components/CandidateCard.jsx";
import PieResults from "../components/PieResults.jsx";
import useInterval from "../hooks/useInterval.js";
import { getDeviceSignature, hasAlreadyVoted, markVoted } from "../utils/signature.js";
import { playBeep } from "../utils/beep.js";

export default function PublicPage() {
  const [loading, setLoading] = useState(true);
  const [election, setElection] = useState(null); // full object
  const [error, setError] = useState("");
  const [justVoted, setJustVoted] = useState(false);
  const lastTotalsRef = useRef(null); // pour détecter un changement de votes

  // 1) Charger une fois à l’arrivée
  const fetchActive = useCallback(async () => {
    try {
      const { data } = await getActiveElection();
      setElection(data?.election || null);
      setError("");
      setLoading(false);
      if (data?.election) {
        const totals = (data.election.candidates || []).map(c => c.count ?? 0).join("|");
        lastTotalsRef.current = totals;
      }
    } catch (e) {
      setError("Erreur réseau.");
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchActive(); }, [fetchActive]);

  // ✅ NOUVEAU — Polling “active” si aucune élection n’est chargée (ex: admin ouvre plus tard)
  useInterval(async () => {
    if (election) return; // si on a déjà une élection, on laisse l’autre polling faire son travail
    try {
      const { data } = await getActiveElection();
      if (data?.election) {
        setElection(data.election);
        const totals = (data.election.candidates || []).map(c => c.count ?? 0).join("|");
        lastTotalsRef.current = totals;
        setLoading(false);
      }
    } catch { /* ignore soft */ }
  }, !election ? 1500 : null);

  // 2) Polling des agrégats quand une élection existe (PENDING/OPEN/CLOSED)
  useInterval(async () => {
    if (!election?.id) return;
    try {
      const { data } = await getElectionAggregates(election.id);
      setElection(data);
      const totals = (data.candidates || []).map(c => c.count ?? 0).join("|");
      if (lastTotalsRef.current && totals !== lastTotalsRef.current) {
        await playBeep();
      }
      lastTotalsRef.current = totals;
    } catch (e) { }
  }, election?.status === "CLOSED" ? 4000 : election ? 1200 : null);

  // 3) Countdown côté client (on décrémente visuellement, mais le polling resynchronise)
  const [clientRemaining, setClientRemaining] = useState(0);
  useEffect(() => {
    setClientRemaining(election?.remaining_seconds ?? 0);
  }, [election?.remaining_seconds]);

  useInterval(() => {
    setClientRemaining((s) => (s > 0 ? s - 1 : 0));
  }, election?.status === "OPEN" ? 1000 : null);

  const voted = useMemo(() => election?.id ? hasAlreadyVoted(election.id) : false, [election?.id]);

  const handleVote = async (candidate) => {
    if (!election?.id) return;
    if (voted) return;
    if (election.status !== "OPEN") return;

    try {
      const device_signature = getDeviceSignature(election.id);
      const { data } = await postVote(election.id, { candidate_id: candidate.id, device_signature });
      // succès
      markVoted(election.id);
      setElection(data?.election || election);
      setJustVoted(true);
      await playBeep(); // feedback immédiat local
      setTimeout(() => setJustVoted(false), 2000);
    } catch (e) {
      // Conflit: déjà voté ou autre
      setError(e?.response?.data?.detail || "Vote refusé.");
      setTimeout(() => setError(""), 2500);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Chargement…</div>;
  }

  if (!election) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl font-semibold mb-2">Aucune élection en cours</h1>
        <p className="text-slate-600">Revenez plus tard.</p>
      </div>
    );
  }

  const beforeOpen = election.status === "PENDING";
  const isOpen = election.status === "OPEN";
  const closed = election.status === "CLOSED";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{election.title}</h1>
          <div className="text-sm text-slate-600">Statut: <b>{election.status}</b></div>
        </div>
        <div className="text-right">
          {(isOpen || closed) && (
            <div className="text-sm">
              Temps restant: <span className="font-semibold">{formatTime(clientRemaining)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Zone info */}
      {beforeOpen && (
        <div className="p-4 rounded-xl border bg-white">
          <div className="font-medium">Le vote n’a pas encore commencé.</div>
          <div className="text-sm text-slate-600">La liste des candidats est visible ci-dessous. Le bouton “Voter” apparaîtra à l’ouverture.</div>
        </div>
      )}

      {!!error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">{error}</div>
      )}

      {justVoted && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700">
          Merci, votre vote a été pris en compte !
        </div>
      )}

      {/* En mode résultats purs après fermeture (ou pendant, si tu veux afficher en grand) */}
      {(closed || isOpen) && (
        <div className="rounded-2xl border bg-white p-4">
          <h2 className="font-semibold mb-2">Résultats en temps réel</h2>
          <PieResults candidates={election.candidates} />
        </div>
      )}


      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(election.candidates || []).map(c => (
          <CandidateCard
            key={c.id}
            candidate={c}
            onVote={handleVote}
            canVote={isOpen && !voted}     
          />
        ))}
      </section>

      {/* Message si l'utilisateur a déjà voté */}
      {voted && (
        <div className="p-3 rounded-lg bg-slate-100 border text-slate-700">
          Vous avez déjà voté sur cet appareil. Vous pouvez suivre l’évolution du pie chart.
        </div>
      )}
    </div>
  );
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}
