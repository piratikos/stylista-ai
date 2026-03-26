'use client';

import { useState, useEffect, useRef, ChangeEvent, useCallback } from 'react';

// ==================== DATA ====================
interface Product {
  id: number;
  name: string;
  brand: string;
  price: string;
  category: string;
  storeUrl: string;
  image: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Όλα' },
  { id: 'tops', label: 'Μπλούζες' },
  { id: 'bottoms', label: 'Παντελόνια' },
  { id: 'dresses', label: 'Φορέματα' },
  { id: 'shoes', label: 'Παπούτσια' },
  { id: 'bags', label: 'Τσάντες' },
  { id: 'accessories', label: 'Αξεσουάρ' },
];

const PRODUCTS: Product[] = [
  { id: 1, name: 'Λευκό Βαμβακερό T-Shirt', brand: 'Zara', price: '19.95€', category: 'tops', storeUrl: 'https://www.zara.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=T-Shirt' },
  { id: 2, name: 'Ριγέ Πουκάμισο Oversized', brand: 'H&M', price: '29.99€', category: 'tops', storeUrl: 'https://www2.hm.com/el_gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Poukamiso' },
  { id: 3, name: 'Σατέν Μπλούζα Εμεραλντ', brand: 'Attrattivo', price: '45.00€', category: 'tops', storeUrl: 'https://www.attrattivo.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Saten+Blouza' },
  { id: 4, name: 'Μπεζ Πλεκτό Πουλόβερ', brand: 'Massimo Dutti', price: '59.95€', category: 'tops', storeUrl: 'https://www.massimodutti.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Plekto' },
  { id: 5, name: 'Μαύρο Crop Top', brand: 'Zara', price: '15.95€', category: 'tops', storeUrl: 'https://www.zara.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Crop+Top' },
  { id: 6, name: 'Λινό Πουκάμισο Λευκό', brand: 'Massimo Dutti', price: '49.95€', category: 'tops', storeUrl: 'https://www.massimodutti.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Lino' },
  { id: 7, name: 'Mom Jeans Ψηλόμεσο', brand: 'H&M', price: '34.99€', category: 'bottoms', storeUrl: 'https://www2.hm.com/el_gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Mom+Jeans' },
  { id: 8, name: 'Cigarette Παντελόνι', brand: 'Massimo Dutti', price: '49.95€', category: 'bottoms', storeUrl: 'https://www.massimodutti.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Cigarette' },
  { id: 9, name: 'Λινή Φούστα Midi', brand: 'Mango', price: '39.99€', category: 'bottoms', storeUrl: 'https://shop.mango.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Fousta+Midi' },
  { id: 10, name: 'Wide Leg Παντελόνι', brand: 'Zara', price: '35.95€', category: 'bottoms', storeUrl: 'https://www.zara.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Wide+Leg' },
  { id: 11, name: 'Floral Midi Φόρεμα', brand: 'Attrattivo', price: '69.00€', category: 'dresses', storeUrl: 'https://www.attrattivo.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Floral+Dress' },
  { id: 12, name: 'Μαύρο Mini Φόρεμα', brand: 'Zara', price: '39.95€', category: 'dresses', storeUrl: 'https://www.zara.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Mini+Dress' },
  { id: 13, name: 'Σατέν Slip Dress', brand: 'Mango', price: '49.99€', category: 'dresses', storeUrl: 'https://shop.mango.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Slip+Dress' },
  { id: 14, name: 'Λευκά Sneakers', brand: 'Cosmos Sport', price: '69.99€', category: 'shoes', storeUrl: 'https://www.cosmossport.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Sneakers' },
  { id: 15, name: 'Μαύρες Μπότες Ankle', brand: 'Spartoo', price: '89.00€', category: 'shoes', storeUrl: 'https://www.spartoo.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Ankle+Boots' },
  { id: 16, name: 'Μπεζ Πέδιλα Τακούνι', brand: 'Spartoo', price: '59.00€', category: 'shoes', storeUrl: 'https://www.spartoo.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Pedila' },
  { id: 17, name: 'Μαύρη Crossbody Τσάντα', brand: 'Attica DPS', price: '49.00€', category: 'bags', storeUrl: 'https://www.atticadps.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Crossbody' },
  { id: 18, name: 'Ψάθινη Tote', brand: 'Mango', price: '35.99€', category: 'bags', storeUrl: 'https://shop.mango.com/gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Tote+Bag' },
  { id: 19, name: 'Χρυσοί Κρίκοι', brand: 'Notos Galleries', price: '19.99€', category: 'accessories', storeUrl: 'https://www.notos.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Krikoi' },
  { id: 20, name: 'Cat Eye Γυαλιά', brand: 'Notos Galleries', price: '29.99€', category: 'accessories', storeUrl: 'https://www.notos.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Cat+Eye' },
  { id: 21, name: 'Δερμάτινη Ζώνη', brand: 'Factory Outlet', price: '24.99€', category: 'accessories', storeUrl: 'https://www.factoryoutlet.gr/', image: 'https://placehold.co/400x500/1a1a1a/d4af37.png?text=Zoni' },
];

