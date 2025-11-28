
import React, { useState } from 'react';
import { Language, Ong } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Search, ChevronLeft, ChevronRight, Phone, Mail, ArrowRight, ExternalLink } from 'lucide-react';

interface PublicOngsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
  onViewOng?: (ong: Ong) => void;
}

export const PublicOngs: React.FC<PublicOngsProps> = ({ lang, setLang, onBack, onViewOng }) => {
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

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              {t.backToHome}
            </button>
            <div className="flex items-center gap-2">
               <span className="text-2xl">🐾</span>
               <span className="font-bold text-xl text-brand-600">AnyMais</span>
            </div>
            <div className="flex gap-2">
               {Object.values(Language).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => setLang(l)}
                    className={`px-2 py-1 rounded text-xs font-bold uppercase ${lang === l ? 'bg-brand-100 text-brand-700' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {l}
                  </button>
               ))}
            </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
               <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{t.partnerOngs}</h1>
               <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">{t.ongSectionSubtitle}</p>
               
               {/* Search Bar */}
               <div className="max-w-xl mx-auto relative">
                   <input 
                      type="text" 
                      placeholder={t.searchOngsPlaceholder}
                      value={searchQuery}
                      onChange={handleSearch}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-800 bg-white"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               </div>
            </div>

            {displayedOngs.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedOngs.map(ong => (
                        <div key={ong.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
                            {/* Image Section */}
                            <div className="relative h-56 overflow-hidden bg-gray-100">
                                <img 
                                    src={ong.image} 
                                    alt={ong.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-700 flex items-center gap-1">
                                    <MapPin size={12} className="text-brand-500" /> {ong.location}
                                </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-6 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-brand-600 transition-colors">{ong.name}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">{ong.description}</p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between gap-3">
                                    {/* Contact Icons - Subtle until hovered */}
                                    <div className="flex gap-2">
                                        {ong.phone && (
                                            <a 
                                                href={`tel:${ong.phone.replace(/\D/g, '')}`} 
                                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition-colors"
                                                title={ong.phone}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Phone size={14} />
                                            </a>
                                        )}
                                        {ong.email && (
                                            <a 
                                                href={`mailto:${ong.email}`}
                                                className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                title={ong.email}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Mail size={14} />
                                            </a>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Button 
                                        size="sm" 
                                        className="bg-brand-600 hover:bg-brand-700 text-white shadow-md hover:shadow-lg flex items-center gap-2 text-xs font-bold px-4"
                                        onClick={() => onViewOng && onViewOng(ong)}
                                    >
                                        {t.viewOng} <ArrowRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-4 mt-12">
                            <button 
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={20} className="text-gray-600" />
                            </button>
                            <span className="text-sm font-medium text-gray-600">
                                {t.pageOf} {currentPage} / {totalPages}
                            </span>
                            <button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={20} className="text-gray-600" />
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Search className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">{t.noOngsFound}</h3>
                    <button 
                        onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
                        className="mt-4 text-brand-600 font-bold hover:underline"
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
