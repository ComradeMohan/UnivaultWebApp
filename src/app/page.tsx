'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/context/SessionContext';
import { 
  BookOpen, 
  Layers, 
  TrendingUp, 
  Menu, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Smartphone,
  Play,
  Pause,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';

const screenshots = [
  {
    id: 'dashboard',
    title: 'Executive Dashboard',
    tag: 'Overview',
    description: 'Get a birds-eye view of your CGPA, course completion progress, and upcoming active assessments at a single glance.',
    src: '/images/home.jpg',
  },
  {
    id: 'courses',
    title: 'Curriculum Ledger',
    tag: 'Courses',
    description: 'Drill down into registered semesters, view syllabus timelines, track attendance thresholds, and monitor credits.',
    src: '/images/courses.jpg',
  },
  {
    id: 'library',
    title: 'Digital Study Vault',
    tag: 'Materials',
    description: 'Access curated textbook chapters, reference handouts, worksheets, and lecture slides directly from the cloud library.',
    src: '/images/reading.jpg',
  },
  {
    id: 'prep',
    title: 'Test Prep Console',
    tag: 'Preparation',
    description: 'Practice time-tracked assessments, review key concept notes, and benchmark your progress before tests.',
    src: '/images/prep page.jpg',
  },
  {
    id: 'assessment',
    title: 'Active MCQs',
    tag: 'Evaluation',
    description: 'Take dynamic course practice tests with instantaneous score evaluation, answer reviews, and analytical explanations.',
    src: '/images/mcq.jpg',
  },
  {
    id: 'analytics',
    title: 'Performance Ledger',
    tag: 'Analytics',
    description: 'Monitor your scoring patterns, review complete history lists of past tests, and analyze subject mastery indexes.',
    src: '/images/test history.jpg',
  }
];

// Reusable scroll-triggered animated numeric counter (fully native, zero dependencies)
function AnimatedStat({ target, suffix = '', decimals = 0, duration = 2000 }: { target: number; suffix?: string; decimals?: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            // Ease-out quadratic calculation
            const easeProgress = progress * (2 - progress);
            setCount(easeProgress * target);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [target, duration, hasAnimated]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}

// Reusable scroll-triggered animated text reveal
function AnimatedTextStat({ text }: { text: string }) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [hasAnimated]);

  return (
    <span 
      ref={elementRef} 
      className={`transition-all duration-1000 transform select-none ${
        hasAnimated 
          ? 'opacity-100 scale-100 text-[#50e1f9] drop-shadow-[0_0_15px_rgba(80,225,249,0.5)]' 
          : 'opacity-0 scale-90 text-slate-500'
      }`}
    >
      {text}
    </span>
  );
}

