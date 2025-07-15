
import { useState } from "react";
import { ChartBarInteractive } from "./ChartBarInteractive";
import { ChartBarDefault } from "./ChartBarDefault";
import { ChartBarHorizontal } from "./ChartBarHorizontal";
import { ChartBarMultiple } from "./ChartBarMultiple";
import { ChartPieSimple } from "./ChartPieSimple";

export const ChartSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const charts = [ChartBarInteractive, ChartBarDefault, ChartBarHorizontal, ChartBarMultiple, ChartPieSimple];

  return (
    <div className="relative w-full max-w-full overflow-hidden">
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {charts.map((Chart, index) => (
            <div key={index} className="w-full flex-shrink-0 px-1 min-w-0">
              <div className="w-full min-h-0 overflow-hidden">
                <Chart />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-3 space-x-2">
        {charts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            aria-label={`Go to chart ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
