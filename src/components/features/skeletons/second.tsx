"use client";
import { motion } from "motion/react";
import React from "react";

export const SkeletonTwo = () => {
  // Data points for each threat over time (7 days)
  const threatData = [
    {
      name: "Phishing",
      color: "#EF4444", // red-500
      points: [12, 18, 25, 31, 28, 35, 42],
    },
    {
      name: "Spam",
      color: "#F59E0B", // amber-500
      points: [45, 52, 48, 65, 71, 68, 75],
    },
    {
      name: "Malware",
      color: "#8B5CF6", // purple-500
      points: [8, 12, 15, 11, 18, 22, 19],
    }
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const chartWidth = 400;
  const chartHeight = 100;
  const maxValue = 80;

  // Convert data points to SVG coordinates
  const getPath = (points: number[]) => {
    const pathPoints = points.map((point, index) => {
      const x = (index / (points.length - 1)) * chartWidth;
      const y = chartHeight - (point / maxValue) * chartHeight;
      return `${x},${y}`;
    });
    return `M ${pathPoints.join(" L ")}`;
  };

  return (
    <div className="p-8 overflow-hidden h-full">
      <div className="flex flex-col gap-4 items-center justify-center h-full relative">

        {/* Line Chart */}
        <div className="flex flex-col items-center justify-center gap-4">

          {/* Chart Title */}
          <div className="text-center mb-2">
            <h3 className="text-sm font-medium text-neutral-300 mb-1">Threat Trends</h3>
            <p className="text-xs text-neutral-500">Last 7 days</p>
          </div>

          {/* Chart Container */}
          <div className="relative">
            <svg width={chartWidth + 40} height={chartHeight + 40} className="overflow-visible">

              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 25" fill="none" stroke="rgb(115 115 115 / 0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width={chartWidth} height={chartHeight} fill="url(#grid)" x="20" y="10"/>

              {/* Y-axis labels */}
              {[0, 20, 40, 60, 80].map((value, i) => (
                <g key={value}>
                  <text
                    x="15"
                    y={chartHeight - (value / maxValue) * chartHeight + 15}
                    className="text-xs fill-neutral-500"
                    textAnchor="end"
                  >
                    {value}
                  </text>
                </g>
              ))}

              {/* X-axis labels */}
              {days.map((day, i) => (
                <text
                  key={day}
                  x={20 + (i / (days.length - 1)) * chartWidth}
                  y={chartHeight + 25}
                  className="text-xs fill-neutral-500"
                  textAnchor="middle"
                >
                  {day}
                </text>
              ))}

              {/* Animated Lines */}
              {threatData.map((threat, threatIndex) => (
                <g key={threat.name}>
                  {/* Line Path */}
                  <motion.path
                    d={getPath(threat.points)}
                    fill="none"
                    stroke={threat.color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    transform="translate(20, 10)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      duration: 2,
                      delay: threatIndex * 0.5,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Data Points */}
                  {threat.points.map((point, pointIndex) => (
                    <motion.circle
                      key={pointIndex}
                      cx={20 + (pointIndex / (threat.points.length - 1)) * chartWidth}
                      cy={10 + chartHeight - (point / maxValue) * chartHeight}
                      r="3"
                      fill={threat.color}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.3,
                        delay: threatIndex * 0.5 + pointIndex * 0.1 + 1,
                        ease: "easeOut",
                      }}
                    />
                  ))}

                  {/* Glow Effect */}
                  <motion.path
                    d={getPath(threat.points)}
                    fill="none"
                    stroke={threat.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                    transform="translate(20, 10)"
                    filter="blur(2px)"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{
                      duration: 2,
                      delay: threatIndex * 0.5,
                      ease: "easeInOut",
                    }}
                  />
                </g>
              ))}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-2">
            {threatData.map((threat, i) => (
              <motion.div
                key={threat.name}
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.5 + 2 }}
              >
                <div
                  className="w-3 h-0.5 rounded-full"
                  style={{ backgroundColor: threat.color }}
                />
                <span className="text-xs text-neutral-400">{threat.name}</span>
              </motion.div>
            ))}
          </div>

          {/* Chart Footer */}
          {/* <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-center mt-2"
          >
            <p className="text-xs text-neutral-500">
              <span className="text-emerald-400 font-medium">Trending upward</span> - Enhanced protection active
            </p>
          </motion.div> */}
        </div>

        {/* Subtle Grid Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-6 h-full w-full">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="border border-neutral-600/20"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
