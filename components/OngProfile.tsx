
import React, { useState } from 'react';
import { Language, Ong } from '../types';
import { TRANSLATIONS, MOCK_ADOPTION_PETS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Mail, Phone, Globe, Copy, Check, Info, Dog, Cat, Heart, Calendar, Ruler } from 'lucide-react';

interface OngProfileProps {
  lang: Language;
  ong: Ong;
  onBack: () => void;
}

export const OngProfile: React.FC<OngProfileProps> = ({ lang, ong, onBack }) => {
  const t = TRANSLATIONS[lang];
  const [copied, setCopied] = useState(false);

  // Filter pets that belong to this NGO
  const availablePets = MOCK_ADOPTION_PETS.filter(pet => pet.ongId === ong.id);

  const handleCopyPix = () => {
    if (ong.pixKey) {
        navigator.clipboard.writeText(ong.pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInterest = (petName: string) => {
      alert(`Obrigado pelo interesse em ${petName}! A ONG entrará em contato em breve.`);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              {t.backToHome}
            </button>
            <span className="font-bold text-xl text-brand-600">AnyMais</span>
        </div>
      </nav>

      <main className="pt-24 pb-20">
         {/* Hero */}
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-xl">
                <img src={ong.image} alt={ong.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-2 drop-shadow-sm">{ong.name}</h1>
                    <div className="flex items-center gap-2 text-white/90 font-medium">
                        <MapPin size={18} className="text-brand-300" /> {ong.location}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Info & Pets */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 border-l-4 border-brand-500 pl-4">{t.aboutOng}</h2>
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <p className="text-gray-600 text-lg leading-relaxed">{ong.description}</p>
                        </div>
                    </section>
                    
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-brand-500 pl-4">{t.availablePets}</h2>
                            <span className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-bold">{availablePets.length} pets</span>
                        </div>
                        
                        {availablePets.length > 0 ? (
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {availablePets.map(pet => (
                                    <div key={pet.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                        <div className="h-56 relative overflow-hidden">
                                            <img src={pet.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={pet.name} />
                                            <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm text-brand-600">
                                                {pet.type === 'cat' ? <Cat size={20} /> : <Dog size={20} />}
                                            </div>
                                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                                <h3 className="font-bold text-xl text-white">{pet.name}</h3>
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <Info size={14} className="text-brand-500" />
                                                    <span>{pet.breed}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} className="text-brand-500" />
                                                    <span>{pet.age} {t.ageLabel.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                            
                                            <p className="text-gray-600 text-sm line-clamp-2 mb-4 italic bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                "{pet.bio}"
                                            </p>

                                            <Button 
                                                onClick={() => handleInterest(pet.name)}
                                                className="w-full flex items-center justify-center gap-2 font-bold py-3"
                                            >
                                                <Heart size={18} className="fill-white/20" /> {t.interestBtn}
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-12 text-center border border-dashed border-gray-300">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Dog size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 text-lg">{t.noPets}</p>
                                <p className="text-gray-400 text-sm mt-2">Esta ONG não tem pets cadastrados no momento.</p>
                            </div>
                        )}
                    </section>
                </div>

                {/* Right Column: Contact & Donate */}
                <div className="space-y-8">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            {t.contactOng}
                        </h3>
                        <div className="space-y-5">
                            {ong.phone && (
                                <a href={`tel:${ong.phone}`} className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">{t.phone}</p>
                                        <span className="font-medium text-lg">{ong.phone}</span>
                                    </div>
                                </a>
                            )}
                            {ong.email && (
                                <a href={`mailto:${ong.email}`} className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                        <Mail size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-400 font-bold uppercase">{t.email}</p>
                                        <span className="font-medium truncate block">{ong.email}</span>
                                    </div>
                                </a>
                            )}
                            {ong.website && (
                                <a href="#" className="flex items-center gap-4 text-gray-600 group hover:text-brand-600 transition-colors p-3 rounded-xl hover:bg-brand-50">
                                    <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 shrink-0 group-hover:bg-brand-100 transition-colors">
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase">Website</p>
                                        <span className="font-medium">Visitar site</span>
                                    </div>
                                </a>
                            )}
                        </div>

                        <hr className="my-6 border-gray-100" />

                        <div className="bg-brand-700 rounded-2xl shadow-xl text-white p-8 relative overflow-hidden">
                            {/* Removed visual overlay for better readability */}
                            <h3 className="text-xl font-bold mb-3 relative z-10">{t.donateBtn}</h3>
                            <p className="text-white/80 mb-6 text-sm relative z-10">Ajude {ong.name} a continuar salvando vidas. Sua contribuição faz a diferença.</p>
                            
                            {ong.pixKey && (
                                <div className="mb-6 relative z-10">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-200 mb-2 block">Chave Pix</label>
                                    <div className="bg-black/30 rounded-lg p-3 flex items-center justify-between gap-2 border border-white/10 hover:bg-black/40 transition-colors cursor-pointer" onClick={handleCopyPix}>
                                        <span className="font-mono text-sm truncate select-all">{ong.pixKey}</span>
                                        <button className="hover:text-brand-200 transition-colors shrink-0">
                                            {copied ? <Check size={18} className="text-green-300" /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                    {copied && <p className="text-green-300 text-xs mt-1 text-right font-medium animate-pulse">{t.pixCopied}</p>}
                                </div>
                            )}

                            {ong.bankInfo && (
                                <div className="relative z-10">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-200 mb-2 block">{t.bankDetails}</label>
                                    <div className="bg-white/10 rounded-lg p-4 space-y-2 text-sm border border-white/10">
                                        <p className="flex justify-between"><span className="text-brand-100">{t.bankName}:</span> <span className="font-medium">{ong.bankInfo.bank}</span></p>
                                        <p className="flex justify-between"><span className="text-brand-100">{t.agency}:</span> <span className="font-medium">{ong.bankInfo.agency}</span></p>
                                        <p className="flex justify-between"><span className="text-brand-100">{t.account}:</span> <span className="font-medium">{ong.bankInfo.account}</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </main>
    </div>
  );
};
