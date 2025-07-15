
"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

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

export const description = "A simple pie chart"

const chartData = [
  { browser: "chrome", visitors: 275, fill: "#3b82f6" },
  { browser: "safari", visitors: 200, fill: "#60a5fa" },
  { browser: "firefox", visitors: 187, fill: "#93c5fd" },
  { browser: "edge", visitors: 173, fill: "#bfdbfe" },
  { browser: "other", visitors: 90, fill: "#dbeafe" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "#3b82f6",
  },
  safari: {
    label: "Safari",
    color: "#60a5fa",
  },
  firefox: {
    label: "Firefox",
    color: "#93c5fd",
  },
  edge: {
    label: "Edge",
    color: "#bfdbfe",
  },
  other: {
    label: "Other",
    color: "#dbeafe",
  },
} satisfies ChartConfig

export function ChartPieSimple() {
  return (
    <Card className="flex flex-col w-full">
      <CardHeader className="items-center pb-0 px-4 py-3 sm:px-6 sm:py-4">
        <CardTitle className="text-lg sm:text-xl">Pie Chart</CardTitle>
        <CardDescription className="text-sm">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 px-2 sm:px-6">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px] sm:max-h-[250px] w-full"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="visitors" nameKey="browser" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
