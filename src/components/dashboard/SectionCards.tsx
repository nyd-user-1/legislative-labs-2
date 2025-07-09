import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

const CardAction = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1">{children}</div>
);

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs dark:bg-card">
        <CardHeader>
          <CardDescription>Total Bills</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            18,185
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Trending up this month <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            All legislative bills
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs dark:bg-card">
        <CardHeader>
          <CardDescription>Active Bills</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            16,644
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Down 20% this period <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Recent activity (6 months)
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs dark:bg-card">
        <CardHeader>
          <CardDescription>Committees</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            83
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong committee activity <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Active committees</div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card from-primary/5 to-card bg-gradient-to-t shadow-xs dark:bg-card">
        <CardHeader>
          <CardDescription>Legislators</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            219
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady membership increase <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Senate & Assembly members</div>
        </CardFooter>
      </Card>
    </div>
  );
}