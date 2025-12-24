import { LoadingSpinner } from './loading-spinner';

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-900/80 animate-in fade-in duration-300">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

