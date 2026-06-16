import React, { useState, useEffect } from 'react';
import { Coffee, ArrowRight, Star, Clock, MapPin, Phone, Globe, Mail, Heart, ChefHat, CupSoda, CakeSlice } from 'lucide-react';

export default function LandingPage({ onStaffLogin }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-x-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-[#0a0f1e]/80 backdrop-blur-md border-b border-white/10 py-4 shadow-lg' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Coffee size={24} color="white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">Cafe OMS</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#location" className="hover:text-white transition-colors">Location</a>
          </div>

          <button 
            onClick={onStaffLogin}
            className="group px-5 py-2.5 rounded-full text-sm font-semibold bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center gap-2"
          >
            Staff Portal
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-20 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-emerald-500 blur-[100px] animate-pulse" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8">
              <Star size={14} className="fill-indigo-400" />
              <span>Experience the extraordinary</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Elevate your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-400 to-emerald-400">coffee experience.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed">
              Discover artisan coffee, delectable pastries, and a warm atmosphere. Join us for your perfect morning ritual or an afternoon escape.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95">
                View Our Menu
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold backdrop-blur-sm transition-all">
                Book a Table
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section id="menu" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Specialties</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Crafted with passion, served with a smile. Explore our carefully curated selection of beverages and treats.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <div className="group rounded-3xl bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Coffee className="text-indigo-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Artisan Coffee</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Ethically sourced beans roasted to perfection. From rich espressos to creamy lattes, our coffee is designed to delight.
              </p>
              <a href="#" className="text-indigo-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Menu <ArrowRight size={16} />
              </a>
            </div>

            {/* Category 2 */}
            <div className="group rounded-3xl bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CakeSlice className="text-emerald-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Fresh Pastries</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Baked fresh daily in-house. Flaky croissants, decadent cakes, and savory treats perfect for any time of day.
              </p>
              <a href="#" className="text-emerald-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Menu <ArrowRight size={16} />
              </a>
            </div>

            {/* Category 3 */}
            <div className="group rounded-3xl bg-white/[0.02] border border-white/5 p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CupSoda className="text-rose-400" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Signature Drinks</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Refreshing iced beverages, unique smoothies, and seasonal specials crafted to quench your thirst and spark joy.
              </p>
              <a href="#" className="text-rose-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Menu <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="location" className="py-24 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Come visit us</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Located in the heart of the city, our cafe provides a cozy retreat from the hustle and bustle. Whether you're catching up with friends, working remotely, or just need a quiet moment, you'll find your perfect spot here.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Address</h4>
                  <p className="text-slate-400 text-sm">123 Coffee Avenue, Brew City, BC 45678</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Opening Hours</h4>
                  <p className="text-slate-400 text-sm">Mon - Fri: 7:00 AM - 8:00 PM<br/>Sat - Sun: 8:00 AM - 9:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Contact</h4>
                  <p className="text-slate-400 text-sm">+1 (555) 123-4567<br/>hello@cafeoms.com</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            {/* Abstract visual placeholder for an image or map */}
            <div className="aspect-square rounded-3xl bg-gradient-to-br from-slate-800 to-[#0a0f1e] border border-white/10 p-2 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass rounded-xl p-4 flex items-center gap-4 backdrop-blur-md border border-white/10 bg-white/10">
                  <ChefHat className="text-white" size={24} />
                  <div>
                    <p className="text-sm font-semibold">Our Kitchen is Open</p>
                    <p className="text-xs text-slate-300">Serving fresh meals daily</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#050810] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Coffee size={20} className="text-indigo-500" />
            <span className="font-bold text-lg tracking-tight">Cafe OMS</span>
          </div>
          
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Cafe Order Management System. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Globe size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Mail size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
              <Heart size={18} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
