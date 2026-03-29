"use client";

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useState } from "react";

import { DashboardStatsCards } from "../components/dashboard-stats-cards";
import { OrderDistributionChart } from "../components/order-distribution-chart";
import { RecentActivityFeed } from "../components/recent-activity-feed";
import { StockMovementChart } from "../components/stock-movement-chart";
import { TopVendorsChart } from "../components/top-vendors-chart";

interface DashboardViewProps {
  className?: string;
}

export function DashboardView({ className }: DashboardViewProps) {
  const [dateRange] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});
  
  const trpc = useTRPC();
  
  // API queries using the correct TRPC pattern
  const statsQuery = useQuery(
    trpc.dashboard.getDashboardStats.queryOptions({ ...dateRange })
  );
  
  const stockMovementQuery = useQuery(
    trpc.dashboard.getStockMovementData.queryOptions({ days: 30, ...dateRange })
  );
  
  const orderDistributionQuery = useQuery(
    trpc.dashboard.getOrderTypeDistribution.queryOptions({ ...dateRange })
  );
  
  const topVendorsQuery = useQuery(
    trpc.dashboard.getTopVendors.queryOptions({ limit: 10, ...dateRange })
  );
  
  const recentActivityQuery = useQuery(
    trpc.dashboard.getRecentActivity.queryOptions({ limit: 15 })
  );
  
  // Loading state - true if any query is loading
  const isLoading = statsQuery.isLoading || 
    stockMovementQuery.isLoading || 
    orderDistributionQuery.isLoading || 
    topVendorsQuery.isLoading || 
    recentActivityQuery.isLoading;

  // Error handling
  const hasError = statsQuery.error || 
    stockMovementQuery.error || 
    orderDistributionQuery.error || 
    topVendorsQuery.error || 
    recentActivityQuery.error;

  const handleRefresh = async () => {
    await Promise.all([
      statsQuery.refetch(),
      stockMovementQuery.refetch(),
      orderDistributionQuery.refetch(),
      topVendorsQuery.refetch(),
      recentActivityQuery.refetch(),
    ]);
  };

  if (hasError) {
    return <DashboardViewError error={(hasError as unknown as Error)?.message} />;
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your stock management system
          </p>
        </div>
        
        <Button 
          onClick={handleRefresh}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="mb-6">
        <DashboardStatsCards
          stats={statsQuery.data || null}
          isLoading={statsQuery.isLoading}
          error={(statsQuery.error as unknown as Error)?.message}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {/* Stock Movement Chart - Spans 2 columns on large screens */}
        <div className="lg:col-span-2">
          <StockMovementChart
            data={stockMovementQuery.data || []}
            isLoading={stockMovementQuery.isLoading}
            error={(stockMovementQuery.error as unknown as Error)?.message}
            height={350}
          />
        </div>
        
        {/* Order Distribution Chart */}
        <div>
          <OrderDistributionChart
            data={orderDistributionQuery.data || []}
            isLoading={orderDistributionQuery.isLoading}
            error={(orderDistributionQuery.error as unknown as Error)?.message}
            height={350}
          />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Vendors Chart - Spans 2 columns */}
        <div className="lg:col-span-2">
          <TopVendorsChart
            data={topVendorsQuery.data || []}
            isLoading={topVendorsQuery.isLoading}
            error={(topVendorsQuery.error as unknown as Error)?.message}
            height={400}
          />
        </div>
        
        {/* Recent Activity Feed */}
        <div>
          <RecentActivityFeed
            activities={recentActivityQuery.data || []}
            isLoading={recentActivityQuery.isLoading}
            error={(recentActivityQuery.error as unknown as Error)?.message}
            maxItems={12}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground">
          Dashboard data updates in real-time. Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

// Loading component for the entire dashboard
export function DashboardViewLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-9 w-20 bg-muted animate-pulse rounded" />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 h-96 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}

// Error component for the entire dashboard
export function DashboardViewError({ error }: { error?: string }) {
  return (
    <div className="flex items-center justify-center min-h-96">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground mb-4">
          {error || "An unexpected error occurred while loading the dashboard."}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Try Again
        </Button>
      </div>
    </div>
  );
}