export interface Party {
  id: string;
  name: string;
  shortName: string;
  color: string;
  bgColor: string;
  leader: string;
  baseVotes: number; // közvélemény-kutatási alap % (2026. március)
  isCoalition?: boolean;
  threshold: number; // küszöb: 5% egyedül, 10% 2-párt koalíció, 15% 3+
}

// Több közvélemény-kutató adatai – 2026. február–március
// Forrás: saját közzétett adaik alapján (biztos szavazók körében)
export const POLL_DATE = "2026. február–március";

export interface PollSource {
  id: string;
  name: string;        // kutató neve
  date: string;        // közzététel hónapja
  bias?: string;       // ismert tendencia (tájékoztatásul)
  votes: Record<string, number>; // pártid → %
}

// Adatok: a kutatók legutóbbi nyilvánosan elérhető méréseik alapján
export const POLL_SOURCES: PollSource[] = [
  {
    id: "atlag",
    name: "Átlag (5 kutató)",
    date: "2026. március",
    votes: {
      fidesz: 46, tisza: 34, mihazank: 7, dk: 4,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 3,
    },
  },
  {
    id: "median",
    name: "Median",
    date: "2026. február",
    bias: "kormány­közelinek tartott",
    votes: {
      fidesz: 50, tisza: 30, mihazank: 7, dk: 4,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 3,
    },
  },
  {
    id: "nezopont",
    name: "Nézőpont Intézet",
    date: "2026. március",
    bias: "kormány­közelinek tartott",
    votes: {
      fidesz: 53, tisza: 27, mihazank: 6, dk: 4,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 4,
    },
  },
  {
    id: "publicus",
    name: "Publicus Institut",
    date: "2026. február",
    bias: "független",
    votes: {
      fidesz: 43, tisza: 37, mihazank: 8, dk: 4,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 2,
    },
  },
  {
    id: "21kutato",
    name: "21 Kutatóközpont",
    date: "2026. március",
    bias: "ellenzék­közelinek tartott",
    votes: {
      fidesz: 40, tisza: 40, mihazank: 8, dk: 5,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 1,
    },
  },
  {
    id: "idea",
    name: "IDEA Intézet",
    date: "2026. február",
    bias: "független",
    votes: {
      fidesz: 44, tisza: 36, mihazank: 7, dk: 4,
      momentum: 2, mszp: 2, lmp: 2, egyeb: 3,
    },
  },
];

export const PARTIES: Party[] = [
  {
    id: "fidesz",
    name: "Fidesz–KDNP",
    shortName: "Fidesz",
    color: "#f97316",
    bgColor: "bg-orange-500",
    leader: "Orbán Viktor",
    baseVotes: 46, // átlag: Median 50%, Nézőpont 53%, Publicus 43%, 21Kutató 40%, IDEA 44%
    threshold: 5,
  },
  {
    id: "tisza",
    name: "TISZA – Tisztelet és Szabadság Párt",
    shortName: "TISZA",
    color: "#3b82f6",
    bgColor: "bg-blue-500",
    leader: "Magyar Péter",
    baseVotes: 34, // átlag: Median 30%, Nézőpont 27%, Publicus 37%, 21Kutató 40%, IDEA 36%
    threshold: 5,
  },
  {
    id: "mihazank",
    name: "Mi Hazánk Mozgalom",
    shortName: "Mi Hazánk",
    color: "#dc2626",
    bgColor: "bg-red-600",
    leader: "Toroczkai László",
    baseVotes: 7, // stabil ~7% körül minden kutatónál
    threshold: 5,
  },
  {
    id: "dk",
    name: "Demokratikus Koalíció",
    shortName: "DK",
    color: "#7c3aed",
    bgColor: "bg-violet-600",
    leader: "Gyurcsány Ferenc",
    baseVotes: 4, // határértéken, csökkenő trend (3-5%)
    threshold: 5,
  },
  {
    id: "momentum",
    name: "Momentum Mozgalom",
    shortName: "Momentum",
    color: "#0ea5e9",
    bgColor: "bg-sky-500",
    leader: "Szabó Tímea",
    baseVotes: 2, // küszöb alatt
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
    leader: "Keresztes László Lóránt",
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
    baseVotes: 3,
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
