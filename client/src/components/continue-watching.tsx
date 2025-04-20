import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { 
  getRecentWatchProgress, 
  formatTime, 
  calculatePercentWatched,
  WatchProgress
} from '@/lib/watch-progress';
import { PlayCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueWatchingProps {
  className?: string;
  limit?: number;
}

export default function ContinueWatching({ className, limit = 5 }: ContinueWatchingProps) {
  const [, setLocation] = useLocation();
  const [watchHistory, setWatchHistory] = useState<WatchProgress[]>([]);
  
  // Get watch history on mount
  useEffect(() => {
    const recentHistory = getRecentWatchProgress(limit);
    setWatchHistory(recentHistory);
  }, [limit]);

  if (watchHistory.length === 0) {
    return null;
  }

  return (
    <div className={cn("continue-watching", className)}>
      <h2 className="text-xl font-bold mb-4">Continue Watching</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {watchHistory.map((item) => (
          <div 
            key={item.episodeId}
            className="bg-primary rounded-lg overflow-hidden cursor-pointer hover:ring-1 hover:ring-accent transition-all duration-200"
            onClick={() => setLocation(`/watch/${item.episodeId}`)}
          >
            <div className="relative aspect-video">
              <img 
                src={item.thumbnailUrl || '/images/default-thumbnail.jpg'} 
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
              <div className="absolute bottom-2 right-2 flex items-center bg-black bg-opacity-70 text-xs px-2 py-1 rounded">
                <Clock className="h-3 w-3 mr-1" />
                <span>{formatTime(item.position)} / {formatTime(item.duration)}</span>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <PlayCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            
            <div className="h-1 w-full bg-gray-700">
              <div 
                className="h-full bg-accent" 
                style={{ width: `${calculatePercentWatched(item.position, item.duration)}%` }}
              ></div>
            </div>
            
            <div className="p-3">
              <h3 className="font-medium text-sm line-clamp-1">{item.title}</h3>
              <p className="text-xs text-gray-400 mt-1">Episode {item.episodeNumber}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}