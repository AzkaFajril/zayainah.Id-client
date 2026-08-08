import { useState } from 'react';
import { Menu, Search, User, ShoppingCart, X } from 'lucide-react'; // Menggunakan ikon dari 'lucide-react'
import LogoIcon from "./assets/zayainah.id.jpg";

// Komponen Navbar
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false); // State untuk mengontrol tampilan menu mobile

  // Data link navigasi
  const navLinks = [
  
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Bagian Kiri: Logo dan Navigasi Desktop */}
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex">
              <img src={LogoIcon} alt="zayainah.Id" className="w-10 h-10 rounded-full mr-2" />
              <a href="/" className="text-2xl font-bold tracking-wider text-gray-900">zayainah.Id</a>
            </div>

            {/* Link Navigasi (Hanya di Desktop) */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-gray-900 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>

          {/* Bagian Tengah: Search Bar */}
          <div className="flex-1 max-w-lg hidden lg:block mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full py-2 pl-10 pr-4 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Bagian Kanan: Ikon Aksi & Hamburger */}
          <div className="flex items-center">
            {/* Search Bar (Mobile/Tablet) - Muncul di samping ikon aksi */}
            <div className="block lg:hidden mr-4">
              <Search className="h-5 w-5 text-gray-700 cursor-pointer hover:text-gray-900" />
            </div>

            {/* Ikon Aksi (Pengguna & Keranjang) */}
            
            <div className="hidden sm:flex items-center space-x-4">
              
              <ShoppingCart className="h-6 w-6 text-gray-700 cursor-pointer hover:text-gray-900" />
            </div>

            {/* Tombol Hamburger (Hanya di Mobile) */}
            <div className="-mr-2 flex items-center sm:hidden ml-4">
              <button
                onClick={() => setIsOpen(!isOpen)}
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                aria-controls="mobile-menu"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {/* Menggunakan 'sm:hidden' untuk menyembunyikan di breakpoint 'sm' ke atas */}
      <div
        className={`${isOpen ? 'block' : 'hidden'} sm:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="block bg-gray-50 text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-base font-medium transition duration-150 ease-in-out"
              onClick={() => setIsOpen(false)} // Tutup menu saat link diklik
            >
              {link.name}
            </a>
          ))}
          {/* Ikon Aksi di Menu Mobile */}
          <div className="pt-4 border-t border-gray-200">
             <a href="#" className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium">
                <User className="mr-3 h-5 w-5" />
                Account
             </a>
             <a href="#" className="flex items-center text-gray-700 hover:text-gray-900 px-3 py-2 text-base font-medium">
                <ShoppingCart className="mr-3 h-5 w-5" />
                Cart
             </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;