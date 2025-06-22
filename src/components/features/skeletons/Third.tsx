"use client";

import React from "react";
import { motion } from "motion/react";
import { IconMail, IconScan, IconAlertTriangle, IconShieldCheck, IconX } from "@tabler/icons-react";

export const SkeletonThree = () => {
  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">

            {/* Email Document with Scanning Animation */}
      <div className="relative mx-20">

        {/* Email Document */}
        <div className="w-56 h-44 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-lg border border-slate-600/30 relative overflow-hidden">

          {/* Email Header */}
          <div className="p-3 border-b border-slate-600/30">
            <div className="flex items-center gap-2 mb-2">
              <IconMail className="h-4 w-4 text-blue-400" />
              <div className="h-2 bg-slate-600/50 rounded w-20"></div>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 bg-slate-600/40 rounded w-32"></div>
              <div className="h-1.5 bg-slate-600/40 rounded w-24"></div>
            </div>
          </div>

          {/* Email Content Lines */}
          <div className="p-3 space-y-2">
            <div className="h-1.5 bg-slate-600/40 rounded w-full"></div>
            <div className="h-1.5 bg-slate-600/40 rounded w-36"></div>
            <div className="h-1.5 bg-slate-600/40 rounded w-28"></div>
            <div className="h-1.5 bg-slate-600/40 rounded w-40"></div>
            <div className="h-1.5 bg-slate-600/40 rounded w-40"></div>
            <div className="h-1.5 bg-slate-600/40 rounded w-50"></div>
          </div>

          {/* Scanning Beam */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)",
              width: "20px",
            }}
            animate={{
              x: [-20, 192],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
          />

          {/* Scan Line Effect */}
          {/* <motion.div
            className="absolute inset-0 border-l-2 border-emerald-400/60"
            style={{ width: "2px" }}
            animate={{
              x: [-2, 190],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
              repeatDelay: 1,
            }}
          /> */}
        </div>

        {/* AI Processing Indicator */}
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-full px-3 py-1 border border-emerald-500/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <IconScan className="h-4 w-4 text-emerald-400" />
          </motion.div>
          <span className="text-xs text-emerald-400 font-medium">AI Scanning</span>
        </motion.div>

                {/* Threat Detection Results */}
        <div className="absolute -right-20 top-0 space-y-1.5 w-28">

          {/* Phishing Detection */}
          <motion.div
            className="flex items-center gap-2 bg-red-500/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-red-500/30"
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <IconAlertTriangle className="h-3 w-3 text-red-400" />
            <div>
              <div className="text-xs font-medium text-red-400">Phishing</div>
              <div className="text-xs text-red-300/70">Detected</div>
            </div>
          </motion.div>

          {/* Malware Check */}
          <motion.div
            className="flex items-center gap-2 bg-emerald-500/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-emerald-500/30"
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
          >
            <IconShieldCheck className="h-3 w-3 text-emerald-400" />
            <div>
              <div className="text-xs font-medium text-emerald-400">Malware</div>
              <div className="text-xs text-emerald-300/70">Clean</div>
            </div>
          </motion.div>

          {/* Spam Detection */}
          <motion.div
            className="flex items-center gap-2 bg-amber-500/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-amber-500/30"
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 2.5, duration: 0.5 }}
          >
            <IconX className="h-3 w-3 text-amber-400" />
            <div>
              <div className="text-xs font-medium text-amber-400">Spam</div>
              <div className="text-xs text-amber-300/70">Flagged</div>
            </div>
          </motion.div>
        </div>

                {/* Left side threat indicators */}
        <div className="absolute -left-20 top-10 space-y-1.5 w-28">

          {/* Link Analysis */}
          <motion.div
            className="flex items-center gap-2 bg-blue-500/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-blue-500/30"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div>
              <div className="text-xs font-medium text-blue-400">Links</div>
              <div className="text-xs text-blue-300/70">3 Analyzed</div>
            </div>
          </motion.div>

          {/* Attachment Scan */}
          <motion.div
            className="flex items-center gap-2 bg-purple-500/10 backdrop-blur-sm rounded-lg px-2 py-1.5 border border-purple-500/30"
            initial={{ opacity: 0, x: -20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 2.2, duration: 0.5 }}
          >
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div>
              <div className="text-xs font-medium text-purple-400">Attachments</div>
              <div className="text-xs text-purple-300/70">Safe</div>
            </div>
          </motion.div>
        </div>

        {/* Scanning Progress */}
        <motion.div
          className="absolute -bottom-8 left-0 right-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="bg-slate-800/80 backdrop-blur-sm rounded-full h-2 overflow-hidden border border-slate-600/30">
            {/* <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-blue-400"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut",
              }}
            /> */}
          </div>
          <div className="text-center mt-1">
            <motion.span
              className="text-xs text-slate-400"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Analyzing email security...
            </motion.span>
          </div>
        </motion.div>

      </div>

      {/* Background Scan Lines */}
      <div className="absolute inset-0 opacity-5">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-emerald-400"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
            animate={{
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 2,
              delay: i * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const Container = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => (
  <div className={`h-16 w-16 rounded-full flex items-center justify-center bg-[rgba(248,248,248,0.01)] shadow-[0px_0px_8px_0px_rgba(248,248,248,0.25)_inset,0px_32px_24px_-16px_rgba(0,0,0,0.40)] ${className}`}>
    {children}
  </div>
);
