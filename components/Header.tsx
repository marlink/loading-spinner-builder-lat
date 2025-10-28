
import React from 'react';
import { CodeIcon } from './icons/Icons';

export const Header: React.FC = () => (
  <header className="bg-gray-800/50 backdrop-blur-sm p-4 border-b border-gray-700/50">
    <div className="container mx-auto flex items-center gap-3">
      <CodeIcon className="w-8 h-8 text-indigo-400" />
      <h1 className="text-2xl font-bold tracking-tight text-white">
        Kinetic SVG Spinner Builder
      </h1>
    </div>
  </header>
);
