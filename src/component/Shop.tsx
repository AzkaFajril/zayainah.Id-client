import { useEffect, useMemo, useState } from 'react';
import { Eye, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Types ---
type ProductLink = {
  shopee?: string;
  tiktok?: string;
  whatsapp?: string;
};

type ProductGalleryImage = {
  url: string;
  publicId?: string;
};

export type ProductDetail = {
  _id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  currency: string;
  mainImageUrl: string;
  gallery: ProductGalleryImage[];
  links: ProductLink;
};

const API_URL = import.meta.env.VITE_API_URL ?? 'https://adra-backend.vercel.app';

// --- Modal Component ---
const ProductDetailsModal = ({ product, onClose }: { product: ProductDetail; onClose: () => void }) => {
  // Gabungkan foto utama + galeri jadi satu array supaya bisa navigasi next/prev
  const allImages = useMemo(
    () => [product.mainImageUrl, ...(product.gallery?.map((g) => g.url) ?? [])],
    [product]
  );

  // null = lightbox tertutup, angka = index foto yang sedang di-preview
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const openPreview = (index: number) => setPreviewIndex(index);
  const closePreview = () => setPreviewIndex(null); // hanya menutup lightbox, tetap di modal produk ini

  const showPrev = () => {
    if (previewIndex === null) return;
    setPreviewIndex((previewIndex - 1 + allImages.length) % allImages.length);
  };

  const showNext = () => {
    if (previewIndex === null) return;
    setPreviewIndex((previewIndex + 1) % allImages.length);
  };

  return (
    /* Overlay: modal hanya bisa ditutup lewat tombol X, klik di luar tidak menutup */
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3 backdrop-blur-sm transition-all animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b px-4 sm:px-6 py-4 sticky top-0 bg-white z-10">
          <div className="pr-8">
            <p className="text-xs sm:text-sm uppercase tracking-wide text-gray-400 font-medium">Product Details</p>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{product.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-gray-200 p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-6 p-4 sm:p-6 md:grid-cols-2">
          {/* Bagian Gambar */}
          <div className="space-y-3">
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="w-full h-full object-cover cursor-zoom-in transition-transform hover:scale-105"
                onClick={() => openPreview(0)}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.gallery?.map((image, index) => (
                <div key={index} className="aspect-square w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                   <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover cursor-zoom-in hover:opacity-80 transition-opacity"
                    onClick={() => openPreview(index + 1)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bagian Info (Dibuat Tengah untuk Mobile) */}
          <div className="space-y-6 flex flex-col justify-center">
            <div className="text-center md:text-left">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-2">Deskripsi</p>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {product.longDescription || product.description}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-5 border border-gray-100 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold mb-1">HARGA</p>
              <p className="text-3xl font-black text-gray-900">
                {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: product.currency || 'IDR',
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </p>
            </div>

            <div className="space-y-3 pb-4">
              <p className="text-xs uppercase tracking-widest text-gray-400 font-bold text-center">PESAN LEWAT</p>
              <div className="grid gap-3">
                {product.links?.shopee && (
                  <a href={product.links.shopee} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white bg-[#EE4D2D] hover:opacity-90 transition-all shadow-md">
                    Shopee <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {product.links?.whatsapp && (
                  <a href={product.links.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white bg-[#25D366] hover:opacity-90 transition-all shadow-md">
                    WhatsApp <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {product.links?.tiktok && (
      <a href={product.links.tiktok} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white bg-black hover:opacity-90 transition-all shadow-md">
        TikTok <ExternalLink className="h-4 w-4" />
      </a>
    )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Preview */}
      {previewIndex !== null && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4" 
          onClick={closePreview}
        >
          {/* Tombol close (X) - hanya menutup lightbox, tetap di modal produk */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              closePreview();
            }}
            aria-label="Tutup"
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-8 w-8" />
          </button>

          {/* Tombol previous, hanya tampil kalau foto lebih dari 1 */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showPrev();
              }}
              aria-label="Foto sebelumnya"
              className="absolute left-4 text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-9 w-9" />
            </button>
          )}

          <img 
            src={allImages[previewIndex]} 
            alt={`${product.name} - foto ${previewIndex + 1}`}
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          />

          {/* Tombol next, hanya tampil kalau foto lebih dari 1 */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                showNext();
              }}
              aria-label="Foto berikutnya"
              className="absolute right-4 text-white/80 hover:text-white transition-colors"
            >
              <ChevronRight className="h-9 w-9" />
            </button>
          )}

          {/* Indikator posisi foto */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 text-sm text-white/70">
              {previewIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- Card Component ---
const ProductCard = ({ product, onViewDetails }: { product: ProductDetail; onViewDetails: (p: ProductDetail) => void }) => {
  const formattedPrice = useMemo(
    () =>
      new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: product.currency || 'IDR',
        maximumFractionDigits: 0,
      }).format(product.price),
    [product.currency, product.price]
  );

  return (
    <div 
      className="group bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 cursor-pointer flex flex-col h-full hover:bg-gray-50 hover:shadow-md items-center text-center"
      onClick={() => onViewDetails(product)}
    >
      {/* Gambar Square */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-200">
        <img 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          src={product.mainImageUrl} 
          alt={product.name} 
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-gray-700">
                <Eye className="h-5 w-5" />
            </div>
        </div>
      </div>

      {/* Info Produk Tengah */}
      <div className="p-4 flex flex-col flex-grow items-center w-full">
        <h3 className="text-base font-bold text-gray-800 line-clamp-1 group-hover:text-black">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3 line-clamp-2 mt-1">{product.description}</p>
        
        <div className="mt-auto pt-2 w-full flex flex-col items-center border-t border-gray-100 gap-1">
          <span className="text-md font-bold text-gray-900">{formattedPrice}</span>
          <span className="text-[10px] font-bold text-gray-400 group-hover:text-gray-600 transition-colors uppercase tracking-tight">Details</span>
        </div>
      </div>
    </div>
  );
};

// --- Grid Main ---
const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductDetail | null>(null);
  const [products, setProducts] = useState<ProductDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <section className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white" id="gamis">
      {/* Header Tengah */}
      <div className="mb-10 text-center">
        <h2 id="gamis" className="text-2xl font-black text-gray-900 tracking-tight uppercase">New Gamis</h2>
        <div className="h-1 w-12 bg-gray-900 mx-auto mt-2 mb-2"></div>
        <p className="text-gray-400 text-sm italic">Temukan koleksi eksklusif terbaru kami.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        /* Grid Centered */
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 justify-center">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} onViewDetails={setSelectedProduct} />
          ))}
        </div>
      )}
      
      {selectedProduct && (
        <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </section>
  );
};

export default ProductGrid;