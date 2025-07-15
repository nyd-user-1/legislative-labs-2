
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, XAxis, YAxis } from "recharts"

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

export const description = "A horizontal bar chart"

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

export function ChartBarHorizontal() {
  return (
    <Card className="w-full">
      <CardHeader className="px-3 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-sm sm:text-base lg:text-lg">Bar Chart - Horizontal</CardTitle>
        <CardDescription className="text-xs sm:text-sm">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <ChartContainer config={chartConfig} className="w-full h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px]">
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              left: -10,
              right: 8,
              top: 5,
              bottom: 5,
            }}
          >
            <XAxis type="number" dataKey="desktop" hide />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              fontSize={9}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={5} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-xs sm:text-sm px-3 py-3 sm:px-6 sm:py-4">
        <div className="flex gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
