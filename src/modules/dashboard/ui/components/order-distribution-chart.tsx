"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { OrderDistributionChartProps } from "../../types";

const chartConfig = {
  purchase: {
    label: "Purchase Orders",
    color: "hsl(var(--chart-1))",
  },
  sale: {
    label: "Sale Orders",
    color: "hsl(var(--chart-2))",
  },
};

const COLORS = {
  purchase: "var(--color-purchase)",
  sale: "var(--color-sale)",
};

export function OrderDistributionChart({ data, isLoading, error, height = 350 }: OrderDistributionChartProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <AlertTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load chart data</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-center">
              <Skeleton className="h-64 w-64 rounded-full" />
            </div>
            <div className="flex justify-center space-x-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No data available</p>
            <p className="text-xs text-muted-foreground">Order distribution will appear here once you have orders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.type === 'purchase' ? 'Purchase Orders' : 'Sale Orders',
    value: item.count,
    percentage: item.percentage,
    type: item.type,
  }));

  const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Breakdown of purchase vs sale orders
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[entry.type as keyof typeof COLORS]} 
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => [
                  `${value} orders`,
                  name
                ]}
              />
              <ChartLegend 
                content={<ChartLegendContent />}
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Summary Stats */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-blue-600">
              {data.find(item => item.type === 'purchase')?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Purchase Orders</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-green-600">
              {data.find(item => item.type === 'sale')?.count || 0}
            </p>
            <p className="text-xs text-muted-foreground">Sale Orders</p>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Total Orders: <span className="font-semibold">{totalOrders.toLocaleString()}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
