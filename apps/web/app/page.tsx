import { TopBar } from '@/components/top-bar';
import { BottomNav } from '@/components/bottom-nav';
import { OfertasFeed } from '@/components/ofertas-feed';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <TopBar />
      <div className="flex-1 max-w-3xl mx-auto w-full">
        <OfertasFeed />
      </div>
      <BottomNav />
    </main>
  );
}
