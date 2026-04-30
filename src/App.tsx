import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, History, Languages, RotateCcw, ScanLine, X, ChevronRight, Info, Volume2, Maximize2, Trash2, Facebook, Instagram, MessageCircle, Play, Share2 } from 'lucide-react';
import { identifyImage } from './services/gemini';
import { IdentificationResult, Language, LANGUAGE_NAMES } from './types';

import { AppLogo } from './components/Logo';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showSocials, setShowSocials] = useState(false);
  const [history, setHistory] = useState<IdentificationResult[]>([]);
  const [selectedLangs, setSelectedLangs] = useState<Set<Language>>(new Set(['ar', 'en']));
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Logo URL for the app (using a placeholder that represents the uploaded logo or the actual if available)
  const LOGO_URL = "https://images.ais-static.com/artifacts/logo_image_1714487667.png"; // Placeholder for the intent

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Camera
  useEffect(() => {
    if (isLoading) return;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false 
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        setError("Please allow camera access to use this app.");
      }
    }
    startCamera();
  }, []);

  const speak = (text: string, lang: Language) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    
    // Map language codes to utterance codes
    const voicedMap: Record<Language, string> = {
      ar: 'ar-SA',
      en: 'en-US',
      fr: 'fr-FR'
    };
    
    utterance.lang = voicedMap[lang];
    window.speechSynthesis.speak(utterance);
  };

  const toggleLanguage = (lang: Language) => {
    const newLangs = new Set(selectedLangs);
    if (newLangs.has(lang)) {
      if (newLangs.size > 1) newLangs.delete(lang);
    } else {
      newLangs.add(lang);
    }
    setSelectedLangs(newLangs);
  };

  const clearHistory = () => setHistory([]);

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    setError(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const result = await identifyImage(base64Image, Array.from(selectedLangs));
        
        // Generate a high-quality AI representation based on the English name
        const searchTerm = result.english || 'object';
        const generatedUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(searchTerm + ' product photography, high quality, studio lighting, clean minimal plain background')}?width=1024&height=1024&nologo=true&enhance=true`;
        
        const finalResult = {
          ...result,
          generatedImageUrl: generatedUrl
        };

        setLastResult(finalResult);
        setHistory(prev => [finalResult, ...prev].slice(0, 50));
      } catch (err) {
        console.error("Identification error:", err);
        setError("Failed to identify object. Please try again.");
      } finally {
        setIsScanning(false);
      }
    }
  }, [isScanning, selectedLangs]);

  return (
    <div className="fixed inset-0 bg-zinc-50 text-brand-navy p-4 md:p-6 font-sans flex flex-col gap-6 overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative w-64 h-64 mb-8"
            >
              <AppLogo />
            </motion.div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: 200 }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="h-1 bg-brand-orange rounded-full shadow-[0_0_10px_rgba(241,90,36,0.5)]"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 text-xs font-mono tracking-[0.3em] text-brand-orange"
            >
              INITIALIZING IFHAM EDITION
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Atmosphere */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_30%,#f15a24_0%,transparent_70%)]" />
      </div>

      {/* Header Section */}
      <header className="relative z-20 flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 flex items-center justify-center p-1">
            <AppLogo />
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-orange/20 to-brand-navy/10 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex items-center px-4 md:px-6 py-2 bg-white/40 backdrop-blur-sm border border-zinc-200/50 rounded-lg shadow-sm">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-brand-orange/40 -mt-px -ml-px rounded-tl-sm"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-brand-orange/40 -mt-px -mr-px rounded-tr-sm"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-brand-orange/40 -mb-px -ml-px rounded-bl-sm"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-brand-orange/40 -mb-px -mr-px rounded-br-sm"></div>
              
              <span className="text-sm md:text-xl font-bold font-serif text-brand-navy" dir="rtl">استكشف مع إفهام</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AnimatePresence>
            {showSocials && (
              <motion.div 
                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                className="flex items-center gap-1 bg-white/80 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-zinc-200 shadow-lg mr-2"
              >
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 transition-transform hover:scale-110 active:scale-95 text-brand-navy hover:text-[#1877F2]" title="Facebook">
                  <Facebook className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 transition-transform hover:scale-110 active:scale-95 text-brand-navy hover:text-[#E4405F]" title="Instagram">
                  <Instagram className="w-4 h-4 md:w-5 md:h-5" />
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="p-2 transition-transform hover:scale-110 active:scale-95 text-brand-navy hover:text-[#000000]" title="TikTok">
                  <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" />
                </a>
                <div className="w-px h-4 bg-zinc-200 mx-1"></div>
                <a href="https://wa.me/" target="_blank" rel="noopener noreferrer" className="p-2 transition-transform hover:scale-110 active:scale-95 text-brand-navy hover:text-[#25D366]" title="WhatsApp">
                  <MessageCircle className="w-4 h-4 md:w-5 md:h-5" />
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setShowSocials(!showSocials)}
            className={`p-3 rounded-2xl border transition-all shadow-sm ${showSocials ? 'bg-brand-orange text-white border-brand-orange shadow-brand-orange/20' : 'bg-white text-brand-navy border-zinc-200 hover:shadow-md'}`}
          >
            <Share2 className={`w-5 h-5 transition-transform duration-300 ${showSocials ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </header>

      <main className="relative z-10 grid grid-cols-12 grid-rows-6 gap-4 flex-1 h-full min-h-0">
        
        {/* Main Viewfinder (Bento Card Large) */}
        <section className="col-span-12 lg:col-span-8 row-span-4 lg:row-span-5 bg-zinc-900 rounded-[2rem] lg:rounded-[2.5rem] border border-zinc-200 overflow-hidden relative group shadow-xl">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transition-all duration-700"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 z-10 pointer-events-none"></div>

          {/* Scanning HUD Overlay */}
          <div className="absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-between pointer-events-none">
            <div className="flex justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 border-t-2 border-l-2 border-white/50"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 border-t-2 border-r-2 border-white/50"></div>
            </div>

            <div className="flex flex-col items-center gap-4">
               <motion.button 
                 whileHover={{ scale: 1.05 }}
                 whileTap={{ scale: 0.95 }}
                 disabled={isScanning}
                 onClick={handleScan}
                 className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl pointer-events-auto cursor-pointer"
               >
                 <div className={`w-12 h-12 md:w-16 md:h-16 border-4 rounded-full transition-all duration-300 ${isScanning ? 'border-brand-orange scale-90' : 'border-brand-navy'}`}>
                    <div className={`w-full h-full rounded-full bg-white flex items-center justify-center`}>
                      {isScanning && <RotateCcw className="w-6 h-6 text-brand-orange animate-spin" />}
                    </div>
                 </div>
               </motion.button>
               <span className={`text-[10px] md:text-xs font-bold tracking-[0.2em] px-4 py-1.5 rounded-full backdrop-blur-md transition-all shadow-lg ${isScanning ? 'bg-brand-orange text-white' : 'bg-brand-navy text-white'}`}>
                 {isScanning ? 'ANALYZING...' : 'CAPTURE OBJECT'}
               </span>
            </div>

            <div className="flex justify-between">
              <div className="w-8 h-8 md:w-12 md:h-12 border-b-2 border-l-2 border-white/50"></div>
              <div className="w-8 h-8 md:w-12 md:h-12 border-b-2 border-r-2 border-white/50"></div>
            </div>
          </div>


          {/* Error Feed */}
          {error && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-500/20 border border-red-500/50 backdrop-blur-xl px-4 py-2 rounded-xl flex items-center gap-2">
              <Info className="w-4 h-4 text-red-400" />
              <span className="text-xs font-medium text-red-200">{error}</span>
            </div>
          )}
        </section>

        {/* Result Display (Bento Card Small) */}
        <section className="col-span-12 lg:col-span-4 row-span-2 lg:row-span-3 bg-white rounded-[2rem] p-6 lg:p-6 flex flex-col justify-center shadow-2xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!lastResult && !isScanning ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center text-zinc-400 text-center space-y-2"
              >
                <ScanLine className="w-12 h-12 opacity-20" />
                <p className="text-sm font-medium">Ready for capture</p>
              </motion.div>
            ) : lastResult && !isScanning ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Inference Result</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[9px] font-black rounded-sm tracking-tighter uppercase font-mono">Status: Ready</span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col md:flex-row lg:flex-col gap-6">
                  {/* Generated Preview */}
                  <div className="relative aspect-square w-24 md:w-32 lg:w-32 rounded-2xl overflow-hidden border border-brand-navy/10 bg-zinc-50 shadow-inner group/preview">
                    <img 
                      src={lastResult.generatedImageUrl} 
                      alt="AI Interpretation" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-brand-navy/10 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                       <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-4">
                    {lastResult.arabic && (
                      <div className="group flex items-center justify-between">
                        <h2 className="text-brand-navy text-5xl font-bold font-serif leading-none" dir="rtl">{lastResult.arabic}</h2>
                        <button 
                          onClick={() => speak(lastResult.arabic!, 'ar')}
                          className="p-2 bg-brand-orange/5 text-brand-orange rounded-full hover:bg-brand-orange/10 transition-colors"
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                    
                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      {lastResult.english && (
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-500 text-2xl font-medium tracking-tight uppercase">{lastResult.english}</p>
                          <button 
                            onClick={() => speak(lastResult.english!, 'en')}
                            className="p-1.5 text-zinc-400 hover:text-brand-orange transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {lastResult.french && (
                        <div className="flex items-center justify-between">
                          <p className="text-zinc-400 text-xl font-light italic tracking-tight">{lastResult.french}</p>
                          <button 
                            onClick={() => speak(lastResult.french!, 'fr')}
                            className="p-1.5 text-zinc-300 hover:text-brand-orange transition-colors"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center gap-3">
                  <span className="px-2 py-1 bg-zinc-100 rounded-md text-[10px] font-bold text-zinc-500 font-mono tracking-tighter">OBJ_{(Math.random() * 1000).toFixed(0).padStart(3, '0')}</span>
                  <span className="px-2 py-1 bg-zinc-100 rounded-md text-[10px] font-bold text-zinc-500 font-mono tracking-tighter">LAT_{Date.now() % 100}ms</span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <div className="w-full h-8 bg-zinc-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="h-full bg-brand-orange shadow-[0_0_15px_rgba(241,90,36,0.5)]"
                  />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-pulse">Consulting Ifham Edition...</p>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* History (Bento Card Small) */}
        <section className="hidden lg:flex col-span-4 row-span-3 bg-white rounded-[2rem] border border-zinc-200 p-6 flex-col shadow-xl overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
              <History className="w-3 h-3" /> System Logs
            </h3>
            <button onClick={clearHistory} className="text-zinc-600 hover:text-brand-orange transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {history.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-brand-navy opacity-30">
                 <History className="w-12 h-12 mb-2" />
                 <p className="text-xs font-bold uppercase tracking-widest">Logs Purged</p>
               </div>
            ) : (
              history.map((item, idx) => (
                <motion.div 
                  key={item.timestamp}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100 group cursor-pointer hover:border-brand-orange/30 hover:bg-white transition-all shadow-sm"
                  onClick={() => setLastResult(item)}
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-200">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="History" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate leading-none mb-1 text-brand-navy" dir="rtl">{item.arabic}</p>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-tighter font-mono flex items-center gap-1">
                      {item.english} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Volume2 className="w-4 h-4 text-brand-orange" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Language Switcher (Bottom Bento) */}
        <section className="col-span-12 lg:col-span-8 row-span-1 bg-brand-orange rounded-3xl lg:rounded-[2rem] p-2 flex items-center justify-between shadow-xl">
          <div className="flex items-center px-4 md:px-8 w-full md:w-auto">
            <span className="hidden md:block text-brand-navy font-black text-[10px] uppercase tracking-widest mr-8">Neural Lexicon</span>
            <div className="flex gap-2 flex-1 md:flex-none">
              {(['ar', 'en', 'fr'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => toggleLanguage(lang)}
                  className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-2xl text-[10px] md:text-xs font-black tracking-widest transition-all ${
                    selectedLangs.has(lang)
                    ? 'bg-brand-navy text-white shadow-xl scale-105'
                    : 'bg-brand-navy/10 text-brand-navy border border-brand-navy/10 hover:bg-brand-navy/20'
                  }`}
                >
                  {LANGUAGE_NAMES[lang].toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex px-8 py-3 bg-brand-navy/60 rounded-2xl items-center gap-4 mx-2">
             <div className="flex gap-1.5">
               {[1, 2, 3].map(i => (
                 <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
               ))}
             </div>
             <span className="text-brand-orange text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Parallel Stream Enabled</span>
          </div>
        </section>

      </main>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}
