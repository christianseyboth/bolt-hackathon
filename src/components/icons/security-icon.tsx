import React from "react";

export const SecurityIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "h-6 w-6 text-cyan-500"}
    >
      {/* Shield base */}
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeOpacity="0.9"
        fillOpacity="0.1"
      />
      
      {/* Lock symbol */}
      <rect x="8" y="11" width="8" height="5" rx="1" />
      <path d="M10 11V8a2 2 0 0 1 4 0v3" />
    </svg>
  );
};

export const ShieldCheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "h-6 w-6 text-cyan-500"}
    >
      {/* Shield base */}
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeOpacity="0.9"
      />
      
      {/* Check mark */}
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
};

export const EncryptionIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className || "h-6 w-6 text-cyan-500"}
    >
      {/* Shield base */}
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        strokeOpacity="0.9"
      />
      
      {/* Binary data representation */}
      <path d="M8 10h2" />
      <path d="M14 10h2" />
      <path d="M8 14h2" />
      <path d="M14 14h2" />
    </svg>
  );
};