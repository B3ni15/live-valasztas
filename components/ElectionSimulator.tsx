"use client";

import { useState, useCallback } from "react";
import {
  PARTIES,
  calculateSeats,
  getVotePercents,
  isEligible,
  TOTAL_SEATS,
  POLL_DATE,
} from "@/lib/election-data";
import VoteChart from "@/components/VoteChart";
import ParliamentChart from "@/components/ParliamentChart";
import { RefreshCw, Info } from "lucide-react";

export default function ElectionSimulator() {
  const defaultVotes = Object.fromEntries(
    PARTIES.map((p) => [p.id, p.baseVotes])
  );
  const [votes, setVotes] = useState<Record<string, number>>(defaultVotes);
  const [showInfo, setShowInfo] = useState(false);

  const percents = getVotePercents(votes);
  const seats = calculateSeats(votes);

  const total = Object.values(votes).reduce((a, b) => a + b, 0);

  const handleSlider = useCallback((id: string, value: number) => {
    setVotes((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleReset = () => setVotes(defaultVotes);

  // Győztes párt
  const winner = PARTIES.reduce(
    (best, p) =>
      (seats[p.id] || 0) > (seats[best?.id] || 0) ? p : best,
    PARTIES[0]
  );

  const hasSupermajority = (seats[winner.id] || 0) >= Math.ceil(TOTAL_SEATS * (2 / 3));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Fejléc */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              🇭🇺 Magyar Választási Szimulátor 2026
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Alaphelyzet: {POLL_DATE}-i közvélemény-kutatási átlagok
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Infó"
            >
              <Info size={18} />
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              <RefreshCw size={14} />
              Alaphelyzet
            </button>
          </div>
        </div>
      </header>

      {showInfo && (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <strong>Hogyan működik?</strong> Húzd el a csúszkákat, hogy megváltoztasd az egyes
            pártok szavazatarányát. Az alkalmazás D&apos;Hondt módszerrel számolja ki a
            listás mandátumokat, az egyéni kerületeknél a győztes-vesz-mindent
            elvet alkalmazza. Az 5% alatti pártok nem jutnak be az            Országgyűlésbe. <br /><br />
            <strong>Alaphelyzet:</strong> {POLL_DATE}-i közvélemény-kutatásokban az
            első helyen áll a <strong>Fidesz–KDNP ~46%</strong>-kal, a TISZA
            ~34%-kal második. A <strong>Mi Hazánk ~7%</strong>-ka körül stabilizálódott.
            A <strong>DK ~4%</strong>-kal küszöbértéken van, a Momentum, MSZP, LMP
            egyaránt 5% alatt mérhető.            Országgyűlésbe. Az adatok közvélemény-kutatáson alapuló becslések.
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bal oszlop: csúszkák */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wide">
              Szavazatarányok beállítása
            </h2>
            <div className="space-y-5">
              {PARTIES.filter((p) => p.id !== "egyeb").map((party) => {
                const pct = percents[party.id] ?? 0;
                const eligible = isEligible(party.id, votes);
                return (
                  <div key={party.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: party.color }}
                        />
                        <span className="text-sm font-medium text-slate-700">
                          {party.shortName}
                        </span>
                        <span className="text-xs text-slate-400">{party.leader}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!eligible && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium">
                            kiesik
                          </span>
                        )}
                        <span
                          className="text-sm font-bold"
                          style={{ color: party.color }}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min={0}
                        max={70}
                        step={0.5}
                        value={votes[party.id]}
                        onChange={(e) =>
                          handleSlider(party.id, parseFloat(e.target.value))
                        }
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, ${party.color} 0%, ${party.color} ${(votes[party.id] / 70) * 100}%, #e2e8f0 ${(votes[party.id] / 70) * 100}%, #e2e8f0 100%)`,
                        }}
                      />
                    </div>
                    {eligible && (
                      <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>
                          {seats[party.id] || 0} mandátum
                        </span>
                        <span>
                          {((seats[party.id] || 0) / TOTAL_SEATS * 100).toFixed(1)}%
                          a parlamentben
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Jobb oszlop: eredmények */}
        <div className="lg:col-span-2 space-y-6">
          {/* Összefoglaló kártyák */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div
              className="bg-white rounded-2xl shadow-sm border p-4"
              style={{ borderColor: winner.color + "44" }}
            >
              <p className="text-xs text-slate-500 mb-1">Vezető párt</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: winner.color }}
                />
                <p
                  className="font-bold text-lg"
                  style={{ color: winner.color }}
                >
                  {winner.shortName}
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-800 mt-1">
                {seats[winner.id] || 0}
                <span className="text-sm font-normal text-slate-500 ml-1">
                  / {TOTAL_SEATS}
                </span>
              </p>
              {hasSupermajority && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                  ★ Kétharmad
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Bejutó pártok</p>
              <p className="text-2xl font-bold text-slate-800">
                {PARTIES.filter((p) => isEligible(p.id, votes)).length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {PARTIES.filter(
                  (p) => p.id !== "egyeb" && !isEligible(p.id, votes)
                ).length}{" "}
                párt kiesik
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4">
              <p className="text-xs text-slate-500 mb-1">Többség határa</p>
              <p className="text-2xl font-bold text-slate-800">100</p>
              <p className="text-xs text-slate-400 mt-1">
                Kétharmad:{" "}
                <span className="font-semibold">133 mandátum</span>
              </p>
            </div>
          </div>

          {/* Szavazati arány diagram */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              Szavazatarányok
            </h2>
            <VoteChart percents={percents} />
          </div>

          {/* Parlament vizualizáció */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              Parlamenti mandátumok (199)
            </h2>
            <ParliamentChart seats={seats} />
          </div>

          {/* Mandátum táblázat */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h2 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">
              Részletes eredmények
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 border-b border-slate-100">
                    <th className="text-left pb-2 font-medium">Párt</th>
                    <th className="text-right pb-2 font-medium">Szavazat%</th>
                    <th className="text-right pb-2 font-medium">Mandátum</th>
                    <th className="text-right pb-2 font-medium">Részarány</th>
                    <th className="text-right pb-2 font-medium">Státusz</th>
                  </tr>
                </thead>
                <tbody>
                  {PARTIES.filter((p) => p.id !== "egyeb")
                    .sort(
                      (a, b) =>
                        (percents[b.id] || 0) - (percents[a.id] || 0)
                    )
                    .map((party) => {
                      const eligible = isEligible(party.id, votes);
                      return (
                        <tr
                          key={party.id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2.5">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: party.color }}
                              />
                              <span className="font-medium text-slate-700">
                                {party.name}
                              </span>
                            </div>
                            <div className="text-xs text-slate-400 ml-4.5 pl-4">
                              {party.leader}
                            </div>
                          </td>
                          <td className="text-right py-2.5 font-semibold" style={{ color: party.color }}>
                            {(percents[party.id] || 0).toFixed(1)}%
                          </td>
                          <td className="text-right py-2.5 font-bold text-slate-800">
                            {eligible ? seats[party.id] || 0 : "–"}
                          </td>
                          <td className="text-right py-2.5 text-slate-500">
                            {eligible
                              ? `${((seats[party.id] || 0) / TOTAL_SEATS * 100).toFixed(1)}%`
                              : "–"}
                          </td>
                          <td className="text-right py-2.5">
                            {eligible ? (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                bejut
                              </span>
                            ) : (
                              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                                kiesik
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
        Ez egy szimulációs eszköz. Az adatok közvélemény-kutatásokon alapuló becslések, nem valós választási eredmények.
        A mandátumszámítás egyszerűsített modell.
      </footer>
    </div>
  );
}
