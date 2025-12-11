

import React, { useState } from 'react';
import { Language, Pet } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Heart, Info, Calendar, Ruler, Phone, Mail, Globe, Share2, ShieldCheck, Building2, Check } from 'lucide-react';

interface AdoptionPetProfileProps {
  lang: Language;
  pet: Pet;
  onBack: () => void;
  onSignup: (pet?: Pet) => void;
}

export const AdoptionPetProfile: React.FC<AdoptionPetProfileProps> = ({ lang, pet, onBack, onSignup }) => {
  const t = TRANSLATIONS[lang];
  const [showCopied, setShowCopied] = useState(false);
  
  // Find associated NGO if any
  const ownerOng = pet.ongId ? MOCK_ONGS.find(o => o.id === pet.ongId) : null;

  const copyToClipboard = () => {
      const url = window.location.href;
      navigator.clipboard.writeText(url)
        .then(() => {
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        })
        .catch(err => console.error("Clipboard write failed", err));
  };

  const handleShare = async () => {
    const url = window.location.href;
    // Ensure URL is http/https to avoid "Invalid URL" error in navigator.share
    const isSecureUrl = url.startsWith('http') || url.startsWith('https');

    if (navigator.share && isSecureUrl) {
      try {
        await navigator.share({
          title: `AnyMais - ${pet.name}`,
          text: `Confira ${pet.name}, um ${pet.breed} para adoção no AnyMais!`,
          url: url,
        });
      } catch (error) {
        console.warn('Error sharing, falling back to clipboard:', error);
        // If share fails (e.g. user cancelled or invalid context), fallback to copy
        copyToClipboard();
      }
    } else {
      // Fallback
      copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 md:py-4 transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors bg-gray-100 hover:bg-brand-50 px-3 py-2 md:px-4 md:py-2 rounded-full"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </button>
            <span className="font-bold text-xl text-brand-600">AnyMais</span>
            <button 
              onClick={handleShare}
              className="relative p-3 text-gray-500 hover:text-brand-600 transition-colors hover:bg-gray-100 rounded-full"
              aria-label="Share"
            >
               {showCopied ? <Check size={22} className="text-green-500" /> : <Share2 size={22} />}
               {showCopied && (
                   <span className="absolute top-full right-0 mt-2 text-xs font-bold bg-green-500 text-white px-2 py-1 rounded shadow-lg whitespace-nowrap animate-fade-in">
                       {t.linkCopied}
                   </span>
               )}
            </button>
        </div>
      </nav>

      <main className="pt-24 pb-24 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
               {/* Left Column: Image & Quick Stats */}
               <div className="space-y-6">
                   <div className="relative h-96 md:h-[500px] rounded-[2rem] overflow-hidden shadow-xl bg-white">
                       <img 
                          src={pet.image} 
                          alt={pet.name} 
                          className="w-full h-full object-cover object-center"
                       />
                       <div className="absolute top-4 right-4">
                           <button className="bg-white/80 backdrop-blur-md p-3 rounded-full text-brand-500 hover:bg-white hover:scale-110 transition-all shadow-sm">
                               <Heart size={24} />
                           </button>
                       </div>
                       <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 md:p-8 pt-24">
                           <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 tracking-tight">{pet.name}</h1>
                           <div className="flex items-center text-white/95 font-medium bg-white/20 backdrop-blur-md w-fit px-4 py-1.5 rounded-full text-sm md:text-base border border-white/10">
                               <MapPin size={16} className="mr-1.5" />
                               {ownerOng ? ownerOng.location : 'São Paulo, SP'}
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-3 gap-3 md:gap-4">
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center h-28 md:h-auto">
                           <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mb-2">
                               <Info size={20} />
                           </div>
                           <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t.breedLabel}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base leading-tight px-1 truncate w-full">{pet.breed}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center h-28 md:h-auto">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                               <Calendar size={20} />
                           </div>
                           <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t.ageLabel}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base leading-tight">{pet.age} anos</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col justify-center items-center h-28 md:h-auto">
                           <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-2">
                               <Ruler size={20} />
                           </div>
                           <p className="text-[10px] md:text-xs text-gray-400 uppercase font-bold tracking-wider mb-0.5">{t.weight}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base leading-tight">{pet.weight || '?'} kg</p>
                       </div>
                   </div>
               </div>

               {/* Right Column: Details & Contact */}
               <div className="space-y-6 md:space-y-8">
                   <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
                       <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                           Sobre o {pet.name}
                       </h2>
                       <p className="text-gray-600 leading-relaxed text-base md:text-lg break-words">
                           "{pet.bio || `${pet.name} é um animal incrível esperando por um lar amoroso.`}"
                       </p>
                       
                       <div className="mt-6 flex flex-wrap gap-3">
                           <span className="px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-100">
                               <ShieldCheck size={14} /> Vacinado
                           </span>
                           <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-blue-100">
                               <ShieldCheck size={14} /> Vermifugado
                           </span>
                           <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1.5 border border-purple-100">
                               <ShieldCheck size={14} /> Castrado
                           </span>
                       </div>
                   </div>

                   {/* Responsible Entity Card */}
                   <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100">
                       <div className="bg-gray-900 p-5 md:p-6 text-white">
                           <h3 className="text-lg font-bold flex items-center gap-2">
                               <Building2 size={20} className="text-brand-400" />
                               Responsável pela Adoção
                           </h3>
                       </div>
                       <div className="p-6 md:p-8">
                           {ownerOng ? (
                               <div className="space-y-6">
                                   <div className="flex items-center gap-4">
                                       <img src={ownerOng.image} alt={ownerOng.name} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl object-cover bg-gray-100 border border-gray-100" />
                                       <div>
                                           <h4 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{ownerOng.name}</h4>
                                           <p className="text-xs md:text-sm text-gray-500 mt-1">{t.partnerOngs}</p>
                                       </div>
                                   </div>
                                   
                                   <div className="space-y-3">
                                       {ownerOng.phone && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                               <Phone size={18} className="text-brand-500 shrink-0" />
                                               <span className="font-medium text-sm md:text-base">{ownerOng.phone}</span>
                                           </div>
                                       )}
                                       {ownerOng.email && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                               <Mail size={18} className="text-brand-500 shrink-0" />
                                               <span className="font-medium text-sm md:text-base break-all">{ownerOng.email}</span>
                                           </div>
                                       )}
                                       {ownerOng.website && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                                               <Globe size={18} className="text-brand-500 shrink-0" />
                                               <span className="font-medium text-sm md:text-base">Website Disponível</span>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ) : (
                               <div className="text-center py-6">
                                   <p className="text-gray-500 italic mb-4 text-sm">Informações de contato disponíveis para usuários cadastrados.</p>
                               </div>
                           )}

                           <div className="mt-8 pt-6 border-t border-gray-100">
                               <Button size="lg" className="w-full text-lg shadow-xl shadow-brand-100 py-4 h-auto" onClick={() => onSignup(pet)}>
                                   {t.interestBtn}
                               </Button>
                               <p className="text-center text-xs text-gray-400 mt-4 leading-normal">
                                   Ao clicar, você manifesta interesse. Se não tiver conta, faremos seu cadastro rápido.
                               </p>
                           </div>
                       </div>
                   </div>
               </div>
           </div>

        </div>
      </main>
    </div>
  );
};