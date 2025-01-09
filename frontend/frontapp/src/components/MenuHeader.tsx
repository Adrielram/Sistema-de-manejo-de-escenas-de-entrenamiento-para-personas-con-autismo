'use client';

import React from 'react';

import { useSelectedLayoutSegment } from 'next/navigation';

import useScroll from '../hooks/UseScroll';

const Header = () => {
  const scrolled = useScroll(5);
  const selectedLayout = useSelectedLayoutSegment();

  return (
    <div
      className={`
        fixed inset-x-0 top-0 z-30 h-[47px] w-full transition-all border-b border-gray-200 
        ${scrolled ? 'border-b border-gray-200 bg-white/75 backdrop-blur-lg' : ''}
        ${selectedLayout ? 'border-b border-gray-200 bg-orange-600' : ''}
      `}
    >
      <div className="flex h-[47px] items-center justify-between px-4 max-w-screen-xl mx-auto">
        <div className="flex items-center space-x-4">
        </div>

      </div>
    </div>
  );
};

export default Header;