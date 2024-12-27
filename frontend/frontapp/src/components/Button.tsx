'use client'
import React from 'react'
import Image from 'next/image'
//import Link from 'next/link';

type ButtonProps = {
    type: 'button' | 'submit' | 'category' | 'admin';
    title: string;
    icon?: string;    
    className?: string;
    onClick?: () => void;
    expanded?: boolean;
}

const Button = ({ type, title, icon, className, onClick, expanded }: ButtonProps) => {
  return (    
    <button
      className={`${(type !== 'category') && (type!=='admin')? `flexCenter gap-3 justify-between rounded-full border ${className}` : `${className}`}`}
      type={type === 'button' || type === 'submit' ? type : 'button'}
      onClick={onClick}
    >
      <label className={`cursor-pointer ${type !== 'category' ? 'bold-18 whitespace-nowrap' : '' }`}>{title}</label>
      {icon && (type === 'button' || type === 'submit') && <Image src={icon} alt={title} width={24} height={24}/>}
      {type === 'category' && (
        <svg 
          className={`w-5 h-5 transform ${expanded ? 'rotate-180' : ''} text-dorado-100`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      )}
    </button>
  )
}

export default Button