export default function Home() {
  const { user } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Video Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer to control video playback based on viewport visibility
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentVideo = videoRef.current;
    if (!currentVideo) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.25, // Play when 25% of the video container is visible
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          currentVideo.play()
            .then(() => setIsPlaying(true))
            .catch(() => setIsPlaying(false)); // Handles browser autoplay policy
        } else {
          currentVideo.pause();
          setIsPlaying(false);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    observer.observe(currentVideo);

    return () => {
      observer.unobserve(currentVideo);
    };
  }, []);

  // Auto-rotate tabs every 4.5 seconds (only on mobile viewports to prevent clashing with scroll)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => window.innerWidth < 1024;
    if (!checkMobile()) return;

    const interval = setInterval(() => {
      setActiveTab((prev) => {
        const currentIndex = screenshots.findIndex((s) => s.id === prev);
        const nextIndex = (currentIndex + 1) % screenshots.length;
        return screenshots[nextIndex].id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  // Scroll-based screenshot cycling for desktop viewports
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const checkMobile = () => window.innerWidth < 1024;
    if (checkMobile()) return;

    const observerOptions = {
      root: null,
      rootMargin: '-30% 0px -40% 0px', // Activates when the element passes the middle section of screen
      threshold: 0.15,
    };

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const screenId = entry.target.getAttribute('data-screen-id');
          if (screenId) {
            setActiveTab(screenId);
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const targets = document.querySelectorAll('.desktop-scroll-section');
    targets.forEach((target) => observer.observe(target));

    return () => {
      targets.forEach((target) => observer.unobserve(target));
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <div className="bg-obsidian-mesh text-slate-100 min-h-screen flex flex-col font-sans overflow-x-hidden">
      
      {/* Premium Glassmorphic Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl rounded-full bg-[#060e20]/40 backdrop-blur-xl border border-white/5 shadow-[0_20px_50px_-12px_rgba(0,188,211,0.15)] z-50 transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-8 py-3 w-full">
          <Link href="/" className="flex items-center space-x-2 hover:scale-[1.02] transition-transform duration-300">
            <Image src="/images/logo.png" alt="UniVault Logo" width={32} height={32} />
            <span className="font-bold font-poppins text-lg text-slate-100 tracking-wide">
              UniVault
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-4">
            <a href="#video-demo" className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-all px-3 py-1.5 rounded-full hover:bg-white/5">Video Demo</a>
            <a href="#showcase" className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-all px-3 py-1.5 rounded-full hover:bg-white/5">App Tour</a>
            <a href="#features" className="text-sm font-semibold text-slate-400 hover:text-slate-100 transition-all px-3 py-1.5 rounded-full hover:bg-white/5">Core Systems</a>
          </nav>

          {/* Header Action Button with PREFETCH for instant transition */}
          <div className="hidden md:block">
            {user ? (
              <Link href="/dashboard" prefetch={true} className="liquid-gradient text-slate-900 font-semibold text-sm px-6 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(106,178,255,0.4)] transition-all duration-300 block">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" prefetch={true} className="liquid-gradient text-slate-900 font-semibold text-sm px-6 py-2.5 rounded-full hover:scale-105 hover:shadow-[0_0_20px_rgba(106,178,255,0.4)] transition-all duration-300 block">
                Get Started
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#6ab2ff] hover:text-[#50e1f9] p-2 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 w-full rounded-2xl bg-[#060e20]/95 backdrop-blur-2xl border border-white/5 p-6 md:hidden shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-top-5 duration-300">
            <a 
              href="#video-demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-400 hover:text-slate-100 py-2 border-b border-white/5"
            >
              Video Demo
            </a>
            <a 
              href="#showcase" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-400 hover:text-slate-100 py-2 border-b border-white/5"
            >
              App Tour
            </a>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-semibold text-slate-400 hover:text-slate-100 py-2 border-b border-white/5"
            >
              Core Systems
            </a>
            <div className="pt-2">
              {user ? (
                <Link href="/dashboard" prefetch={true} className="liquid-gradient text-slate-900 font-semibold text-center py-3 rounded-full hover:scale-105 transition-all duration-300 block w-full">
                  Dashboard
                </Link>
              ) : (
                <Link href="/login" prefetch={true} className="liquid-gradient text-slate-900 font-semibold text-center py-3 rounded-full hover:scale-105 transition-all duration-300 block w-full">
                  Get Started
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-grow pt-32 md:pt-40">
        
        {/* HERO SECTION */}
        <section className="relative px-6 md:px-16 pt-8 md:pt-16 pb-12 max-w-7xl mx-auto flex flex-col items-center text-center z-20">
          {/* Neon Radial Glow Under Hero */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          {/* Eyebrow badge (Removed 'Official' word) */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-[#50e1f9] font-medium tracking-wide mb-6 backdrop-blur-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-[#50e1f9]" />
            SIMATS Academic Suite
          </div>

          <h1 className="font-poppins text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white mb-6 max-w-5xl leading-none">
            Unveil Your <span className="liquid-text drop-shadow-[0_0_20px_rgba(80,225,249,0.2)]">Academic Mastery.</span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-10 max-w-3xl leading-relaxed">
            The ultimate executive dashboard for grades, course tracks, and predictive analytics. 
            Navigate your academic journey with precision and luminous clarity.
          </p>

          {/* Optimized Hero CTAs with prefetch and playstore */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16 z-10 w-full sm:w-auto px-4 justify-center">
            {user ? (
              <Link href="/dashboard" prefetch={true} className="liquid-gradient text-slate-900 font-bold px-8 py-4 rounded-full hover:scale-105 hover:glow-active transition-all duration-300 shadow-[0_0_30px_rgba(106,178,255,0.4)] flex items-center justify-center gap-2">
                Enter Your Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link href="/signup" prefetch={true} className="liquid-gradient text-slate-900 font-bold px-8 py-4 rounded-full hover:scale-105 hover:glow-active transition-all duration-300 shadow-[0_0_30px_rgba(106,178,255,0.4)] flex items-center justify-center gap-2">
                Elevate Your Academics <ArrowRight className="h-4 w-4" />
              </Link>
            )}

            {/* PlayStore Download App CTA */}
            <a 
              href="https://play.google.com/store/apps/details?id=com.simats.univault" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="glass-panel text-slate-200 border border-white/10 font-bold px-8 py-4 rounded-full hover:bg-white/10 hover:border-white/20 hover:text-white transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="h-5 w-5 fill-current text-[#50e1f9]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.609 1.814L13.784 12 3.609 22.186A2.229 2.229 0 0 1 3 20.625V3.375c0-.621.22-1.189.609-1.561zM14.977 13.193l2.84 2.84-14.208 8.163c.487.351 1.084.554 1.734.554a3.35 3.35 0 0 0 1.833-.538l12.756-7.33a3.357 3.357 0 0 0 0-5.836l-12.756-7.33A3.35 3.35 0 0 0 6.343.25C5.693.25 5.096.453 4.609.804l14.208 8.163-3.84 3.84v.386z" />
              </svg>
              Download App
            </a>
          </div>

          {/* Interactive HTML5 Demo Video Embed (Removed negative bottom margins so it never clips!) */}
          <div id="video-demo" className="relative w-full max-w-5xl mx-auto z-20 group mt-4 mb-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#6ab2ff] to-[#50e1f9] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-700"></div>
            
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_60px_rgba(0,188,211,0.15)] bg-[#060e20] aspect-video w-full">
              <video 
                ref={videoRef}
                className="w-full h-full object-cover opacity-90 group-hover:scale-[1.005] transition-transform duration-700"
                src="/video/demo.mp4"
                loop
                muted
                playsInline
              />
              
              {/* Custom Video Bezel Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#060e20]/60 via-transparent to-transparent flex flex-col justify-end p-6 md:p-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="font-bold text-white text-base md:text-lg">UniVault Interactive Demo</h3>
                    <p className="text-slate-300 text-xs md:text-sm">See how UniVault streamlines grading, exams, and curriculum assets.</p>
                  </div>
                  <button 
                    onClick={togglePlay}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-[#50e1f9] hover:text-slate-900 text-[#50e1f9] transition-all duration-300 transform active:scale-95"
                  >
                    {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE SHOWCASE CONSOLE SECTION */}
        <section id="showcase" className="px-6 md:px-16 py-24 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="text-center mb-16">
            <div className="text-[#50e1f9] font-bold text-xs uppercase tracking-widest mb-3">Live Application Preview</div>
            <h2 className="font-poppins text-3xl md:text-5xl font-extrabold text-white mb-4">Walkthrough the Vault</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base">
              Explore the UniVault mobile environment. Click through tabs on mobile, or scroll down on desktop to see the UI adapt.
            </p>
          </div>

          {/* Mobile Showcase Viewport (lg:hidden) */}
          <div className="lg:hidden flex flex-col gap-6 items-center">
            {/* Horizontal Tab Buttons */}
            <div className="flex gap-2 overflow-x-auto pb-3 w-full scrollbar-none snap-x justify-start px-2">
              {screenshots.map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveTab(screen.id)}
                  className={`snap-center shrink-0 px-4 py-2.5 rounded-full border text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === screen.id 
                      ? 'bg-[#141f38] border-[#6ab2ff]/40 text-[#50e1f9] shadow-[0_0_10px_rgba(106,178,255,0.1)]' 
                      : 'bg-[#060e20]/60 border-white/5 text-slate-400'
                  }`}
                >
                  {screen.tag}
                </button>
              ))}
            </div>

            {/* Centered Premium Mobile Phone Device Mockup for Mobile Portrait App Screens */}
            <div className="relative w-full max-w-[270px] xs:max-w-[280px] aspect-[1080/2332] bg-[#060e20] rounded-[36px] border-4 border-slate-800 shadow-[0_20px_40px_rgba(0,188,211,0.2)] overflow-hidden p-1 ring-1 ring-white/5">
              
              {/* Mobile Speaker & Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-800 rounded-full z-30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-[#060e20] rounded-full mr-2"></div>
                <div className="w-6 h-0.5 bg-[#060e20] rounded-full"></div>
              </div>

              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#50e1f9]/5 via-white/5 to-transparent pointer-events-none z-20"></div>

              {screenshots.map((screen) => (
                <div 
                  key={screen.id}
                  className={`absolute inset-0.5 rounded-[30px] overflow-hidden shadow-2xl transition-all duration-500 flex items-center justify-center ${
                    activeTab === screen.id ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                  }`}
                >
                  <Image 
                    src={screen.src} 
                    alt={screen.title} 
                    className="w-full h-full object-cover rounded-[30px]" 
                    fill
                    sizes="280px"
                    priority
                    unoptimized
                  />
                </div>
              ))}
            </div>

            {/* Active Card Description text */}
            <div className="bg-[#0f1930]/30 rounded-2xl p-5 border border-white/5 backdrop-blur-sm min-h-[120px] w-full text-center">
              {screenshots.map((screen) => (
                screen.id === activeTab && (
                  <div key={screen.id} className="animate-in fade-in duration-300">
                    <h3 className="font-poppins font-bold text-lg text-white mb-2">{screen.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{screen.description}</p>
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Desktop Showcase Viewport (hidden lg:grid) - Spaced sections with sticky screenshot player */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-12 items-start relative bg-[#0f1930]/10 rounded-3xl p-10 border border-white/5 backdrop-blur-sm">
            
            {/* Left Column: Scrollable text blocks spaced out vertically */}
            <div className="lg:col-span-6 flex flex-col gap-16 py-8">
              {screenshots.map((screen) => (
                <div
                  key={screen.id}
                  data-screen-id={screen.id}
                  className={`desktop-scroll-section pl-8 border-l-2 transition-all duration-500 py-4 cursor-pointer hover:translate-x-1 ${
                    activeTab === screen.id
                      ? 'border-[#50e1f9] text-white animate-pulse-subtle'
                      : 'border-white/5 text-slate-500 hover:border-white/10'
                  }`}
                  onClick={() => {
                    const el = document.querySelector(`[data-screen-id="${screen.id}"].desktop-scroll-section`);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                    activeTab === screen.id ? 'text-[#50e1f9]' : 'text-slate-500'
                  }`}>
                    {screen.tag}
                  </span>
                  <h3 className={`font-poppins font-extrabold text-2xl mt-2 mb-3 transition-colors duration-300 ${
                    activeTab === screen.id ? 'text-white' : 'text-slate-400'
                  }`}>
                    {screen.title}
                  </h3>
                  <p className={`text-base leading-relaxed transition-colors duration-300 ${
                    activeTab === screen.id ? 'text-slate-300 font-medium' : 'text-slate-500'
                  }`}>
                    {screen.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Right Column: Sticky screenshot container (Centered Premium Mobile Phone Device Mockup with EXACT aspect ratio) */}
            <div className="lg:col-span-6 lg:sticky lg:top-28 lg:self-start w-full flex justify-center py-4 transition-all">
              <div className="relative w-full max-w-[290px] xl:max-w-[310px] aspect-[1080/2332] bg-[#060e20] rounded-[42px] border-[6px] border-slate-800 shadow-[0_25px_60px_rgba(0,188,211,0.2)] overflow-hidden p-1.5 ring-1 ring-white/10">
                
                {/* Smartphone Speaker & Camera Notch Cutout */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-slate-800 rounded-full z-30 flex items-center justify-between px-3">
                  <div className="w-1.5 h-1.5 bg-[#060e20] rounded-full"></div>
                  <div className="w-8 h-1 bg-[#060e20] rounded-full"></div>
                </div>

                {/* Subtle glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#50e1f9]/5 via-white/5 to-transparent pointer-events-none z-25"></div>
                
                {screenshots.map((screen) => (
                  <div 
                    key={screen.id}
                    className={`absolute inset-1 rounded-[34px] overflow-hidden shadow-2xl transition-all duration-500 flex items-center justify-center ${
                      activeTab === screen.id ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'
                    }`}
                  >
                    <Image 
                      src={screen.src} 
                      alt={screen.title} 
                      className="w-full h-full object-cover rounded-[34px] hover:scale-[1.015] transition-transform duration-500" 
                      fill
                      sizes="320px"
                      priority
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* CORE FEATURES SYSTEM CARDS */}
        <section id="features" className="px-6 md:px-16 py-24 max-w-7xl mx-auto relative z-10 border-t border-white/5">
          <div className="text-center mb-16">
            <div className="text-[#50e1f9] font-bold text-xs uppercase tracking-widest mb-3">Academic Suite</div>
            <h2 className="font-poppins text-3xl md:text-5xl font-extrabold text-white mb-4">Core Architecture</h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base sm:text-lg">
              Master every aspect of your academic life with our precision-engineered tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* System 1: Academic Ledger */}
            <div className="bg-[#0f1930]/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:bg-[#141f38]/60 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(106,178,255,0.05)] group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-[#6ab2ff]/10 group-hover:border-[#6ab2ff]/30 transition-all">
                  <Layers className="h-6 w-6 text-[#6ab2ff]" />
                </div>
                <h3 className="font-poppins text-2xl font-bold text-white mb-4">Academic Ledger</h3>
                <p className="text-slate-400 leading-relaxed">
                  Tonal obsidian cards meticulously track your academic progress, credits, and GPA trajectories without the traditional SaaS grid-line clutter.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs text-[#6ab2ff] font-semibold tracking-wider uppercase group-hover:text-[#50e1f9] transition-colors">
                Explore Ledger <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* System 2: Vault of Knowledge */}
            <div className="bg-[#0f1930]/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:bg-[#141f38]/60 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(106,178,255,0.05)] group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-[#50e1f9]/10 group-hover:border-[#50e1f9]/30 transition-all">
                  <BookOpen className="h-6 w-6 text-[#50e1f9]" />
                </div>
                <h3 className="font-poppins text-2xl font-bold text-white mb-4">Vault of Knowledge</h3>
                <p className="text-slate-400 leading-relaxed">
                  Centralize course resources, tailored study guides, active worksheets, and collaborative notes in a secure, ultra-organized database environment.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs text-[#50e1f9] font-semibold tracking-wider uppercase group-hover:text-[#6ab2ff] transition-colors">
                Browse Materials <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

            {/* System 3: Predictive Analytics */}
            <div className="bg-[#0f1930]/40 rounded-3xl p-8 border border-white/5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:bg-[#141f38]/60 hover:border-white/10 hover:shadow-[0_20px_40px_rgba(106,178,255,0.05)] group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:bg-[#ffb4ab]/10 group-hover:border-[#ffb4ab]/30 transition-all">
                  <TrendingUp className="h-6 w-6 text-[#44d8f0]" />
                </div>
                <h3 className="font-poppins text-2xl font-bold text-white mb-4">Predictive Analytics</h3>
                <p className="text-slate-400 leading-relaxed">
                  Dynamic interactive charts powered by smart prediction algorithms forecast your academic outcomes and help optimize study strategy mid-semester.
                </p>
              </div>
              <div className="mt-8 flex items-center gap-2 text-xs text-[#44d8f0] font-semibold tracking-wider uppercase group-hover:text-white transition-colors">
                Run Simulation <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>

          </div>
        </section>

        {/* TRUST / METRICS DIVISION (With beautiful scroll-triggered count-up animations) */}
        <section className="py-20 relative overflow-hidden border-t border-white/5">
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#00bcd3]/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none"></div>
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="glass-panel rounded-3xl p-10 border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 text-center bg-[#0f1930]/20">
              <div>
                <div className="text-3xl md:text-5xl font-extrabold text-white font-poppins mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex justify-center items-center h-12 md:h-16">
                  <AnimatedStat target={300} suffix="+" />
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Active Users</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-extrabold font-poppins mb-2 flex justify-center items-center h-12 md:h-16">
                  <AnimatedTextStat text="Good" />
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Rating</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-extrabold text-white font-poppins mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex justify-center items-center h-12 md:h-16">
                  <AnimatedStat target={4.8} decimals={1} suffix="★" />
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Student Rating</div>
              </div>
              <div>
                <div className="text-3xl md:text-5xl font-extrabold text-white font-poppins mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent flex justify-center items-center h-12 md:h-16">
                  <AnimatedStat target={20} suffix="+" />
                </div>
                <div className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-wider">Courses</div>
              </div>
            </div>
          </div>
        </section>

        {/* SCHOLARS' VERDICT (TESTIMONIALS) */}
        <section className="px-6 md:px-16 py-24 max-w-7xl mx-auto relative border-t border-white/5">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          <div className="text-center mb-16">
            <div className="text-[#50e1f9] font-bold text-xs uppercase tracking-widest mb-3">Academic Proof</div>
            <h2 className="font-poppins text-3xl md:text-5xl font-extrabold text-white mb-4">Scholars' Verdict</h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Read how UniVault is redefining the academic experience for students across various disciplines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Testimonial 1 */}
            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 hover:shadow-[0_20px_40px_rgba(106,178,255,0.05)] transition-all duration-300 bg-[#0f1930]/10">
              <p className="text-lg text-slate-300 italic mb-8 leading-relaxed font-light">
                "UniVault transformed my chaotic semester into a structured path to distinction. The predictive analytics are eerily accurate and incredibly helpful."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/15 overflow-hidden bg-white/5 relative">
                  <Image 
                    alt="Elena R." 
                    className="w-full h-full object-cover opacity-90 mix-blend-luminosity" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWu64pS-QX2J1qRPkJsnhMCR81cW39kwHw4Za55i8U52dQy2PEPqHv1ROk28xuDwLaiAv8o4XXcJNITDLok7QnVbRMvQ-3G17A0dXtR8ujUp1HJw8cM7_j0-ywOqp59AOl6teA2hANwAs8Mh2pGuZreQMiPXqLJSdCiltP4BAOBkDyR3AGTyZxXN0XX5xykKj-BxBQb7NS2TKmiSrfIqvG_Q-ZvwL_qJi9egNfboP-elfZfT4ywiUnJuNsE1tr7pRO4LfOAIM5tgCx"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Elena R.</div>
                  <div className="text-xs text-slate-500">Computer Science, Senior</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/5 flex flex-col justify-between hover:border-white/10 hover:shadow-[0_20px_40px_rgba(106,178,255,0.05)] transition-all duration-300 bg-[#0f1930]/10">
              <p className="text-lg text-slate-300 italic mb-8 leading-relaxed font-light">
                "The Luminous Obsidian interface isn't just beautiful; it reduces eye strain during late-night study sessions. The Academic Ledger keeps me sane."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border border-white/15 overflow-hidden bg-white/5 relative">
                  <Image 
                    alt="Marcus T." 
                    className="w-full h-full object-cover opacity-90 mix-blend-luminosity" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-hZsCVJqmugkUcZuTUEICzj6boxkdiGkaKm7OGNDSXLvd9yIfJbz2vpvq60WxYaxnS--4kXi_HNCedgHTHtaBJOOfa6L88tquNFN-9ChKlP2UjXhaJ8AnWT5HKgbAMWPnRCM_TaB7ypb-afGNeB2_vcs9_Igo4ZloIGQC9LBuz1yLoIs89aS13K_MiDF-1RWXU9zN-ETSl-DkSFNAsMMbtkpse1CPioX4BJG5gny-zAToKWkVfZsLTOIGpbYZE8qT0xsac6pXDDZy"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <div className="font-semibold text-white text-sm">Marcus T.</div>
                  <div className="text-xs text-slate-500">Architecture, Junior</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA SIGNUP FORM SECTION */}
        <section className="px-6 md:px-16 py-20 max-w-5xl mx-auto mb-24 relative z-10 border-t border-white/5">
          <div className="bg-[#0f1930]/40 rounded-3xl p-8 md:p-16 border border-white/5 text-center relative overflow-hidden shadow-2xl">
            {/* Glow overlays */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00bcd3]/5 via-transparent to-[#6ab2ff]/10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#50e1f9]/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <h2 className="font-poppins text-3xl md:text-5xl font-extrabold text-white mb-4 relative z-10">
              Initialize Your Vault
            </h2>
            <p className="text-slate-400 mb-10 max-w-xl mx-auto text-sm sm:text-base relative z-10">
              Join thousands of high-performing students managing their academic trajectory with unparalleled precision.
            </p>

            {submitted ? (
              <div className="relative z-10 p-6 rounded-2xl bg-[#50e1f9]/10 border border-[#50e1f9]/20 max-w-lg mx-auto text-center flex flex-col items-center gap-3">
                <CheckCircle2 className="h-10 w-10 text-[#50e1f9]" />
                <div className="font-bold text-white text-lg">Access Request Received</div>
                <p className="text-slate-400 text-sm">
                  We've initialized your placeholder vault. Check your inbox to finalize your credentials.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto relative z-10">
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#060e20]/90 text-white font-medium px-6 py-4 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#50e1f9]/50 focus:shadow-[0_0_15px_rgba(80,225,249,0.3)] transition-all w-full sm:w-auto flex-grow placeholder-slate-500" 
                    placeholder="Enter your academic email"
                    required
                  />
                  <button 
                    type="submit" 
                    className="liquid-gradient text-slate-900 font-bold px-8 py-4 rounded-2xl hover:scale-105 hover:shadow-[0_0_20px_rgba(106,178,255,0.4)] transition-all duration-300 whitespace-nowrap"
                  >
                    Gain Access
                  </button>
                </form>
              </div>
            )}
            
            {/* PlayStore Badge at Footer Section */}
            <div className="mt-8 flex justify-center">
              <a 
                href="https://play.google.com/store/apps/details?id=com.simats.univault" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all font-semibold text-xs tracking-wider uppercase text-slate-300 hover:text-white"
              >
                <Download className="h-4 w-4 text-[#50e1f9]" />
                Get it on Google Play
              </a>
            </div>

          </div>
        </section>

      </main>

      {/* GLOWING MINIMALIST FOOTER */}
      <footer className="w-full bg-[#060e20] bg-gradient-to-t from-[#00bcd3]/10 to-transparent flex flex-col md:flex-row justify-between items-center px-12 md:px-16 py-10 border-t border-white/5 mt-auto gap-6 md:gap-0">
        <Link href="/" className="flex items-center space-x-2 hover:scale-[1.02] transition-transform duration-300">
          <Image src="/images/logo.png" alt="UniVault Logo" width={28} height={28} />
          <span className="font-bold font-poppins text-md text-slate-100 tracking-wide">
            UniVault
          </span>
        </Link>
        <ul className="flex flex-wrap justify-center gap-6 md:gap-8">
          <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Privacy Policy</Link></li>
          <li><Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Terms of Service</Link></li>
          <li><Link href="/about" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">About</Link></li>
          <li><Link href="/contact" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Contact</Link></li>
        </ul>
        <div className="text-xs text-slate-600 font-medium">
          © {new Date().getFullYear()} UniVault. All rights reserved.
        </div>
      </footer>

    </div>
  );
}
