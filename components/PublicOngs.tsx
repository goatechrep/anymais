

import React, { useState } from 'react';
import { Language, Ong, Coordinates } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Phone, Mail, ArrowRight, ExternalLink, Globe, ChevronDown, Navigation } from 'lucide-react';
import { calculateDistance } from '../utils';

interface PublicOngsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
  onViewOng?: (ong: Ong) => void;
  userCoordinates?: Coordinates;
}

export const PublicOngs: React.FC<PublicOngsProps> = ({ lang, setLang, onBack, onViewOng, userCoordinates }) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const filteredOngs = MOCK_ONGS.filter(ong => 
    ong.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ong.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredOngs.length / itemsPerPage);
  const displayedOngs = filteredOngs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      setCurrentPage(1); // Reset to first page on search
  };

  const changePage = (newPage: number) => {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getDistanceText = (ongCoords?: Coordinates) => {
      if (!userCoordinates || !ongCoords) return null;
      const dist = calculateDistance(userCoordinates.lat, userCoordinates.lng, ongCoords.lat, ongCoords.lng);
      return `${dist} km`;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </button>
            <div className="flex items-center gap-2">
               <span className="text-2xl">🐾</span>
               <span className="font-bold text-xl text-brand-600">AnyMais</span>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Globe size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as Language)}
                        className="pl-8 pr-8 py-1.5 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer hover:bg-gray-50 outline-none uppercase"
                    >
                        {Object.values(Language).map((l) => (
                            <option key={l} value={l}>
                                {l}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
            </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
               <span className="text-brand-600 font-bold tracking-wider uppercase text-sm">{t.partnerOngs}</span>
               <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 mt-2">{t.partnerOngs}</h1>
               <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">{t.ongSectionSubtitle}</p>
               
               {/* Search Bar */}
               <div className="max-w-xl mx-auto relative group">
                   <div className="absolute inset-0 bg-brand-200 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                   <input 
                      type="text" 
                      placeholder={t.searchOngsPlaceholder}
                      value={searchQuery}
                      onChange={handleSearch}
                      className="relative w-full pl-12 pr-4 py-4 rounded-full border border-gray-200 shadow-sm focus:ring-4 focus:ring-brand-100 focus:border-brand-300 outline-none transition-all text-gray-800 bg-white text-lg"
                   />
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={22} />
               </div>
            </div>

            {displayedOngs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {displayedOngs.map(ong => (
                        <div key={ong.id} className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer" onClick={() => onViewOng && onViewOng(ong)}>
                            {/* Image Section */}
                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                <img 
                                    src={ong.image} 
                                    alt={ong.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                
                                {/* Location Badge */}
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-800 flex items-center gap-1.5 border border-white/50">
                                    <MapPin size={12} className="text-brand-500" /> {ong.location}
                                </div>

                                {/* Distance Badge (if coords available) */}
                                {getDistanceText(ong.coordinates) && (
                                     <div className="absolute top-4 left-4 bg-brand-50/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-brand-700 flex items-center gap-1.5 border border-brand-100">
                                        <Navigation size={12} className="fill-brand-700" /> {getDistanceText(ong.coordinates)}
                                    </div>
                                )}
                            </div>

                            {/* Logo Overlay */}
                            <div className="absolute top-44 left-6 w-16 h-16 rounded-2xl bg-white p-1 shadow-lg group-hover:scale-105 transition-transform">
                                <img src={ong.image} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                            </div>

                            {/* Content Section */}
                            <div className="pt-8 px-6 pb-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2 mt-2">{ong.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">{ong.description}</p>
                                
                                {/* Footer Actions */}
                                <div className="pt-5 border-t border-gray-50 flex items-center justify-between gap-3 mt-auto">
                                    {/* Contact Icons */}
                                    <div className="flex gap-2">
                                        {ong.phone && (
                                            <a 
                                                href={`tel:${ong.phone.replace(/\D/g, '')}`} 
                                                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-all shadow-sm"
                                                title={ong.phone}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Phone size={18} />
                                            </a>
                                        )}
                                        {ong.email && (
                                            <a 
                                                href={`mailto:${ong.email}`}
                                                className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm"
                                                title={ong.email}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Mail size={18} />
                                            </a>
                                        )}
                                    </div>

                                    {/* View Button */}
                                    <Button 
                                        size="sm" 
                                        className="bg-gray-900 hover:bg-brand-600 text-white shadow-none hover:shadow-lg hover:shadow-brand-200/50 flex items-center gap-2 text-xs font-bold px-5 rounded-xl transition-all ml-auto"
                                        onClick={() => onViewOng && onViewOng(ong)}
                                    >
                                        {t.viewOng}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-16">
                            <button 
                                onClick={() => changePage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-600 font-bold hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <ChevronLeft size={20} />
                                <span className="hidden sm:inline">{t.prevPage}</span>
                            </button>
                            
                            <span className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                                {t.pageOf} <span className="text-gray-900 font-bold">{currentPage}</span> / {totalPages}
                            </span>
                            
                            <button 
                                onClick={() => changePage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-5 py-3 rounded-full border border-gray-200 bg-white text-gray-600 font-bold hover:bg-gray-50 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                            >
                                <span className="hidden sm:inline">{t.nextPage}</span>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="max-w-md mx-auto text-center py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Search className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t.noOngsFound}</h3>
                    <p className="text-gray-500 mb-8">Tente buscar por outra cidade ou nome de ONG.</p>
                    <button 
                        onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                        className="text-brand-600 font-bold hover:text-brand-700 underline underline-offset-4"
                    >
                        {t.clearFilters}
                    </button>
                </div>
            )}
         </div>
      </main>
    </div>
  );
};
