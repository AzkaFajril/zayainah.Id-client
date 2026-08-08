import { Mail, Instagram } from 'lucide-react';

// Data untuk Kolom Link
const footerLinks = {
  shop: [
    { name: 'New Gamis', href: '#gamis' },
   
  ],
  help: [
    { name: 'Customer Service', href: '#' },
    
  ],
};

// Komponen Footer
const Footer = () => {
  return (
    <footer className="bg-[#1A1E26] text-gray-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Konten Utama Footer (4 Kolom) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Kolom 1: Logo & Deskripsi */}
          <div>
            <h3 className="text-xl font-bold text-white mb-3 tracking-wider">zayainah.Id</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Premium clothing and accessories for the modern lifestyle.
            </p>
          </div>

          {/* Kolom 2: SHOP Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">SHOP</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 3: HELP Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">HELP</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolom 4: FOLLOW US & Ikon Sosial Media */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">FOLLOW US</h4>
            <div className="flex space-x-4">
              
              
              <a href="#" aria-label="Instagram" className="text-gray-400 hover:text-white transition duration-200">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" aria-label="Email" className="text-gray-400 hover:text-white transition duration-200">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Garis Pembatas */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <p className="text-center text-sm text-gray-400">
            © 2026 Boka. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;