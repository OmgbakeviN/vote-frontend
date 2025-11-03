export default function CandidateCard({ candidate, onVote, disabled }) {
  return (
    <div className="rounded-2xl shadow-sm border bg-white overflow-hidden flex flex-col">
      {candidate.photo_url ? (
        <img src={candidate.photo_url} alt={candidate.name} className="h-40 w-full object-cover" />
      ) : (
        <div className="h-40 w-full bg-slate-200 flex items-center justify-center text-slate-500">
          No photo
        </div>
      )}
      <div className="p-4">
        <div className="text-xs text-slate-500">N° {candidate.number}</div>
        <div className="font-semibold text-lg">{candidate.name}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-slate-600">Votes: <b>{candidate.count ?? 0}</b></span>
          <button
            onClick={() => onVote(candidate)}
            disabled={disabled}
            className={`px-3 py-1.5 rounded-lg text-white text-sm ${disabled ? "bg-slate-300 cursor-not-allowed" : "bg-slate-900 hover:bg-black"}`}
          >
            Voter
          </button>
        </div>
      </div>
    </div>
  );
}
