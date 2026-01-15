"use client";

import { useEffect, useState } from "react";
import { useStudyStore } from "../../../lib/store/useStudyStore";
import DeadlineCard from "../../../components/dashboard/DeadlineCard";
import { Flame, Timer, Trophy, Quote } from "lucide-react";

export default function DashboardPage() {
  const { totalTime, sessionsCompleted } = useStudyStore();
  const [greeting, setGreeting] = useState("Good Morning");
  const [quote, setQuote] = useState({ text: "Stay Hard.", author: "Goggins" });

  // 1. The Quote Bank
  const quotes = [
    { text: "We don't stop when we're tired. We stop when we're done.", author: "David Goggins" },
    { text: "He who has a why to live can bear almost any how.", author: "Nietzsche" },
    { text: "Discipline is doing what you hate to do like you love it.", author: "Mike Tyson" },
    { text: "You have power over your mind - not outside events.", author: "Marcus Aurelius" },
    { text: "The only easy day was yesterday.", author: "Navy SEALs" },
    { text: "It pays to be a winner.", author: "SEAL Creed" },
    { text: "Suffer the pain of discipline or the pain of regret.", author: "Unknown" },
    { text: "Your potential is on the other side of your comfort zone.", author: "Unknown" },
    { text: "Don't count the days, make the days count.", author: "Muhammad Ali" },
    { text: "Stay Hard.", author: "David Goggins" }
  ];

  useEffect(() => {
    // Set Greeting
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    // Set Random Quote
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <div className="h-full flex flex-col p-6 space-y-8">
      
      {/* Header */}
      <div className="space-y-1 mt-4">
        <h2 className="text-zinc-500 font-medium text-sm uppercase tracking-wider">
          FlowState.os
        </h2>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          {greeting}, Chittesh.
        </h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Timer size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Focus Time</span>
          <div>
            <span className="text-3xl font-bold text-white">
              {(totalTime / 60).toFixed(1)}
            </span>
            <span className="text-sm text-zinc-500 ml-1">hrs</span>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame size={40} />
          </div>
          <span className="text-zinc-500 text-xs font-medium uppercase">Sessions</span>
          <div>
            <span className="text-3xl font-bold text-white">
              {sessionsCompleted}
            </span>
            <span className="text-sm text-zinc-500 ml-1">done</span>
          </div>
        </div>
      </div>

      {/* Deadline Card */}
      <div>
        <DeadlineCard />
      </div>

      {/* NEW: Motivation Footer */}
      <div className="mt-auto bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-4 flex gap-3 items-center">
        <div className="p-2 bg-white/5 rounded-full shrink-0">
          <Quote size={16} className="text-zinc-400" />
        </div>
        <div>
          <p className="text-zinc-300 text-xs font-medium italic">"{quote.text}"</p>
          <p className="text-zinc-500 text-[10px] uppercase tracking-wider mt-1">— {quote.author}</p>
        </div>
      </div>

    </div>
  );
}