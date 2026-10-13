import type { CreatorProfile } from '../../types/creator';
import { CreatorCard } from './CreatorCard';
import { EmptyState } from '../ui/EmptyState';
import { Skeleton } from '../ui/Skeleton';
import { Users } from 'lucide-react';

interface CreatorGridProps {
  creators: CreatorProfile[];
  isLoading?: boolean;
  onClearFilters?: () => void;
  onInvite?: (creator: CreatorProfile) => void;
}

export function CreatorGrid({
  creators,
  isLoading = false,
  onClearFilters,
  onInvite,
}: CreatorGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 bg-midnight-800/60 p-5 space-y-4"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-36 w-full rounded-xl" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <div className="flex justify-between pt-4 border-t border-white/5">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No creators found"
        description="Try adjusting your search criteria, category filters, or budget limits to see more talent."
        actionLabel={onClearFilters ? 'Reset Filters' : undefined}
        onAction={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {creators.map((creator) => (
        <CreatorCard key={creator.uid} creator={creator} onInvite={onInvite} />
      ))}
    </div>
  );
}
