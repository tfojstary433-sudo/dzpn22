"use client";

import { useState, useEffect } from "react";
import { MatchSchedule } from "./match-schedule";
import { LeagueTable } from "./league-table";
import { Statistics } from "./statistics";

type Tab = "terminarz" | "tabela" | "statystyki";

const TABS: { id: Tab; label: string }[] = [
  { id: "terminarz", label: "TERMINARZ" },
  { id: "tabela", label: "TABELA" },
  { id: "statystyki", label: "STATYSTYKI" },
];

export function TabsContainer() {
  const [activeTab, setActiveTab] = useState<Tab>("terminarz");

  useEffect(() => {
    const hash = window.location.hash.slice(1) as Tab;
    if (hash && TABS.some(t => t.id === hash)) {
      setActiveTab(hash);
    }

    const handleHashChange = () => {
      const newHash = window.location.hash.slice(1) as Tab;
      if (newHash && TABS.some(t => t.id === newHash)) {
        setActiveTab(newHash);
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleTabClick = (tabId: Tab) => {
    window.location.hash = tabId;
    setActiveTab(tabId);
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 mb-8 border-b">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`px-6 py-3 font-semibold text-lg transition-all ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-4 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {activeTab === "terminarz" && <MatchSchedule isInTab={true} />}
          {activeTab === "tabela" && <LeagueTable isInTab={true} />}
          {activeTab === "statystyki" && <Statistics isInTab={true} />}
        </div>
      </div>
    </section>
  );
}
