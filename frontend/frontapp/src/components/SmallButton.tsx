'use client'
import React from 'react'
//import Link from 'next/link';

type ButtonProps = {
    color?: string;
    font_bold?: string;
    title: string;
    hover?: string;
    onClick?: () => void;
    className?: string;
}

const SmallButton = ({ color, font_bold, title, hover, onClick }: ButtonProps) => {
  return (    
    <button 
      className={`
        ${color || "bg-primary"} 
        bg border-none rounded-xl cursor-pointer text-base px-3 py-2 
        ${font_bold || "font-normal"} font-sans text-white 
        ${hover || "hover:bg-primary-dark"} 
        `} 
      onClick={onClick}>
      {title}
    </button>
  )
}

export default SmallButton
