'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMenu, organizeMenuItems } from '../utils/api';
import '../styles/fonts.css';

const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const Header = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <header className="bg-black sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="text-white no-underline">
            <div className="flex flex-col items-center font-['Visby_Round'] font-bold">
              <span className="text-2xl leading-tight">Groovy Gallery</span>
              <span className="text-2xl leading-tight">Designs</span>
            </div>
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
                  <div key={item.id} className="relative group">
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
                            key={child.id}
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

            {/* User and Cart Icons */}
            <div className="flex items-center space-x-4">
              <Link href="/account" className="text-white hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </Link>
              <Link href="/cart" className="text-white hover:text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>

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
                <div key={item.id}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.url}
                      className="block py-2 text-white"
                    >
                      {decodeHTML(item.title.rendered)}
                    </Link>
                    {item.children?.length > 0 && (
                      <button
                        onClick={() => toggleSubmenu(item.id)}
                        className="p-2 text-white hover:text-gray-300 focus:outline-none"
                      >
                        {expandedItems[item.id] ? '−' : '+'}
                      </button>
                    )}
                  </div>
                  {item.children?.length > 0 && expandedItems[item.id] && (
                    <div className="pl-4">
                      {item.children.map((child) => (
                        <div key={child.id} className="flex items-center justify-between">
                          <Link
                            href={child.url}
                            className="block py-2 text-sm text-white"
                          >
                            {decodeHTML(child.title.rendered)}
                          </Link>
                          {child.children?.length > 0 && (
                            <button
                              onClick={() => toggleSubmenu(child.id)}
                              className="p-2 text-white hover:text-gray-300 focus:outline-none"
                            >
                              {expandedItems[child.id] ? '−' : '+'}
                            </button>
                          )}
                          {child.children?.length > 0 && expandedItems[child.id] && (
                            <div className="pl-4">
                              {child.children.map((grandchild) => (
                                <Link
                                  key={grandchild.id}
                                  href={grandchild.url}
                                  className="block py-2 text-sm text-white"
                                >
                                  {decodeHTML(grandchild.title.rendered)}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
