// NoGroupsMessage.tsx
import React from 'react';

interface NoGroupsMessageProps {
  center: string;
}

const NoGroupsMessage: React.FC<NoGroupsMessageProps> = ({ center }) => {
  return (
    <div className="text-center mt-4">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-16 w-16 mx-auto mb-4 text-gray-400" 
        viewBox="0 0 20 20" 
        fill="currentColor"
      >
        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-7h2a1 1 0 110 2h-2v2a1 1 0 11-2v-2H8a1 1 0 110-2h2V8a1 1 0 112 0v1z" />
      </svg>
      <h2 className="text-lg font-semibold">El {center} no esta asociado a ningun grupo.</h2>     
    </div>
  );
};

export default NoGroupsMessage;
