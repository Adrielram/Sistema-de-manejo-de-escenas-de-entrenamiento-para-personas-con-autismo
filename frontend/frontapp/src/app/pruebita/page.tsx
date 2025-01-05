"use client"; 
import React from 'react';

import Buscador from '../../components/Buscador';

const page = () => {
  const handleSearch = (query: string) => {
    console.log('Buscando:', query);
  };

  return (
    <div>
      <Buscador onSearch={handleSearch} />
    </div>
  );
};

export default page;


