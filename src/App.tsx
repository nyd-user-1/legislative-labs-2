
import React from 'react';
import { ProblemsDropdown } from './components/ProblemsDropdown';
import { ScrollArea } from './components/ui/scroll-area';
import { supabase } from './integrations/supabase/client';

export default function App() {
  const [inputValue, setInputValue] = React.useState('Some students still don\'t have internet');
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

  const [problems, setProblems] = React.useState([]);

  // Fetch problems from Supabase on component mount
  React.useEffect(() => {
    const fetchProblems = async () => {
      try {
        const { data, error } = await supabase
          .from('Sample Problems')
          .select('id, "Sample Problems"')
          .order('Sample Problems');
        
        if (error) throw error;
        setProblems(data || []);
      } catch (error) {
        console.error('Error fetching problems:', error);
      }
    };

    fetchProblems();
  }, []);

  const handleProblemSelect = (problem: any) => {
    setInputValue(problem["Sample Problems"]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        {/* Single Unified Container - Input only */}
        <div className="relative">
          {/* Main Text Input Area - stays in exact position */}
          <div className={`bg-[#F6F4ED] border border-gray-200 shadow-sm ${
            isDropdownOpen ? 'rounded-t-2xl' : 'rounded-2xl'
          }`}>
            <div className="p-8">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-transparent border-none outline-none resize-none text-lg placeholder-gray-500 min-h-[120px]"
                placeholder="Draft a constitutional amendment"
              />
              
              {/* Very faint divider line (barely visible) */}
              <div className="border-b border-gray-200/30 my-4"></div>
              
              {/* Problems Dropdown Button */}
              <ProblemsDropdown 
                isOpen={isDropdownOpen}
                onToggle={setIsDropdownOpen}
              />
            </div>
          </div>
          
          {/* Dropdown Menu - Absolutely positioned to appear seamlessly connected */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 top-full bg-[#F6F4ED] border-l border-r border-b border-gray-200 rounded-b-2xl shadow-sm overflow-hidden z-50">
              <ScrollArea className="h-80">
                <div className="py-2">
                  {problems.map((problem) => (
                    <div
                      key={problem.id}
                      onClick={() => handleProblemSelect(problem)}
                      className="px-8 py-3 hover:bg-[#E8E4D6] cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-gray-700 text-sm">{problem["Sample Problems"]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
