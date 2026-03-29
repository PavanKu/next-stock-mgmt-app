// Dashboard data types and interfaces

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeVendors: number;
  totalProducts: number;
  lowStockCount: number;
}

export interface StockMovementData {
  date: string;
  stockIn: number;
  stockOut: number;
}

export interface OrderTypeDistribution {
  type: 'purchase' | 'sale';
  count: number;
  percentage: number;
}

export interface VendorPerformance {
  id: string;
  name: string;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  status?: 'success' | 'warning' | 'error';
  orderType?: 'purchase' | 'sale';
  amount?: number;
}

export interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  totalSold: number;
  currentStock: number;
  revenue: number;
}

export interface LowStockAlert {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  threshold: number;
}

export interface DateRangeFilter {
  from: Date;
  to: Date;
}

export interface DashboardFilters {
  dateRange?: DateRangeFilter;
  vendorId?: string;
  productId?: string;
}

// Chart configuration types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface TimeSeriesDataPoint {
  date: string;
  [key: string]: string | number;
}

// API response types
export interface DashboardApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Loading and error states
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface DashboardState {
  stats: DashboardStats | null;
  stockMovement: StockMovementData[];
  orderDistribution: OrderTypeDistribution[];
  topVendors: VendorPerformance[];
  recentActivity: RecentActivity[];
  productPerformance: ProductPerformance[];
  lowStockAlerts: LowStockAlert[];
  filters: DashboardFilters;
  loading: {
    stats: boolean;
    stockMovement: boolean;
    orderDistribution: boolean;
    topVendors: boolean;
    recentActivity: boolean;
    productPerformance: boolean;
    lowStockAlerts: boolean;
  };
  errors: {
    stats: string | null;
    stockMovement: string | null;
    orderDistribution: string | null;
    topVendors: string | null;
    recentActivity: string | null;
    productPerformance: string | null;
    lowStockAlerts: string | null;
  };
}

// Component props types
export interface DashboardStatsCardsProps {
  stats: DashboardStats | null;
  isLoading: boolean;
  error?: string | null;
}

export interface StockMovementChartProps {
  data: StockMovementData[];
  isLoading: boolean;
  error?: string | null;
  height?: number;
}

export interface OrderDistributionChartProps {
  data: OrderTypeDistribution[];
  isLoading: boolean;
  error?: string | null;
  height?: number;
}

export interface TopVendorsChartProps {
  data: VendorPerformance[];
  isLoading: boolean;
  error?: string | null;
  height?: number;
}

export interface RecentActivityFeedProps {
  activities: RecentActivity[];
  isLoading: boolean;
  error?: string | null;
  maxItems?: number;
}

export interface DashboardPageProps {
  initialData?: Partial<DashboardState>;
}
