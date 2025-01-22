'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { fetchMenu, organizeMenuItems } from '../utils/api';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from './auth/AuthModal';
import { UserIcon as UserIconOutline } from '@heroicons/react/24/outline';
import { UserIcon as UserIconSolid } from '@heroicons/react/24/solid';
import '../styles/fonts.css';

const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const Header = ({ children }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { handleCartClick, cartCount } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const getMenuItems = async () => {
      try {
        setLoading(true);
        const items = await fetchMenu(436); // primary menu ID
        const organized = organizeMenuItems(items);
        setMenuItems(organized);
      } catch (err) {
        console.error('Error fetching menu:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getMenuItems();
  }, []);

  const toggleSubmenu = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleUserIconClick = () => {
    if (user) {
      // Use window.location for a hard navigation
      window.location.href = '/account';
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <header className="bg-black sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-white text-2xl font-bold">
            Groovy Gallery Designs
          </Link>

          <div className="flex items-center space-x-4">
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-4">
              {loading ? (
                <div className="text-white">Loading menu...</div>
              ) : error ? (
                <div className="text-white">Error loading menu: {error}</div>
              ) : (
                menuItems.map((item) => (
                  <div key={`menu-${item.id}`} className="relative group">
                    <Link
                      href={item.url}
                      className="text-white py-2"
                    >
                      {decodeHTML(item.title.rendered)}
                    </Link>
                    {item.children?.length > 0 && (
                      <div className="absolute left-0 mt-2 w-48 bg-black rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                        {item.children.map((child) => (
                          <Link
                            key={`submenu-${child.id}`}
                            href={child.url}
                            className="block px-4 py-2 text-sm text-white hover:bg-gray-800"
                          >
                            {decodeHTML(child.title.rendered)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* User Icon and Cart */}
            <div className="flex items-center space-x-4">
              {children}
              <button
                onClick={handleUserIconClick}
                className={`p-2 rounded-full transition-colors ${
                  user ? 'hover:bg-gray-800' : 'hover:bg-gray-800'
                }`}
                aria-label={user ? 'View Account' : 'Sign In'}
              >
                {user ? (
                  <UserIconSolid className="h-6 w-6 text-white" />
                ) : (
                  <UserIconOutline className="h-6 w-6 text-white" />
                )}
              </button>

              {/* Shopping Bag */}
              <button 
                onClick={handleCartClick}
                className="text-white hover:text-gray-300 relative"
                aria-label="Shopping cart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white"
                aria-label="Toggle menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {mobileMenuOpen ? (
                    <path d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4">
            {loading ? (
              <div className="text-white">Loading menu...</div>
            ) : error ? (
              <div className="text-white">Error loading menu: {error}</div>
            ) : (
              menuItems.map((item) => (
                <div key={`mobile-${item.id}`}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.url}
                      className="text-white py-2 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {decodeHTML(item.title.rendered)}
                    </Link>
                    {item.children?.length > 0 && (
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className="p-2 text-white"
                      >
                        <svg
                          className={`w-4 h-4 transform transition-transform ${
                            expandedItems[item.id] ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>
                  {item.children?.length > 0 && expandedItems[item.id] && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <Link
                          key={`mobile-submenu-${child.id}`}
                          href={child.url}
                          className="text-white py-2 block"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {decodeHTML(child.title.rendered)}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
};

export default Header;
