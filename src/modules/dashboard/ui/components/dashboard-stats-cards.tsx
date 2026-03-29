"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSignIcon, 
  ShoppingCartIcon, 
  BuildingIcon, 
  PackageIcon, 
  AlertTriangleIcon 
} from "lucide-react";
import type { DashboardStatsCardsProps } from "../../types";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, isLoading }: StatCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-24" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20 mb-2" />
          <Skeleton className="h-3 w-16" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
        {trend && (
          <p className={`text-xs ${
            trend.isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStatsCards({ stats, isLoading, error }: DashboardStatsCardsProps) {
  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="col-span-full">
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <AlertTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load statistics</p>
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        title="Total Orders"
        value={stats?.totalOrders ?? 0}
        icon={ShoppingCartIcon}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Revenue"
        value={stats ? formatCurrency(stats.totalRevenue) : '$0'}
        icon={DollarSignIcon}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Active Vendors"
        value={stats?.activeVendors ?? 0}
        icon={BuildingIcon}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Total Products"
        value={stats?.totalProducts ?? 0}
        icon={PackageIcon}
        isLoading={isLoading}
      />
      
      <StatCard
        title="Low Stock Items"
        value={stats?.lowStockCount ?? 0}
        icon={AlertTriangleIcon}
        isLoading={isLoading}
      />
    </div>
  );
}
