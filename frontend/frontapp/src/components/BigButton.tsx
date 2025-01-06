'use client'
import React from 'react'
//import Link from 'next/link';

type ButtonProps = {
    color?: string;
    font_bold?: string;
    title: string;
    hover?: string;
    onClick?: () => void;
}

const BigButton = ({ color, font_bold, title, hover, onClick }: ButtonProps) => {
    return (
      <button
        className={`
          ${ color || "bg-blue-600" } 
          bg border-none rounded-xl cursor-pointer text-base px-12 py-2 
          ${font_bold || "font-normal"} font-sans text-white 
          ${ hover || "hover:bg-blue-800" }
          break-words whitespace-normal text-center
          w-64
        `}
        onClick={onClick}
      >
        {title}
      </button>
    );
  };
  

/**
 * color="bg-blue-600"
                hover="hover:bg-blue-700"
 */

export default BigButton
