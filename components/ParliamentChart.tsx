"use client";

import { PARTIES, TOTAL_SEATS } from "@/lib/election-data";

interface ParliamentChartProps {
  seats: Record<string, number>;
}

export default function ParliamentChart({ seats }: ParliamentChartProps) {
  // Félkör elrendezés: 199 mandátum
  const rows = [32, 40, 48, 55, 24]; // soronkénti székek (kb. félkör)
  const allSeats: string[] = [];

  // Elosztjuk a mandátumokat soronként, pártok szerint rendezve
  const partyOrder = PARTIES.filter((p) => (seats[p.id] || 0) > 0).sort(
    (a, b) => (seats[b.id] || 0) - (seats[a.id] || 0)
  );

  partyOrder.forEach((p) => {
    for (let i = 0; i < (seats[p.id] || 0); i++) {
      allSeats.push(p.id);
    }
  });

  // Feltöltjük üres helyekkel ha kell
  while (allSeats.length < TOTAL_SEATS) allSeats.push("empty");

  const totalRows = 5;
  const rowConfig = [32, 38, 43, 47, 39]; // összesen ~199

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-full max-w-lg" style={{ height: "220px" }}>
        <svg viewBox="0 0 500 240" className="w-full h-full">
          {(() => {
            const dots: React.ReactElement[] = [];
            let seatIndex = 0;
            const centerX = 250;
            const centerY = 230;
            const baseRadius = 80;
            const rowSpacing = 28;

            for (let row = 0; row < totalRows; row++) {
              const radius = baseRadius + row * rowSpacing;
              const count = rowConfig[row];
              // Félkör: 180 fok
              for (let i = 0; i < count && seatIndex < TOTAL_SEATS; i++) {
                const angle = Math.PI + (i / (count - 1)) * Math.PI;
                const x = centerX + radius * Math.cos(angle);
                const y = centerY + radius * Math.sin(angle);
                const partyId = allSeats[seatIndex];
                const party = PARTIES.find((p) => p.id === partyId);
                const color = party ? party.color : "#e5e7eb";

                dots.push(
                  <circle
                    key={seatIndex}
                    cx={x}
                    cy={y}
                    r={5}
                    fill={color}
                    opacity={partyId === "empty" ? 0.2 : 1}
                  >
                    {party && (
                      <title>
                        {party.shortName}: {seats[party.id]} mandátum
                      </title>
                    )}
                  </circle>
                );
                seatIndex++;
              }
            }
            return dots;
          })()}
        </svg>
      </div>

      {/* Jelmagyarázat */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {partyOrder.map((party) => (
          <div key={party.id} className="flex items-center gap-1.5 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: party.color }}
            />
            <span className="font-medium text-gray-700">{party.shortName}</span>
            <span className="text-gray-500">({seats[party.id]})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
