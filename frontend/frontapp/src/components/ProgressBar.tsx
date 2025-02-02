import React from 'react';

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className="flex items-center">
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          style={{ width: `${progress}%` }}
          className="bg-blue-600 h-2.5 rounded-full"
        />
      </div>
      <span className="ml-2 text-sm text-gray-600">{progress}%</span> {/* Mostrar el porcentaje al lado */}
    </div>
  );
};

export default ProgressBar;