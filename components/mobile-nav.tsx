'use client'
import React, { useState } from 'react'
import { Menu, X } from 'lucide-react'

interface MobileNavProps {
  logo?: string
  logoText?: string
  className?: string
  links: any[]
}

const MobileNav: React.FC<MobileNavProps> = ({ 
  logo, 
  logoText = "Nexa",
  className = "",
  links

}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <div className={`relative w-full ${className}`}>
      {/* Mobile Nav Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/10 backdrop-blur-sm border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center">
          {logo ? (
            <img src={logo} alt={logoText} className="h-8 w-auto" />
          ) : (
            <span className="text-xl font-bold text-primary">{logoText}</span>
          )}
        </div>

        {/* Burger Menu Button */}
        <button
          onClick={toggleMenu}
          className="text-white hover:text-primary transition-colors duration-200 p-2"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Slider */}
      <div
        className={`fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header with Logo and Close Button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center">
              {logo ? (
                <img src={logo} alt={logoText} className="h-8 w-auto" />
              ) : (
                <span className="text-xl font-bold text-primary">{logoText}</span>
              )}
            </div>
            <button
              onClick={closeMenu}
              className="text-white hover:text-primary transition-colors duration-200 p-2"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-1">
              {links
                .filter(link => link.type === 'link')
                .map((link, index) => (
                  <a
                    key={index}
                    href={link.href}
                    onClick={closeMenu}
                    className="block px-3 py-3 text-white hover:text-primary transition-colors duration-200 text-lg font-medium"
                  >
                    {link.name}
                  </a>
                ))}
            </nav>
          </div>

          {/* Border Separator */}
          <div className="border-t border-white/10"></div>

          {/* Action Buttons */}
          <div className="px-4 py-6 space-y-3">
            {links
              .filter(link => link.type.includes('button'))
              .map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  onClick={closeMenu}
                  className={`block w-full text-center px-4 py-3 rounded-md font-medium transition-colors duration-200 ${
                    link.type === 'button-primary'
                      ? 'bg-primary text-white hover:bg-primary/90'
                      : 'border border-white/20 text-white hover:bg-white/5'
                  }`}
                >
                  {link.name}
                </a>
              ))}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeMenu}
        />
      )}
    </div>
  )
}

export default MobileNav
