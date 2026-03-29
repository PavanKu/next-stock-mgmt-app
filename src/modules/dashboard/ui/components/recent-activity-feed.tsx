"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  AlertTriangleIcon, 
  ShoppingCartIcon, 
  TruckIcon, 
  PackageIcon,
  ClockIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RecentActivityFeedProps } from "../../types";

function getActivityIcon(type: string, orderType?: string) {
  if (type === 'alert') {
    return <AlertTriangleIcon className="h-4 w-4 text-orange-500" />;
  }
  
  if (type === 'order') {
    return orderType === 'purchase' 
      ? <TruckIcon className="h-4 w-4 text-blue-500" />
      : <ShoppingCartIcon className="h-4 w-4 text-green-500" />;
  }
  
  return <PackageIcon className="h-4 w-4 text-gray-500" />;
}

function getStatusBadge(status?: string) {
  switch (status) {
    case 'success':
      return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Success</Badge>;
    case 'warning':
      return <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-100">Warning</Badge>;
    case 'error':
      return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">Error</Badge>;
    default:
      return null;
  }
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start space-x-3 py-3">
      <Skeleton className="h-8 w-8 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

export function RecentActivityFeed({ 
  activities, 
  isLoading, 
  error, 
  maxItems = 10 
}: RecentActivityFeedProps) {
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load activity feed</p>
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
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ActivitySkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <ClockIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground">Activity will appear here as orders are created</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest orders and system alerts
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {displayedActivities.map((activity) => {
              const timeAgo = formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true });
              
              return (
                <div key={activity.id} className="flex items-start space-x-3 py-3 border-b border-border/50 last:border-b-0">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                      {getActivityIcon(activity.type, activity.orderType)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {activity.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {activity.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        {activity.status && getStatusBadge(activity.status)}
                        {activity.amount && (
                          <span className="text-xs font-medium text-foreground">
                            ${activity.amount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 space-x-2">
                      <ClockIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {timeAgo}
                      </span>
                      
                      {activity.orderType && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <Badge variant="outline" className="text-xs">
                            {activity.orderType === 'purchase' ? 'Purchase' : 'Sale'}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
        
        {activities.length > maxItems && (
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Showing {maxItems} of {activities.length} activities
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
