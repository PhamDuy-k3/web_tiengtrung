import React from "react";

export const ChineseCloud: React.FC<{ className?: string }> = ({ className = "w-16 h-8 text-coral" }) => (
  <svg viewBox="0 0 100 50" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M25 40 C15 40 8 33 8 24 C8 15 16 9 24 10 C27 4 35 0 44 0 C55 0 64 6 67 15 C71 13 75 12 80 12 C91 12 100 21 100 32 C100 42 91 48 82 48 C78 48 70 48 60 48 C50 48 40 40 30 40 Z" opacity="0.85"/>
  </svg>
);

export const ChineseLantern: React.FC<{ className?: string }> = ({ className = "w-12 h-20 text-coral" }) => (
  <svg viewBox="0 0 60 100" fill="none" stroke="currentColor" strokeWidth="2.5" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* String top */}
    <line x1="30" y1="0" x2="30" y2="15" strokeLinecap="round" />
    {/* Top Cap */}
    <rect x="20" y="15" width="20" height="6" rx="2" fill="currentColor" />
    {/* Body */}
    <ellipse cx="30" cy="45" rx="25" ry="25" fill="#EF5B5B" fillOpacity="0.2" stroke="currentColor" strokeWidth="3" />
    <path d="M15 45 C15 30 22 21 30 21 C38 21 45 30 45 45 C45 60 38 69 30 69 C22 69 15 60 15 45 Z" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
    {/* Bottom Cap */}
    <rect x="20" y="69" width="20" height="6" rx="2" fill="currentColor" />
    {/* Tassel */}
    <line x1="30" y1="75" x2="30" y2="95" strokeLinecap="round" strokeWidth="3" />
    <circle cx="30" cy="80" r="3" fill="currentColor" />
  </svg>
);

export const ChinesePlumBlossom: React.FC<{ className?: string }> = ({ className = "w-8 h-8 text-coral" }) => (
  <svg viewBox="0 0 40 40" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="11" r="7" opacity="0.9" />
    <circle cx="28" cy="17" r="7" opacity="0.9" />
    <circle cx="25" cy="27" r="7" opacity="0.9" />
    <circle cx="15" cy="27" r="7" opacity="0.9" />
    <circle cx="12" cy="17" r="7" opacity="0.9" />
    <circle cx="20" cy="20" r="4" fill="#FFC94A" />
  </svg>
);

export const ChineseSeal: React.FC<{ text: string; className?: string }> = ({ text, className = "" }) => (
  <div className={`inline-flex items-center justify-center border-2 border-coral text-coral rounded-xl p-1 font-chinese font-black text-xs tracking-tighter uppercase select-none ${className}`}>
    {text}
  </div>
);
