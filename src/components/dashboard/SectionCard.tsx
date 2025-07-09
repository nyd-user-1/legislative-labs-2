import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  description?: string;
  value?: string | number;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  icon?: ReactNode;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
  children?: ReactNode;
  className?: string;
  onViewAll?: () => void;
  isLoading?: boolean;
  size?: "default" | "compact" | "expanded";
}

export const SectionCard = ({
  title,
  description,
  value,
  trend,
  icon,
  badge,
  children,
  className,
  onViewAll,
  isLoading = false,
  size = "default"
}: SectionCardProps) => {
  const sizeClasses = {
    compact: "p-4",
    default: "p-6",
    expanded: "p-6 lg:p-8"
  };

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className={sizeClasses[size]}>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
        </CardHeader>
        <CardContent className={cn(sizeClasses[size], "pt-0")}>
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded"></div>
            <div className="h-3 bg-muted rounded w-4/5"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", sizeClasses[size])}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CardTitle className={cn(
              "font-semibold tracking-tight",
              size === "compact" ? "text-sm" : "text-base lg:text-lg"
            )}>
              {title}
            </CardTitle>
            {badge && (
              <Badge variant={badge.variant || "secondary"} className="text-xs">
                {badge.text}
              </Badge>
            )}
          </div>
          {description && (
            <CardDescription className={cn(
              "text-muted-foreground",
              size === "compact" ? "text-xs" : "text-sm"
            )}>
              {description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className={cn(sizeClasses[size], "pt-0")}>
        {value && (
          <div className="space-y-2">
            <div className={cn(
              "font-bold tracking-tight",
              size === "compact" ? "text-xl" : "text-2xl lg:text-3xl"
            )}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
            {trend && (
              <div className="flex items-center space-x-1">
                <Badge
                  variant={trend.isPositive ? "default" : "destructive"}
                  className="text-xs"
                >
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {trend.label}
                </span>
              </div>
            )}
          </div>
        )}

        {children && (
          <div className="mt-4">
            {children}
          </div>
        )}

        {onViewAll && (
          <div className="mt-4 pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span>View all</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};