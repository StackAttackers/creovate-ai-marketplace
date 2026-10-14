import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20 flex items-center justify-center px-4 text-center text-slate-900">
      <div className="max-w-md">
        <div className="inline-flex p-4 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 mb-6">
          <Sparkles className="w-12 h-12" />
        </div>
        <h1 className="text-6xl font-black text-slate-900 mb-2 font-mono">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Page in Alternate Dimension</h2>
        <p className="text-sm text-slate-500 mb-8">
          The page you're trying to reach hasn't been generated yet or was moved to another coordinate.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
          </Link>
          <Link to="/discover">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Discover Creators
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
