import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Search } from 'lucide-react';

interface PublicOngsProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
}

export const PublicOngs: React.FC<PublicOngsProps> = ({ lang, setLang, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOngs = MOCK_ONGS.filter(ong => 
    ong.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
    ong.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 shadow-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all text-gray-800"
                   />
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               </div>
            </div>

            {filteredOngs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredOngs.map(ong => (
                    <div key={ong.id} className="group bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-56 overflow-hidden bg-gray-100">
                            <img 
                                src={ong.image} 
                                alt={ong.name} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm text-xs font-bold text-gray-700 flex items-center gap-1">
                                <MapPin size={12} /> {ong.location}
                            </div>
                        </div>
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{ong.name}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-4">{ong.description}</p>
                            <Button variant="outline" size="sm" className="w-full" onClick={() => alert("Feature demo: Open ONG details")}>
                                {t.interestBtn}
                            </Button>
                        </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Search className="text-gray-300" size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-600">{t.noOngsFound}</h3>
                    <button 
                        onClick={() => setSearchQuery('')}
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