const STORES = [
  { name: 'Zara', url: 'https://www.zara.com/gr/' },
  { name: 'H&M', url: 'https://www2.hm.com/el_gr/' },
  { name: 'Mango', url: 'https://shop.mango.com/gr/' },
  { name: 'Massimo Dutti', url: 'https://www.massimodutti.com/gr/' },
  { name: 'Attrattivo', url: 'https://www.attrattivo.gr/' },
  { name: 'Cosmos Sport', url: 'https://www.cosmossport.gr/' },
  { name: 'Spartoo', url: 'https://www.spartoo.gr/' },
  { name: 'Attica DPS', url: 'https://www.atticadps.gr/' },
  { name: 'Notos Galleries', url: 'https://www.notos.gr/' },
  { name: 'Factory Outlet', url: 'https://www.factoryoutlet.gr/' },
];

const STYLING_TIPS = [
  'Συνδύασε αυτό το κομμάτι με minimal αξεσουάρ για ένα κομψό look.',
  'Πρόσθεσε ένα oversized blazer για office-to-dinner στυλ.',
  'Δοκίμασε με λευκά sneakers για casual κομψότητα.',
  'Ταιριάζει τέλεια με ψηλόμεσο παντελόνι και χρυσά αξεσουάρ.',
  'Για βραδινή εμφάνιση, πρόσθεσε statement κοσμήματα.',
];

