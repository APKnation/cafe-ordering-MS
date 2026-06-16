import React, { useState, useEffect } from 'react';
import { Coffee, ArrowRight, Star, Clock, MapPin, Phone, Globe, Mail, Heart, ChefHat, CupSoda, CakeSlice, X, Check } from 'lucide-react';
import { getAvailableMenuItems, getTables, createReservation } from '../api';

export default function LandingPage({ onStaffLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [availableTables, setAvailableTables] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  
  // Reservation Modal State
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationForm, setReservationForm] = useState({ customerName: '', phone: '', guests: 2, reservationTime: '', specialRequests: '' });
  const [reserving, setReserving] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [reservationError, setReservationError] = useState('');

  const handleReservationSubmit = async (e) => {
    e.preventDefault();
    setReserving(true);
    setReservationError('');
    try {
      await createReservation(reservationForm);
      setReservationSuccess(true);
      setTimeout(() => {
        setShowReservationModal(false);
        setReservationSuccess(false);
        setReservationForm({ customerName: '', phone: '', guests: 2, reservationTime: '', specialRequests: '' });
      }, 3000);
    } catch (err) {
      setReservationError(err.message || 'Failed to reserve table. Please try again.');
    } finally {
      setReserving(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Fetch data
    const fetchPublicData = async () => {
      try {
        const [menuRes, tablesRes] = await Promise.all([
          getAvailableMenuItems().catch(() => []),
          getTables().catch(() => [])
        ]);
        setMenuItems(menuRes.slice(0, 6)); // Show top 6
        setAvailableTables(tablesRes.filter(t => t.isOccupied === false).length);
      } catch (err) {
        console.error('Error fetching public data:', err);
      } finally {
        setLoadingData(false);
      }
    };
    fetchPublicData();

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
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#menu" className="hover:text-white transition-colors">Menu</a>
            <a href="#table" className="hover:text-white transition-colors">Table</a>
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#about" className="hover:text-white transition-colors">About Us</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
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
      <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
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
              <a href="#menu" className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white font-semibold shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 text-center">
                View Our Menu
              </a>
              <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-semibold backdrop-blur-sm transition-all flex flex-col items-center leading-tight">
                <span>Book a Table</span>
                {!loadingData && availableTables > 0 && (
                  <span className="text-xs text-emerald-400 font-medium">({availableTables} available now)</span>
                )}
                {!loadingData && availableTables === 0 && (
                  <span className="text-xs text-rose-400 font-medium">(Currently full)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#0a0f1e] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-slate-400 max-w-xl mx-auto">More than just great coffee. Discover everything we have to offer.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Coffee, title: "Dine-In Experience", desc: "Enjoy our cozy, aesthetic ambiance perfect for work or relaxation." },
              { icon: MapPin, title: "Fast Takeaway", desc: "On the go? Grab your favorite brew and pastries without the wait." },
              { icon: Star, title: "Event Catering", desc: "Elevate your private events with our premium coffee and catering." },
              { icon: Globe, title: "Free Wi-Fi", desc: "Your perfect remote workspace with reliable internet and great coffee." }
            ].map((srv, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6 text-indigo-400">
                  <srv.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{srv.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Categories (Menu) */}
      <section id="menu" className="py-24 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Specialties</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Crafted with passion, served with a smile. Explore our carefully curated selection of beverages and treats.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingData ? (
              // Skeletons
              [...Array(6)].map((_, i) => (
                <div key={i} className="rounded-3xl bg-white/[0.02] border border-white/5 p-6 animate-pulse">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5"></div>
                    <div className="w-16 h-6 rounded-full bg-white/5"></div>
                  </div>
                  <div className="w-3/4 h-5 bg-white/5 rounded mb-3"></div>
                  <div className="w-full h-4 bg-white/5 rounded mb-2"></div>
                  <div className="w-5/6 h-4 bg-white/5 rounded"></div>
                </div>
              ))
            ) : menuItems.length > 0 ? (
              menuItems.map((item) => (
                <div key={item.id} className="group rounded-3xl bg-[#0a0f1e] border border-white/5 p-6 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300 flex flex-col h-full shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      {item.category === 'Drinks' ? <CupSoda className="text-indigo-400" size={24} /> :
                       item.category === 'Pastries' ? <CakeSlice className="text-pink-400" size={24} /> :
                       <Coffee className="text-amber-400" size={24} />}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 text-sm font-bold text-white">
                      ${item.price.toFixed(2)}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-white">{item.name}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                    {item.description}
                  </p>
                  <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                      {item.category}
                    </span>
                    <a href="#table" className="flex items-center gap-1.5 text-sm font-semibold text-white bg-white/5 hover:bg-indigo-500 hover:text-white px-4 py-2 rounded-xl transition-all duration-300">
                      Order <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-500">
                <Coffee size={48} className="mx-auto mb-4 opacity-20" />
                <p>Menu is currently being updated. Check back soon!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section id="table" className="py-24 bg-[#0a0f1e] relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="bg-gradient-to-br from-indigo-900/40 to-blue-900/20 border border-indigo-500/20 rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden">
             {/* Background glow */}
             <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full"></div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
                <div>
                   <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white leading-tight">Secure your perfect spot.</h2>
                   <p className="text-indigo-200 mb-8 text-lg">Whether it's a romantic date, a business meeting, or just some quiet time to read, book a table in advance to ensure the best experience.</p>
                   
                   <div className="flex items-center gap-4 bg-[#0a0f1e]/50 border border-white/10 p-4 rounded-2xl w-max mb-8 backdrop-blur-sm">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-400">
                         <Star size={24} />
                      </div>
                      <div>
                         <p className="text-sm text-slate-400">Current Availability</p>
                         <p className="font-bold text-white text-lg">
                           {!loadingData ? `${availableTables} Tables Ready` : 'Checking...'}
                         </p>
                      </div>
                   </div>

                   <button 
                      onClick={() => setShowReservationModal(true)}
                      className="px-8 py-4 rounded-full bg-white text-[#0a0f1e] font-bold hover:bg-slate-200 transition-colors shadow-xl">
                      Reserve a Table Now
                   </button>
                </div>
                
                <div className="relative hidden md:block">
                   <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 p-6 flex items-center justify-center backdrop-blur-md">
                      <div className="grid grid-cols-3 gap-6 w-full">
                         {/* Visual mock tables */}
                         {[...Array(6)].map((_, i) => (
                            <div key={i} className={`aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${i < (loadingData ? 0 : availableTables) ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-slate-700 bg-slate-800/50'}`}>
                               <div className={`w-8 h-8 rounded-full ${i < (loadingData ? 0 : availableTables) ? 'bg-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.5)]' : 'bg-slate-600/50'}`}></div>
                               <span className={`text-xs font-bold ${i < (loadingData ? 0 : availableTables) ? 'text-emerald-400' : 'text-slate-500'}`}>T-{i+1}</span>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white/[0.02] border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
             <div className="aspect-[4/5] rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-blue-500/20 border border-white/10 p-2 shadow-2xl overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <div className="glass rounded-xl p-4 flex items-center gap-4 backdrop-blur-md border border-white/10 bg-[#0a0f1e]/80">
                  <Coffee className="text-white" size={24} />
                  <div>
                    <p className="text-sm font-semibold text-white">Quality First</p>
                    <p className="text-xs text-slate-300">Handcrafted with precision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Our Story</h2>
            <p className="text-indigo-300 font-medium mb-6 leading-relaxed text-lg">
              Founded with a simple mission: to bring ethically sourced, masterfully roasted coffee to our community. 
            </p>
            <p className="text-slate-400 mb-8 leading-relaxed">
              We believe that a cafe is more than just a place to get a drink. It's a sanctuary, a meeting ground, and a space for inspiration. Every bean we brew and every pastry we bake is crafted with passion, precision, and a deep respect for the art of hospitality.
            </p>
            <div className="flex items-center gap-8">
               <div className="flex flex-col">
                  <span className="text-4xl font-extrabold text-white mb-1">10+</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Coffee Blends</span>
               </div>
               <div className="w-px h-12 bg-white/10"></div>
               <div className="flex flex-col">
                  <span className="text-4xl font-extrabold text-white mb-1">100%</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Organic Beans</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section id="contact" className="py-24 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
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

      {/* Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)' }}>
          <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative">
            <button onClick={() => setShowReservationModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X size={24} />
            </button>
            
            <h3 className="text-2xl font-bold text-white mb-2">Book a Table</h3>
            <p className="text-slate-400 text-sm mb-6">Fill out the details below and we'll secure your spot.</p>
            
            {reservationSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-6 rounded-2xl flex flex-col items-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h4 className="text-xl font-bold mb-2">Reservation Request Sent!</h4>
                <p className="text-sm">We'll review your request and you'll be seated right away when you arrive.</p>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} className="space-y-4">
                {reservationError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                    {reservationError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input type="text" required value={reservationForm.customerName} onChange={e => setReservationForm({...reservationForm, customerName: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                    <input type="tel" required value={reservationForm.phone} onChange={e => setReservationForm({...reservationForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" placeholder="+1 234 567 8900" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Date & Time</label>
                    <input type="datetime-local" required value={reservationForm.reservationTime} onChange={e => setReservationForm({...reservationForm, reservationTime: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Guests</label>
                    <input type="number" min="1" max="20" required value={reservationForm.guests} onChange={e => setReservationForm({...reservationForm, guests: e.target.value === '' ? '' : parseInt(e.target.value)})}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Special Requests (Optional)</label>
                  <textarea value={reservationForm.specialRequests} onChange={e => setReservationForm({...reservationForm, specialRequests: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-indigo-500 h-24 resize-none" placeholder="Window seat, allergies, high chair needed..."></textarea>
                </div>
                
                <button type="submit" disabled={reserving}
                  className="w-full py-4 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-bold transition-colors disabled:opacity-50 mt-2">
                  {reserving ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
