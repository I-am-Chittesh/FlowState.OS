"use client";

import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface MobileShellProps {
  children: ReactNode;
}

export default function MobileShell({ children }: MobileShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-black text-white flex justify-center overflow-hidden">
      {/* The Mobile Frame */}
      <div className="w-full max-w-md h-[100dvh] relative flex flex-col bg-zinc-950 shadow-2xl overflow-hidden">
        
        {/* Main Content Area (With Animation) */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, scale: 0.9, y: 50, filter: "blur(5px)" }} // Starts low, small, and blurry
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}    // Spreads up to full size
              exit={{ opacity: 0, scale: 0.95, filter: "blur(5px)" }}          // Fades away slightly smaller
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                mass: 0.5 
              }} 
              style={{ transformOrigin: "bottom center" }} // <--- THE SECRET SAUCE
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Bar */}
        <BottomNav />
        
      </div>
    </div>
  );
}