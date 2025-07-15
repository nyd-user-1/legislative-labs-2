
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
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {charts.map((Chart, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <Chart />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-4 space-x-2">
        {charts.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
