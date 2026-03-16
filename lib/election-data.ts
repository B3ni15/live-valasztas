export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  leader: string;
  baseVotes: number; // közvélemény-kutatási alap % (2026 becslés)
  isCoalition?: boolean;
  threshold: number; // küszöb: 5% egyedül, 10% 2-párt koalíció, 15% 3+
}

export const PARTIES: Party[] = [
  {
    id: "fidesz",
    name: "Fidesz–KDNP",
    shortName: "Fidesz",
    color: "#f97316",
    bgColor: "bg-orange-500",
    leader: "Orbán Viktor",
    baseVotes: 44,
    threshold: 5,
  },
  {
    id: "tisza",
    name: "TISZA – Tisztelet és Szabadság Párt",
    shortName: "TISZA",
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    leader: "Magyar Péter",
    baseVotes: 36,
    threshold: 5,
  },
  {
    id: "mihazank",
    name: "Mi Hazánk Mozgalom",
    shortName: "Mi Hazánk",
    color: "#dc2626",
    bgColor: "bg-red-600",
    leader: "Toroczkai László",
    baseVotes: 7,
    threshold: 5,
  },
  {
    id: "dk",
    name: "Demokratikus Koalíció",
    shortName: "DK",
    color: "#7c3aed",
    bgColor: "bg-violet-600",
    leader: "Gyurcsány Ferenc",
    baseVotes: 5,
    threshold: 5,
  },
  {
    id: "momentum",
    name: "Momentum Mozgalom",
    shortName: "Momentum",
    color: "#0ea5e9",
    bgColor: "bg-sky-500",
    leader: "Fekete-Győr András",
    baseVotes: 3,
    threshold: 5,
  },
  {
    id: "mszp",
    name: "MSZP – Szocialisták és Demokraták",
    shortName: "MSZP",
    color: "#ef4444",
    bgColor: "bg-red-500",
    leader: "Kunhalmi Ágnes",
    baseVotes: 2,
    threshold: 5,
  },
  {
    id: "lmp",
    name: "LMP – Magyarország Zöld Pártja",
    shortName: "LMP",
    color: "#22c55e",
    bgColor: "bg-green-500",
    leader: "Ungár Péter",
    baseVotes: 2,
    threshold: 5,
  },
  {
    id: "egyeb",
    name: "Egyéb pártok",
    shortName: "Egyéb",
    color: "#6b7280",
    bgColor: "bg-gray-500",
    leader: "–",
    baseVotes: 1,
    threshold: 999, // soha nem jut be
  },
];

export const TOTAL_SEATS = 199;
export const CONSTITUENCY_SEATS = 106; // egyéni választókerületek
export const LIST_SEATS = 93; // pártlista

/**
 * A szavazatok alapján kiszámolja a mandátumokat.
 * Egyszerűsített D'Hondt módszer az országos listára,
 * az egyéni kerületek első-múlt-a-poszton elvén.
 */
export function calculateSeats(votes: Record<string, number>): Record<string, number> {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  if (total === 0) return {};

  // Küszöbön átjutó pártok
  const eligible = PARTIES.filter((p) => {
    const pct = (votes[p.id] / total) * 100;
    return pct >= p.threshold;
  });

  if (eligible.length === 0) return {};

  const eligibleTotal = eligible.reduce((s, p) => s + (votes[p.id] || 0), 0);

  // Listás mandátumok – D'Hondt
  const listSeats: Record<string, number> = {};
  eligible.forEach((p) => (listSeats[p.id] = 0));

  for (let seat = 0; seat < LIST_SEATS; seat++) {
    let winner = eligible[0].id;
    let maxQuotient = -1;
    eligible.forEach((p) => {
      const quotient = (votes[p.id] || 0) / (listSeats[p.id] + 1);
      if (quotient > maxQuotient) {
        maxQuotient = quotient;
        winner = p.id;
      }
    });
    listSeats[winner]++;
  }

  // Egyéni kerületi mandátumok – arányos közelítés (next.js/szimulációs célra)
  const constituencySeats: Record<string, number> = {};
  eligible.forEach((p) => (constituencySeats[p.id] = 0));

  // Az egyéni kerületeket is D'Hondt-tal osztjuk el, de a vezető párt bónuszt kap
  const sortedByVotes = [...eligible].sort(
    (a, b) => (votes[b.id] || 0) - (votes[a.id] || 0)
  );

  if (sortedByVotes.length > 0) {
    const leader = sortedByVotes[0];
    const leaderShare = (votes[leader.id] || 0) / eligibleTotal;
    // A vezető párt a győztes-vesz-mindent effektus miatt felül arányos
    const leaderBonus = Math.min(0.15, leaderShare * 0.3);

    sortedByVotes.forEach((p, i) => {
      if (i === 0) {
        constituencySeats[p.id] = Math.round(
          CONSTITUENCY_SEATS * (leaderShare + leaderBonus)
        );
      } else {
        const share = (votes[p.id] || 0) / eligibleTotal;
        constituencySeats[p.id] = Math.round(CONSTITUENCY_SEATS * share * 0.85);
      }
    });

    // Korrekció: pontosan CONSTITUENCY_SEATS legyen
    const totalConst = Object.values(constituencySeats).reduce((a, b) => a + b, 0);
    const diff = CONSTITUENCY_SEATS - totalConst;
    if (sortedByVotes.length > 0) {
      constituencySeats[sortedByVotes[0].id] += diff;
    }
  }

  // Összesítés
  const totalSeats: Record<string, number> = {};
  eligible.forEach((p) => {
    totalSeats[p.id] = (listSeats[p.id] || 0) + (constituencySeats[p.id] || 0);
  });

  // Végső korrekció: pontosan 199 mandátum
  const seatTotal = Object.values(totalSeats).reduce((a, b) => a + b, 0);
  const seatDiff = TOTAL_SEATS - seatTotal;
  if (sortedByVotes.length > 0) {
    totalSeats[sortedByVotes[0].id] = (totalSeats[sortedByVotes[0].id] || 0) + seatDiff;
  }

  return totalSeats;
}

export function getVotePercents(votes: Record<string, number>): Record<string, number> {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  if (total === 0) return {};
  const result: Record<string, number> = {};
  PARTIES.forEach((p) => {
    result[p.id] = parseFloat(((votes[p.id] / total) * 100).toFixed(1));
  });
  return result;
}

export function isEligible(partyId: string, votes: Record<string, number>): boolean {
  const total = Object.values(votes).reduce((a, b) => a + b, 0);
  if (total === 0) return false;
  const party = PARTIES.find((p) => p.id === partyId);
  if (!party) return false;
  const pct = (votes[partyId] / total) * 100;
  return pct >= party.threshold;
}
