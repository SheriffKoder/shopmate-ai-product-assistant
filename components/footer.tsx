'use client'
import React from 'react'
import { getFooterConfig } from '@/views/home/config/footer'
import Image from 'next/image'

const Footer = () => {
  const footer_content = getFooterConfig()
  return (
    <footer className="bg-black border-t border-white/10 max-w-full">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          {/* Company Info */}
          <div className="lg:col-span-2  bg-white/5 rounded-md p-2 md:p-4">
            <h3 className="text-xl font-bold text-secondary mb-3 flex flex-row items-center gap-2">
              <Image src='/images/icon.png' alt='ShopMate AI' width={30} height={30} />
              {footer_content.company.name}
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">{footer_content.company.description}</p>
            
            {/* Social Links */}
            <div className="grid grid-cols-2 gap-2 md:flex md:space-x-4">
              {footer_content.social.map((social: any, index: any) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <span className="text-sm font-medium">{social.name}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Product Links */}
          <div className='p-2 md:p-4'>
            <h4 className="text-white font-semibold mb-4 text-sm">Product</h4>
            <ul className="space-y-3">
              {footer_content.links.product.map((link: any, index: any) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

 
        </div>


        {/* Copyright */}
        <div className="border-t border-white/10 pt-6">
          <p className="text-gray-400 text-sm text-center">
            © {new Date().getFullYear()} {footer_content.company.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer