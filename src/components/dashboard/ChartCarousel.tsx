
import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { BillsByMonthChart } from "./charts/BillsByMonthChart";
import { BillsBySponsorChart } from "./charts/BillsBySponsorChart";
import { BillsByCommitteeChart } from "./charts/BillsByCommitteeChart";

interface ChartCarouselProps {
  timePeriod: string;
}

export const ChartCarousel = ({ timePeriod }: ChartCarouselProps) => {
  return (
    <div className="h-[250px] sm:h-[300px] lg:h-[350px] w-full">
      <Carousel className="w-full h-full">
        <CarouselContent className="h-full">
          <CarouselItem className="h-full">
            <BillsByMonthChart timePeriod={timePeriod} />
          </CarouselItem>
          <CarouselItem className="h-full">
            <BillsBySponsorChart timePeriod={timePeriod} />
          </CarouselItem>
          <CarouselItem className="h-full">
            <BillsByCommitteeChart timePeriod={timePeriod} />
          </CarouselItem>
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};
