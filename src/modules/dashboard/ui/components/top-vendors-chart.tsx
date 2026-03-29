"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangleIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import type { TopVendorsChartProps } from "../../types";

const chartConfig = {
  totalAmount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
  totalOrders: {
    label: "Total Orders",
    color: "hsl(var(--chart-2))",
  },
};

export function TopVendorsChart({ data, isLoading, error, height = 350 }: TopVendorsChartProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Vendors</CardTitle>
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
          <CardTitle>Top Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-center pt-4">
              <Skeleton className="h-64 w-full" />
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
          <CardTitle>Top Vendors</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">No data available</p>
            <p className="text-xs text-muted-foreground">Vendor performance data will appear here once you have orders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format data for the chart - truncate long vendor names
  const chartData = data.map(vendor => ({
    ...vendor,
    displayName: vendor.name.length > 15 ? `${vendor.name.substring(0, 15)}...` : vendor.name,
    fullName: vendor.name,
  }));

  // Chart data formatting

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Vendors</CardTitle>
        <p className="text-sm text-muted-foreground">
          Performance by total order value
        </p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="displayName" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number, name: string) => {
                  if (name === 'totalAmount') {
                    return [
                      `$${value.toLocaleString()}`,
                      'Total Amount'
                    ];
                  }
                  if (name === 'totalOrders') {
                    return [
                      `${value} orders`,
                      'Total Orders'
                    ];
                  }
                  return [value, name];
                }}
                labelFormatter={(label, payload) => {
                  const item = payload?.[0]?.payload;
                  return item ? `Vendor: ${item.fullName}` : label;
                }}
              />
              <Bar
                dataKey="totalAmount"
                fill="var(--color-totalAmount)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Summary Table */}
        <div className="mt-6">
          <div className="text-sm font-medium mb-3">Vendor Summary</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.slice(0, 5).map((vendor, index) => (
              <div key={vendor.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{vendor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {vendor.totalOrders} orders
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    ${vendor.totalAmount.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(vendor.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
