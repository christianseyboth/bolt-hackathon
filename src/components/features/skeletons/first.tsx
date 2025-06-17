"use client";
import { motion, AnimatePresence } from "motion/react";
import {
  IconMail,
  IconShieldCheck,
  IconLock,
  IconTrash,
  IconEyeOff,
  IconShield,
} from "@tabler/icons-react";
import React, { useState, useEffect } from "react";

export const SkeletonOne = () => {
  const [privacyPhase, setPrivacyPhase] = useState(0);
  // 0: email arrives, 1: processing (no storage), 2: analysis complete, 3: data deleted, 4: privacy confirmed

  useEffect(() => {
    const sequence = async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPrivacyPhase(1); // Processing without storage
      await new Promise(resolve => setTimeout(resolve, 3500));
      setPrivacyPhase(2); // Analysis complete
      await new Promise(resolve => setTimeout(resolve, 2500));
      setPrivacyPhase(3); // Data deletion
      await new Promise(resolve => setTimeout(resolve, 3000));
      setPrivacyPhase(4); // Privacy confirmed
      await new Promise(resolve => setTimeout(resolve, 2500));
      setPrivacyPhase(0); // Reset
    };

    const interval = setInterval(sequence, 13000);
    sequence(); // Start immediately

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 overflow-hidden h-full relative">
      <div className="flex flex-col items-center justify-center h-full relative">

                {/* Privacy Flow Visualization */}
        <div className="relative z-10 w-full max-w-sm">

          {/* Privacy Status Cards */}
          <AnimatePresence mode="wait">
            {privacyPhase === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-3"
              >
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <IconLock className="h-5 w-5 text-emerald-400" />
                    <div className="text-sm text-emerald-400 font-medium">Memory-Only Processing</div>
                  </div>
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    Email content analyzed in temporary memory only. No data written to disk or database.
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: IconTrash, label: "No Logs", color: "emerald" },
                    { icon: IconEyeOff, label: "No Tracking", color: "blue" },
                    { icon: IconShieldCheck, label: "Encrypted", color: "purple" }
                  ].map((item, i) => (
                                         <motion.div
                       key={i}
                       initial={{ scale: 0, opacity: 0 }}
                       animate={{ scale: 1, opacity: 1 }}
                       transition={{ delay: i * 0.3, duration: 0.5, ease: "easeOut" }}
                       className={`bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-lg p-2 text-center`}
                     >
                      <item.icon className={`h-4 w-4 text-${item.color}-400 mx-auto mb-1`} />
                      <div className={`text-xs text-${item.color}-300 font-medium`}>{item.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {privacyPhase === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/40 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconShieldCheck className="h-6 w-6 text-emerald-400" />
                    <div className="text-sm text-emerald-400 font-semibold">Analysis Complete</div>
                  </div>
                  <div className="text-xs text-neutral-300">
                    Security assessment finished. Results ready for delivery.
                  </div>
                </div>

                <div className="text-xs text-neutral-400">
                  <span className="text-emerald-400 font-medium">✓ Zero data retention</span> • Processing time: 0.3s
                </div>
              </motion.div>
            )}

            {privacyPhase === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.1, 1] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="w-20 h-20 bg-red-500/20 border border-red-500/40 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <motion.div
                    animate={{ rotate: [0, 180, 360] }}
                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  >
                    <IconTrash className="h-8 w-8 text-red-400" />
                  </motion.div>
                </motion.div>

                <div className="text-sm text-red-400 font-semibold mb-1">Data Permanently Deleted</div>
                <div className="text-xs text-neutral-400">
                  All temporary data cleared from memory
                </div>
              </motion.div>
            )}

            {privacyPhase === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/40 rounded-lg p-6 mb-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15, duration: 1.2 }}
                    className="flex items-center justify-center gap-3 mb-3"
                  >
                    <IconShieldCheck className="h-8 w-8 text-emerald-400" />
                    <div className="text-lg text-emerald-400 font-bold">Privacy Protected</div>
                  </motion.div>

                  <div className="text-sm text-neutral-300 mb-3">
                    Your email was analyzed without any data storage or retention.
                  </div>

                  <div className="flex justify-center gap-4">
                    {[
                      { icon: IconLock, label: "Encrypted" },
                      { icon: IconEyeOff, label: "Private" },
                      { icon: IconTrash, label: "Deleted" }
                    ].map((item, i) => (
                                               <motion.div
                           key={i}
                           initial={{ scale: 0, opacity: 0 }}
                           animate={{ scale: 1, opacity: 1 }}
                           transition={{ delay: 0.3 + i * 0.15, duration: 0.8, ease: "easeOut" }}
                           className="flex flex-col items-center gap-1"
                         >
                        <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-emerald-400" />
                        </div>
                        <span className="text-xs text-emerald-300">{item.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Privacy-focused Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: privacyPhase >= 1 ? 0.1 : 0 }}
                transition={{ delay: i * 0.02 }}
                className="border border-emerald-500/20"
              />
            ))}
          </div>
        </div>

        {/* Privacy Shield Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${25 + i * 20}%`,
                top: `${20 + (i % 2) * 60}%`,
              }}
              animate={{
                y: [-5, 5, -5],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 6,
                delay: i * 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <IconShield className="h-4 w-4 text-emerald-400/30" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
