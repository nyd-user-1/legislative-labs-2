
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A bar chart"

const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function ChartBarDefault() {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="px-2 py-2 sm:px-3 sm:py-3 md:px-6 md:py-4">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Bar Chart</CardTitle>
        <CardDescription className="text-xs sm:text-sm">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-3 md:px-6 pb-2">
        <ChartContainer config={chartConfig} className="w-full h-[160px] sm:h-[140px] md:h-[200px] lg:h-[250px]">
          <BarChart 
            accessibilityLayer 
            data={chartData} 
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={8}
              className="sm:text-[10px]"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1 text-xs px-2 py-2 sm:px-3 sm:py-3 md:px-6 md:py-4">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-3 w-3" />
        </div>
        <div className="text-muted-foreground leading-none text-xs">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
