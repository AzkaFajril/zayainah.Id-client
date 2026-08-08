import { useState, useEffect, useMemo } from 'react';

// Pastikan API_URL didefinisikan atau gunakan fallback
const API_URL = import.meta.env.VITE_API_URL ?? 'https://adra-backend.vercel.app';
// Durasi perpindahan slide
const SLIDE_INTERVAL = 6000;
// Durasi animasi teks (harus lebih pendek dari setTimeout di bawah)
const TEXT_ANIMATION_DURATION_MS = 820; 

type Slide = {
  _id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
};

const HeroSlider = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. Fetch Data Slides ---
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`${API_URL}/api/slides`);
        if (!response.ok) {
          throw new Error('Failed to load slides');
        }
        const data = await response.json();
        setSlides(data);
        setCurrentSlide(0);
      } catch (error) {
        console.error("Error fetching slides:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  // --- 2. Auto-Play Logic (Perbaikan Timing) ---
  useEffect(() => {
    if (!slides.length) {
      return;
    }

    const nextSlide = () => {
      // 1. Mulai animasi (fade out teks)
      setIsAnimating(true);
      
      // 2. Beri jeda waktu yang sedikit lebih lama dari durasi transisi teks
      // (700ms animasi teks + 100ms buffer = 800ms)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        // 3. Matikan animasi (fade in teks baru)
        setIsAnimating(false);
      }, TEXT_ANIMATION_DURATION_MS + 100); 
    };

    const intervalId = setInterval(nextSlide, SLIDE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [slides.length]);

  // --- 3. Manual Navigation (Perbaikan Timing) ---
  const goToSlide = (index: number) => {
    if (index !== currentSlide) {
        setIsAnimating(true);
      
        setTimeout(() => {
            setCurrentSlide(index);
            setIsAnimating(false);
      }, TEXT_ANIMATION_DURATION_MS + 100); // Gunakan timing yang sama
    }
  };

  // --- 4. Memoized Text Animation Classes ---
  const textAnimation = useMemo(
    () =>
      isAnimating
        ? 'opacity-0 translate-y-4' // Teks keluar
        : 'opacity-100 translate-y-0 transition-all duration-700 ease-out', // Teks masuk
    [isAnimating]
  );

  // --- 5. Loading and Empty State ---
  if (isLoading) {
    return (
      <div className="relative w-full overflow-hidden h-[400px] md:h-[500px] flex items-center justify-center bg-gray-200">
        <p className="text-gray-600">Loading slides...</p>
      </div>
    );
  }

  if (!slides.length) {
    return (
      <div className="relative w-full overflow-hidden h-[400px] md:h-[500px] flex items-center justify-center bg-gray-200">
        <p className="text-gray-600">Belum ada slide. Tambahkan dari dashboard admin.</p>
      </div>
    );
  }

  const { title, subtitle, imageUrl } = slides[currentSlide];

  // --- 6. Render Component ---
  return (
    <div className="relative w-full overflow-hidden h-[400px] md:h-[500px]">
      
      {/* Gambar Latar Belakang (Transisi Opacity 1000ms untuk efek fade pada gambar) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
        style={{ backgroundImage: `url(${imageUrl})` }}
      >
        {/* Overlay gelap */}
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>

      {/* Konten Teks di Tengah (Memastikan konten keseluruhan ikut fade saat transisi) */}
      <div className={`absolute inset-0 flex flex-col justify-center items-center text-center px-4 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* Judul Utama */}
        <h1 className={`text-4xl md:text-6xl font-extrabold text-white mb-4 ${textAnimation} delay-100`}>
          {title}
        </h1>
        
        {/* Subjudul */}
        <p className={`text-lg md:text-xl text-white mb-8 ${textAnimation} delay-200`}>
          {subtitle}
        </p>

        {/* Tombol Aksi */}
        <button className="bg-white text-gray-800 font-semibold py-3 px-8 rounded-md hover:bg-gray-100 transition duration-300 transform hover:scale-105">
          <a href="#gamis">Shop Now </a>
        </button>
      </div>

      {/* Indikator Titik Navigasi */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((slide, index) => (
          <button
            key={slide._id ?? index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;