import React from 'react';

export const TailwindFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} DMSP AI Tool. All rights reserved.
      </div>
    </footer>
  );
};
