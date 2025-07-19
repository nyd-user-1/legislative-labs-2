import React from 'react';
import { Button } from './ui/button';

interface ProblemsDropdownProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export function ProblemsDropdown({ isOpen, onToggle }: ProblemsDropdownProps) {
  return (
    <Button
      onClick={() => onToggle(!isOpen)}
      variant="outline"
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 bg-transparent border-none hover:bg-transparent p-0"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
      <span className="text-sm">Browse sample problems</span>
    </Button>
  );
}