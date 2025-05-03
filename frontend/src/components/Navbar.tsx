import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar: React.FC = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return router.pathname === path ? 'text-amber-500 border-b-2 border-amber-500' : 'text-amber-900 hover:text-amber-500';
  };

  return (
    <nav className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg className="h-10 w-10 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 8L15 12H13L9 8M19 8C20.11 8 21 7.11 21 6C21 4.89 20.11 4 19 4C17.89 4 17 4.89 17 6C17 7.11 17.89 8 19 8ZM5 8L9 12H11L15 8M5 8C3.89 8 3 7.11 3 6C3 4.89 3.89 4 5 4C6.11 4 7 4.89 7 6C7 7.11 6.11 8 5 8ZM5 16L9 12M5 16C3.89 16 3 16.89 3 18C3 19.11 3.89 20 5 20C6.11 20 7 19.11 7 18C7 16.89 6.11 16 5 16ZM19 16L15 12M19 16C20.11 16 21 16.89 21 18C21 19.11 20.11 20 19 20C17.89 20 17 19.11 17 18C17 16.89 17.89 16 19 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="ml-2 font-bold text-xl text-amber-900">Musical Raga</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className={`py-2 px-1 text-base font-medium ${isActive('/')}`}>Home</Link>
            <Link href="/record" className={`py-2 px-1 text-base font-medium ${isActive('/record')}`}>Record</Link>
            <Link href="/upload" className={`py-2 px-1 text-base font-medium ${isActive('/upload')}`}>Upload</Link>
            <Link href="/analyze" className={`py-2 px-1 text-base font-medium ${isActive('/analyze')}`}>Analyze</Link>
            <Link href="/saved" className={`py-2 px-1 text-base font-medium ${isActive('/saved')}`}>Saved</Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              className="text-gray-800 hover:text-amber-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white">
          <Link href="/" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/' ? 'bg-amber-100 text-amber-800' : 'text-amber-900 hover:bg-amber-50'}`}>Home</Link>
          <Link href="/record" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/record' ? 'bg-amber-100 text-amber-800' : 'text-amber-900 hover:bg-amber-50'}`}>Record</Link>
          <Link href="/upload" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/upload' ? 'bg-amber-100 text-amber-800' : 'text-amber-900 hover:bg-amber-50'}`}>Upload</Link>
          <Link href="/analyze" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/analyze' ? 'bg-amber-100 text-amber-800' : 'text-amber-900 hover:bg-amber-50'}`}>Analyze</Link>
          <Link href="/saved" className={`block px-3 py-2 rounded-md text-base font-medium ${router.pathname === '/saved' ? 'bg-amber-100 text-amber-800' : 'text-amber-900 hover:bg-amber-50'}`}>Saved</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
