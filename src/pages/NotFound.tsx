import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-maroon-800">
          <Compass className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-5xl font-bold text-stone-900">404</h1>
        <h2 className="font-serif text-xl font-bold text-stone-800">Drape Not Found</h2>
        <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto">
          The page or collection you are looking for has been moved or is no longer available.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-maroon-800 hover:bg-maroon-900 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all"
          >
            Return to Storefront <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
