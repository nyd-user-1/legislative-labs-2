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
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-current", className)}
    >
      {/* Rounded square background */}
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="20"
        ry="20"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      
      {/* AI Text */}
      <text
        x="50"
        y="65"
        textAnchor="middle"
        fontSize="36"
        fontWeight="bold"
        fill="currentColor"
        fontFamily="Arial, sans-serif"
      >
        AI
      </text>
      
      {/* Sparkles */}
      <g fill="currentColor">
        {/* Large sparkle */}
        <path d="M75 25 L79 33 L87 29 L83 37 L91 41 L83 45 L87 53 L79 49 L75 57 L71 49 L63 53 L67 45 L59 41 L67 37 L63 29 L71 33 Z" />
        
        {/* Medium sparkle */}
        <path d="M85 15 L87 19 L91 17 L89 21 L93 23 L89 25 L91 29 L87 27 L85 31 L83 27 L79 29 L81 25 L77 23 L81 21 L79 17 L83 19 Z" />
        
        {/* Small sparkle */}
        <path d="M90 50 L91 52 L93 51 L92 53 L94 54 L92 55 L93 57 L91 56 L90 58 L89 56 L87 57 L88 55 L86 54 L88 53 L87 51 L89 52 Z" />
      </g>
    </svg>
  );
};