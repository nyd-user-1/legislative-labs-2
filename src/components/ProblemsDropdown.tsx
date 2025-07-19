import React from 'react';

interface ProblemsDropdownProps {
  problems: Array<{ text: string }>;
  onProblemSelect: (problem: string) => void;
}

export const ProblemsDropdown: React.FC<ProblemsDropdownProps> = ({
  problems,
  onProblemSelect,
}) => {
  return (
    <div className="px-3 pb-3">
      <div className="max-h-[200px] overflow-y-auto">
        {problems.length === 0 ? (
          <div className="text-muted-foreground py-2 text-base">
            Loading problems...
          </div>
        ) : (
          problems.map((problem, index) => (
            <div
              key={index}
              onClick={() => onProblemSelect(problem.text)}
              className="py-2 cursor-pointer hover:bg-gray-50 rounded text-muted-foreground text-base transition-colors duration-200"
            >
              {problem.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};