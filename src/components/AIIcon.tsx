import React from 'react';
import { cn } from "@/lib/utils";

interface AIIconProps {
  size?: number;
  className?: string;
}

export const AIIcon: React.FC<AIIconProps> = ({ size = 24, className }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
    >
      {/* Rounded square background */}
      <rect
        x="2"
        y="2"
        width="20"
        height="20"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      
      {/* AI Text - simplified and bold */}
      <text
        x="12"
        y="16"
        textAnchor="middle"
        fontSize="8"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        AI
      </text>
      
      {/* Simple sparkles */}
      <circle cx="17" cy="7" r="1" fill="currentColor" />
      <circle cx="19" cy="5" r="0.5" fill="currentColor" />
      <circle cx="20" cy="9" r="0.5" fill="currentColor" />
    </svg>
  );
};