// ==================== MAIN COMPONENT ====================
export default function StylistaPage() {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [clothingImagePreview, setClothingImagePreview] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [clothingMode, setClothingMode] = useState<'upload' | 'catalog'>('upload');
  const [activeCategory, setActiveCategory] = useState('all');
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isClothingDragOver, setIsClothingDragOver] = useState(false);
  const [titleReady, setTitleReady] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const clothingFileInputRef = useRef<HTMLInputElement>(null);
  const tryOnSectionRef = useRef<HTMLDivElement>(null);

  // Scroll reveal with IntersectionObserver
  useEffect(() => {
    setTitleReady(true);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Re-observe after result changes
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal:not(.visible)');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [resultImageUrl]);

  const filteredProducts =
    activeCategory === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setUserImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setUserImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setUserImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  const handleClothingFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setClothingImage(file);
      setSelectedProduct(null);
      const reader = new FileReader();
      reader.onloadend = () => setClothingImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleClothingDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsClothingDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setClothingImage(file);
      setSelectedProduct(null);
      const reader = new FileReader();
      reader.onloadend = () => setClothingImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  }, []);

  // Determine if we have a clothing source ready
  const hasClothing = clothingMode === 'upload' ? !!clothingImage : !!selectedProduct;

  const handleTryOn = async () => {
    if (!userImage) {
      setError('Ανέβασε τη φωτογραφία σου.');
      return;
    }
    if (!hasClothing) {
      setError(clothingMode === 'upload' ? 'Ανέβασε μια φωτογραφία ρούχου.' : 'Επίλεξε ένα ρούχο από τον κατάλογο.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResultImageUrl(null);

    try {
      let clothingFile: File;

      if (clothingMode === 'upload' && clothingImage) {
        clothingFile = clothingImage;
      } else if (selectedProduct) {
        const productImageResponse = await fetch(selectedProduct.image);
        if (!productImageResponse.ok) {
          throw new Error('Δεν μπόρεσε να φορτωθεί η εικόνα προϊόντος.');
        }
        const productImageBlob = await productImageResponse.blob();
        clothingFile = new File([productImageBlob], 'clothing.png', { type: 'image/png' });
      } else {
        throw new Error('Δεν βρέθηκε εικόνα ρούχου.');
      }

      const formData = new FormData();
      formData.append('userImage', userImage);
      formData.append('clothingImage', clothingFile);

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        const detail = result.details || result.error || response.statusText;
        throw new Error(`Σφάλμα: ${detail}`);
      }

      if (result.image) {
        setResultImageUrl(result.image);
      } else {
        throw new Error('Δεν επέστρεψε εικόνα. Δοκίμασε ξανά.');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Κάτι πήγε στραβά. Δοκίμασε ξανά.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTryOn = () => {
    tryOnSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const titleText = 'STYLISTA.ai';

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="hero-gradient" />
        <div className="particles-container">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="particle" />
          ))}
        </div>

        <div className="relative z-10 text-center px-4">
          {/* Title with letter fade */}
          <h1
            className="letter-fade mb-6"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              fontWeight: 300,
              letterSpacing: '0.1em',
              color: 'var(--text-cream)',
            }}
          >
            {titleReady &&
              titleText.split('').map((char, i) => (
                <span
                  key={i}
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    color: char === '.' ? 'var(--accent-gold)' : undefined,
                  }}
                >
                  {char}
                </span>
              ))}
          </h1>

          <p
            className="mb-10 opacity-0"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
              color: 'var(--text-muted)',
              letterSpacing: '0.15em',
              animation: 'letterAppear 0.8s ease 1.2s forwards',
            }}
          >
            Ντύσου Ψηφιακά. Αγόρασε Πραγματικά.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="btn-gold" onClick={scrollToTryOn}>
              Ξεκίνα Τώρα
            </button>
            <button className="btn-ghost" onClick={scrollToTryOn}>
              Πώς Λειτουργεί ↓
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="scroll-indicator absolute bottom-8 z-10"
          style={{ color: 'var(--accent-gold)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 13l5 5 5-5M7 7l5 5 5-5" />
          </svg>
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-24 px-4" style={{ background: 'var(--bg-tertiary)' }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="reveal text-center mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--text-cream)',
            }}
          >
            Πώς Λειτουργεί
          </h2>
          <div className="section-divider mb-16 reveal reveal-delay-1" />

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-0">
            {/* Step 1 */}
            <div className="reveal reveal-delay-1 text-center flex-1 px-4">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                📸
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--accent-gold)',
                  marginBottom: '8px',
                }}
              >
                Ανέβασε Selfie
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Σύρε ή επίλεξε μια φωτογραφία σου
              </p>
            </div>

            <div className="step-connector hidden md:block reveal reveal-delay-1" />

            {/* Step 2 */}
            <div className="reveal reveal-delay-2 text-center flex-1 px-4">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                🤖
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--accent-gold)',
                  marginBottom: '8px',
                }}
              >
                Το AI σε Ντύνει
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Η τεχνητή νοημοσύνη δημιουργεί το look σου
              </p>
            </div>

            <div className="step-connector hidden md:block reveal reveal-delay-2" />

            {/* Step 3 */}
            <div className="reveal reveal-delay-3 text-center flex-1 px-4">
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl"
                style={{ background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.3)' }}
              >
                🛒
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.3rem',
                  color: 'var(--accent-gold)',
                  marginBottom: '8px',
                }}
              >
                Αγόρασε Online
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Βρες το ρούχο στο αγαπημένο σου κατάστημα
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== VIRTUAL TRY-ON SECTION ==================== */}
      <section
        ref={tryOnSectionRef}
        className="py-24 px-4"
        style={{ background: 'var(--bg-primary)' }}
      >
        <div className="max-w-7xl mx-auto">
          <h2
            className="reveal text-center mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--text-cream)',
            }}
          >
            Virtual Try-On
          </h2>
          <div className="section-divider mb-12 reveal reveal-delay-1" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* LEFT — Photo Upload */}
            <div className="reveal">
              <h3
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  color: 'var(--accent-gold-soft)',
                }}
              >
                Η Φωτογραφία σου
              </h3>

              {!userImagePreview ? (
                <div
                  className={`upload-area ${isDragOver ? 'drag-over' : ''}`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                >
                  <div
                    className="text-4xl mb-4"
                    style={{ color: 'var(--accent-gold)' }}
                  >
                    📷
                  </div>
                  <p style={{ color: 'var(--text-cream)', marginBottom: '8px' }}>
                    Σύρε τη φωτογραφία σου εδώ
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    ή πάτα για upload
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative">
                  <div
                    className="rounded-xl overflow-hidden"
                    style={{
                      border: '2px solid rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    <img
                      src={userImagePreview}
                      alt="Η φωτογραφία σου"
                      className="w-full h-auto max-h-[500px] object-contain"
                      style={{ background: 'var(--bg-secondary)' }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setUserImage(null);
                      setUserImagePreview(null);
                      setResultImageUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="mt-3 text-sm underline"
                    style={{ color: 'var(--accent-gold-soft)' }}
                  >
                    Αλλαγή φωτογραφίας
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT — Clothing Selection */}
            <div className="reveal reveal-delay-1">
              <h3
                className="mb-6"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '1.5rem',
                  color: 'var(--accent-gold-soft)',
                }}
              >
                Το Ρούχο
              </h3>

              {/* Mode Toggle: Upload vs Catalog */}
              <div className="flex gap-2 mb-6">
                <button
                  className={`category-tab ${clothingMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setClothingMode('upload')}
                >
                  📷 Ανέβασε Ρούχο
                </button>
                <button
                  className={`category-tab ${clothingMode === 'catalog' ? 'active' : ''}`}
                  onClick={() => setClothingMode('catalog')}
                >
                  🛍 Κατάλογος
                </button>
              </div>

              {/* === UPLOAD MODE === */}
              {clothingMode === 'upload' && (
                <>
                  {!clothingImagePreview ? (
                    <div
                      className={`upload-area ${isClothingDragOver ? 'drag-over' : ''}`}
                      onClick={() => clothingFileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsClothingDragOver(true); }}
                      onDragLeave={() => setIsClothingDragOver(false)}
                      onDrop={handleClothingDrop}
                    >
                      <div className="text-4xl mb-4" style={{ color: 'var(--accent-gold)' }}>
                        👗
                      </div>
                      <p style={{ color: 'var(--text-cream)', marginBottom: '8px' }}>
                        Σύρε φωτογραφία ρούχου εδώ
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        ή πάτα για upload
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px' }}>
                        Tip: Κατέβασε φωτό ρούχου από Zara, H&M κλπ.
                      </p>
                      <input
                        ref={clothingFileInputRef}
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleClothingFileChange}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{ border: '2px solid rgba(212, 175, 55, 0.3)' }}
                      >
                        <img
                          src={clothingImagePreview}
                          alt="Ρούχο"
                          className="w-full h-auto max-h-[400px] object-contain"
                          style={{ background: 'var(--bg-secondary)' }}
                        />
                      </div>
                      <button
                        onClick={() => {
                          setClothingImage(null);
                          setClothingImagePreview(null);
                          setResultImageUrl(null);
                          if (clothingFileInputRef.current) clothingFileInputRef.current.value = '';
                        }}
                        className="mt-3 text-sm underline"
                        style={{ color: 'var(--accent-gold-soft)' }}
                      >
                        Αλλαγή ρούχου
                      </button>
                    </div>
                  )}
                </>
              )}

              {/* === CATALOG MODE === */}
              {clothingMode === 'catalog' && (
                <>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                    Σύντομα θα συνδεθούμε με e-shops! Προς το παρόν, ανέβασε δική σου φωτό ρούχου.
                  </p>
                  {/* Category Tabs */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
                        onClick={() => setActiveCategory(cat.id)}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Product Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                        onClick={() => { setSelectedProduct(product); setClothingImage(null); setClothingImagePreview(null); }}
                      >
                        <div className="checkmark">✓</div>
                        <div className="aspect-[4/5] overflow-hidden">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium truncate" style={{ color: 'var(--text-cream)' }}>
                            {product.name}
                          </p>
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {product.brand}
                          </p>
                          <p className="text-sm font-semibold mt-1" style={{ color: 'var(--accent-gold)' }}>
                            {product.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-center mt-6 text-red-400 text-sm">{error}</p>
          )}

          {/* Try On Button */}
          <div className="text-center mt-10 reveal">
            <button
              className="btn-gold w-full max-w-md text-lg"
              onClick={handleTryOn}
              disabled={isLoading || !userImage || !hasClothing}
              style={{
                opacity: !userImage || !hasClothing ? 0.5 : 1,
                cursor:
                  !userImage || !hasClothing ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? 'Περίμενε...' : 'Δοκίμασέ το!'}
            </button>
          </div>
        </div>
      </section>

      {/* ==================== LOADING ==================== */}
      {isLoading && (
        <section
          className="py-20 px-4 text-center"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <div className="gold-spinner mx-auto mb-6" />
          <p
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.3rem',
              color: 'var(--accent-gold-soft)',
            }}
          >
            Ο AI σε ντύνει...
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            Αυτό μπορεί να πάρει μερικά δευτερόλεπτα
          </p>
        </section>
      )}

      {/* ==================== RESULT ==================== */}
      {resultImageUrl && !isLoading && (
        <section
          className="py-24 px-4"
          style={{ background: 'var(--bg-tertiary)' }}
        >
          <div className="max-w-4xl mx-auto">
            <h2
              className="reveal text-center mb-4"
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 400,
                color: 'var(--text-cream)',
              }}
            >
              Το Look σου
            </h2>
            <div className="section-divider mb-12 reveal reveal-delay-1" />

            {/* Result Image */}
            <div className="reveal result-image-container mx-auto max-w-lg">
              <img
                src={resultImageUrl}
                alt="Virtual try-on αποτέλεσμα"
                className="w-full h-auto"
              />
            </div>

            {/* AI Styling Tips */}
            <div className="reveal reveal-delay-1 tips-card mt-8 max-w-lg mx-auto">
              <p
                className="mb-3 font-semibold"
                style={{ color: 'var(--accent-gold)' }}
              >
                🤖 Ο AI Στυλίστας λέει:
              </p>
              <p style={{ color: 'var(--text-cream)', lineHeight: '1.6' }}>
                {STYLING_TIPS[Math.floor(Math.random() * STYLING_TIPS.length)]}
              </p>
            </div>

            {/* Buy Section */}
            {selectedProduct && (
              <div className="reveal reveal-delay-2 mt-8 text-center">
                <p
                  className="mb-4"
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.2rem',
                    color: 'var(--text-cream)',
                  }}
                >
                  Αγόρασε αυτό το look:
                </p>
                <div
                  className="inline-block p-4 rounded-xl"
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                  }}
                >
                  <p style={{ color: 'var(--text-cream)', fontWeight: 600 }}>
                    {selectedProduct.name}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                    {selectedProduct.brand} — {selectedProduct.price}
                  </p>
                  <a
                    href={selectedProduct.storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold inline-block mt-4 text-sm"
                    style={{ padding: '10px 28px' }}
                  >
                    Αγόρασε από {selectedProduct.brand} →
                  </a>
                </div>

                <div className="mt-6">
                  <button
                    onClick={() => {
                      setResultImageUrl(null);
                      setSelectedProduct(null);
                      scrollToTryOn();
                    }}
                    className="text-sm underline"
                    style={{ color: 'var(--accent-gold-soft)' }}
                  >
                    Δοκίμασε κάτι άλλο
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== PARTNER STORES ==================== */}
      <section className="py-24 px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="reveal text-center mb-4"
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 400,
              color: 'var(--text-cream)',
            }}
          >
            Τα Καταστήματά μας
          </h2>
          <div className="section-divider mb-12 reveal reveal-delay-1" />

          <div className="stores-scroll reveal reveal-delay-2">
            {STORES.map((store) => (
              <a
                key={store.name}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                className="store-card"
              >
                {store.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer
        className="py-12 px-4 text-center"
        style={{
          background: 'var(--bg-tertiary)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.3rem',
            color: 'var(--accent-gold-soft)',
            letterSpacing: '0.1em',
            marginBottom: '8px',
          }}
        >
          STYLISTA.ai
        </p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          AI Fashion Platform — Ελλάδα
        </p>
        <p className="text-xs mt-4" style={{ color: 'rgba(160,160,160,0.5)' }}>
          © 2026 Stylista AI
        </p>
      </footer>
    </div>
  );
}
