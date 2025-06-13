"use client";
import React from "react";
import { motion } from "motion/react";
import { IconUsers, IconMail, IconShieldCheck } from "@tabler/icons-react";

export const SkeletonFive = () => {
  // User locations showing international reach
  const userLocations = [
    { x: 15, y: 35, users: 1200, country: "Germany" },
    { x: 25, y: 45, users: 850, country: "France" },
    { x: 45, y: 25, users: 2100, country: "UK" },
    { x: 75, y: 40, users: 3400, country: "USA" },
    { x: 85, y: 55, users: 680, country: "Brazil" },
    { x: 65, y: 20, users: 1900, country: "India" },
    { x: 55, y: 15, users: 950, country: "Netherlands" },
    { x: 90, y: 70, users: 420, country: "Australia" },
  ];

  const getUserSize = (users: number) => {
    if (users > 3000) return { size: "w-5 h-5", ring: "w-8 h-8" };
    if (users > 2000) return { size: "w-4 h-4", ring: "w-7 h-7" };
    if (users > 1000) return { size: "w-3.5 h-3.5", ring: "w-6 h-6" };
    return { size: "w-3 h-3", ring: "w-5 h-5" };
  };

  const totalUsers = userLocations.reduce((sum, location) => sum + location.users, 0);
  const totalEmails = Math.floor(totalUsers * 2.3); // Average emails per user per day

  return (
    <div className="p-8 overflow-hidden h-full relative flex items-center justify-center">

      {/* International Reach Container */}
      <div className="relative w-full max-w-md">

        {/* Map Title */}
        <motion.div
          className="text-center mb-4 relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* <h3 className="text-lg font-bold text-white mb-1 drop-shadow-lg">International Coverage</h3> */}
          {/* <p className="text-sm text-neutral-200 drop-shadow-md">Protecting users worldwide</p> */}
        </motion.div>

        {/* Simplified World Map SVG */}
        <div className="relative bg-slate-900/30 rounded-lg border border-slate-700/30 p-4">
          <svg viewBox="0 0 100 60" className="w-full h-32 opacity-20">
            {/* Simplified continents */}
            {/* North America */}
            <path d="M10 15 L25 10 L30 20 L25 35 L15 40 L8 25 Z" fill="#374151" />
            {/* South America */}
            <path d="M20 40 L30 35 L35 50 L25 55 L20 50 Z" fill="#374151" />
            {/* Europe */}
            <path d="M40 15 L50 12 L55 20 L50 25 L40 22 Z" fill="#374151" />
            {/* Africa */}
            <path d="M45 25 L55 22 L60 40 L50 45 L45 35 Z" fill="#374151" />
            {/* Asia */}
            <path d="M55 10 L85 8 L90 25 L80 30 L55 25 Z" fill="#374151" />
            {/* Australia */}
            <path d="M75 45 L85 43 L90 50 L80 52 Z" fill="#374151" />
          </svg>

          {/* User Location Indicators */}
          {userLocations.map((location, i) => {
            const sizeConfig = getUserSize(location.users);
            return (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: `${location.x}%`,
                  top: `${location.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                }}
              >
                {/* Pulsing Ring */}
                <motion.div
                  className={`absolute ${sizeConfig.ring} rounded-full border-2 border-blue-400/40 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2`}
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.6, 0.2, 0.6],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                />

                {/* User Icon */}
                <div
                  className={`${sizeConfig.size} rounded-full bg-blue-500/30 border border-blue-400/50 flex items-center justify-center relative z-10`}
                >
                  <IconUsers
                    className="w-2 h-2 text-blue-400"
                  />
                </div>

                {/* User Count Tooltip */}
                <motion.div
                  className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm rounded px-2 py-1 text-xs text-blue-300 whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 0, y: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  {location.users.toLocaleString()} users
                </motion.div>
              </motion.div>
            );
          })}

          {/* Data Flow Lines */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            {/* Connecting lines to show data flow */}
            <svg className="w-full h-full">
              {userLocations.slice(0, 4).map((location, i) => (
                <motion.line
                  key={i}
                  x1="50%"
                  y1="50%"
                  x2={`${location.x}%`}
                  y2={`${location.y}%`}
                  stroke="rgb(59 130 246 / 0.2)"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.3 + 1.5,
                    ease: "easeInOut",
                  }}
                />
              ))}
            </svg>
          </motion.div>
        </div>

                        {/* Usage Statistics */}
        <motion.div
          className="grid grid-cols-3 gap-2 mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
        >
          <div className="bg-blue-500/30 border border-blue-400/60 rounded-lg p-2 text-center min-h-[50px] flex flex-col justify-center overflow-hidden">
            <div className="text-[10px] font-medium text-blue-200 mb-0.5 leading-tight">Users</div>
            <motion.div
              className="text-xs font-bold text-blue-100 leading-tight"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {(totalUsers / 1000).toFixed(1)}K
            </motion.div>
          </div>

          <div className="bg-emerald-500/30 border border-emerald-400/60 rounded-lg p-2 text-center min-h-[50px] flex flex-col justify-center overflow-hidden">
            <div className="text-[10px] font-medium text-emerald-200 mb-0.5 leading-tight">Emails</div>
            <motion.div
              className="text-xs font-bold text-emerald-100 leading-tight"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              {(totalEmails / 1000).toFixed(1)}K
            </motion.div>
          </div>

          <div className="bg-purple-500/30 border border-purple-400/60 rounded-lg p-2 text-center min-h-[50px] flex flex-col justify-center overflow-hidden">
            <div className="text-[10px] font-medium text-purple-200 mb-0.5 leading-tight">Regions</div>
            <motion.div
              className="text-xs font-bold text-purple-100 leading-tight"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              {userLocations.length}+
            </motion.div>
          </div>
        </motion.div>

        {/* Service Status */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          <motion.div
            className="w-2 h-2 bg-emerald-400 rounded-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <span className="text-xs text-emerald-400 font-medium">Analyzing Globally</span>
        </motion.div>

        {/* Future Feature Hint */}
        <motion.div
          className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 rounded-lg px-2 py-1"
          initial={{ opacity: 0, scale: 0.8, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 2.8 }}
        >
          <div className="flex items-center gap-1">
            <IconShieldCheck className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-300">Building threat intel</span>
          </div>
        </motion.div>
      </div>

      {/* Background Grid */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="border border-blue-500/20"
              animate={{
                opacity: [0, 0.3, 0],
              }}
              transition={{
                duration: 4,
                delay: i * 0.1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
