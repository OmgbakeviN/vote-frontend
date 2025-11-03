// Génère/récupère une signature unique locale (stockée en localStorage)
export function getDeviceSignature(electionId) {
  const key = `election:${electionId}:signature`;
  let sig = localStorage.getItem(key);
  if (!sig) {
    // UUID simple (fallback si crypto indisponible)
    const uuid = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() :
      "sig-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sig = uuid;
    localStorage.setItem(key, sig);
  }
  return sig;
}

export function hasAlreadyVoted(electionId) {
  const k = `election:${electionId}:voted`;
  return localStorage.getItem(k) === "true";
}

export function markVoted(electionId) {
  const k = `election:${electionId}:voted`;
  localStorage.setItem(k, "true");
}
