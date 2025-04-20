import { useEffect } from 'react';
import HeroSlider from '@/components/hero-slider';
import GenreFilter from '@/components/genre-filter';
import TrendingAnime from '@/components/trending-anime';
import RecentlyAdded from '@/components/recently-added';
import TopRated from '@/components/top-rated';
import AnimeCTA from '@/components/anime-cta';
import ContinueWatching from '@/components/continue-watching';

export default function Home() {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="pt-20">
      <HeroSlider />
      <div className="container mx-auto px-4 py-8">
        <ContinueWatching />
      </div>
      <GenreFilter />
      <TrendingAnime />
      <RecentlyAdded />
      <TopRated />
      <AnimeCTA />
    </main>
  );
}
