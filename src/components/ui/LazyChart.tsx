import { lazy, Suspense, ComponentProps } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const ChartContainer = lazy(() => import('@/components/ui/chart').then(mod => ({ default: mod.ChartContainer })));

const ChartSkeleton = () => (
  <div className="w-full h-64 flex items-center justify-center">
    <Skeleton className="w-full h-full rounded-lg" />
  </div>
);

type ChartContainerProps = ComponentProps<typeof ChartContainer>;

export const LazyChartContainer = (props: ChartContainerProps) => (
  <Suspense fallback={<ChartSkeleton />}>
    <ChartContainer {...props} />
  </Suspense>
);
