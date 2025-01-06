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

const Button = ({ color, font_bold, title, hover, onClick ,className}: ButtonProps) => {
  return (    
    <button className={`${color || "bg-primary"} bg border-none rounded-xl cursor-pointer text-base px-3 py-2 ${font_bold || "font-normal"} font-sans text-white ${hover || "hover:bg-primary-dark"}  ${className} `} onClick={onClick}>
      {title}
    </button>
  )
}

export default Button
