import React from 'react';
import { ChevronDown } from 'lucide-react';

interface ProblemsDropdownProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export function ProblemsDropdown({ isOpen, onToggle }: ProblemsDropdownProps) {
  return (
    <button
      onClick={() => onToggle(!isOpen)}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
    >
      <span className="text-sm">Sample problems</span>
      <ChevronDown 
        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
      />
    </button>
  );
}