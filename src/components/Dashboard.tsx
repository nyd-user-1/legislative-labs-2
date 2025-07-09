import { SectionCards } from "@/components/dashboard/SectionCards";
import { ChartAreaInteractive } from "@/components/dashboard/ChartAreaInteractive";
import { DataTable } from "@/components/dashboard/DataTable";
import { Tables } from "@/integrations/supabase/types";

type Bill = Tables<"Bills"> & {
  sponsors?: Array<{
    name: string | null;
    party: string | null;
    chamber: string | null;
  }>;
};

export const Dashboard = () => {
  return (
    <div className="w-full">
      <div className="@container/main mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Overview</h1>
          </div>

          {/* Statistics Cards Section */}
          <SectionCards />

          {/* Chart Section */}
          <ChartAreaInteractive />

          {/* Data Table Section */}
          <DataTable />
        </div>
      </div>
    </div>
  );
};