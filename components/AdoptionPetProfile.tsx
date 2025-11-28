import React from 'react';
import { Language, Pet } from '../types';
import { TRANSLATIONS, MOCK_ONGS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, MapPin, Heart, Info, Calendar, Ruler, Phone, Mail, Globe, Share2, ShieldCheck, Building2 } from 'lucide-react';

interface AdoptionPetProfileProps {
  lang: Language;
  pet: Pet;
  onBack: () => void;
  onSignup: () => void;
}

export const AdoptionPetProfile: React.FC<AdoptionPetProfileProps> = ({ lang, pet, onBack, onSignup }) => {
  const t = TRANSLATIONS[lang];
  
  // Find associated NGO if any
  const ownerOng = pet.ongId ? MOCK_ONGS.find(o => o.id === pet.ongId) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 transition-all">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-brand-600 font-medium transition-colors bg-gray-100 hover:bg-brand-50 px-4 py-2 rounded-full"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">{t.backToHome}</span>
            </button>
            <span className="font-bold text-xl text-brand-600">AnyMais</span>
            <button className="p-2 text-gray-400 hover:text-brand-600 transition-colors">
               <Share2 size={20} />
            </button>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
               {/* Left Column: Image & Quick Stats */}
               <div className="space-y-6">
                   <div className="relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl bg-white">
                       <img 
                          src={pet.image} 
                          alt={pet.name} 
                          className="w-full h-full object-cover"
                       />
                       <div className="absolute top-4 right-4">
                           <button className="bg-white/80 backdrop-blur p-3 rounded-full text-brand-500 hover:bg-white hover:scale-110 transition-all shadow-sm">
                               <Heart size={24} />
                           </button>
                       </div>
                       <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-8 pt-20">
                           <h1 className="text-4xl font-extrabold text-white mb-2">{pet.name}</h1>
                           <div className="flex items-center text-white/90 font-medium bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full">
                               <MapPin size={16} className="mr-1" />
                               {ownerOng ? ownerOng.location : 'São Paulo, SP'}
                           </div>
                       </div>
                   </div>

                   <div className="grid grid-cols-3 gap-4">
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                           <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-2">
                               <Info size={20} />
                           </div>
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.breedLabel}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base mt-1 truncate">{pet.breed}</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                           <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                               <Calendar size={20} />
                           </div>
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.ageLabel}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base mt-1">{pet.age} anos</p>
                       </div>
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center">
                           <div className="w-10 h-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                               <Ruler size={20} />
                           </div>
                           <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t.weight}</p>
                           <p className="font-bold text-gray-800 text-sm md:text-base mt-1">{pet.weight || '?'} kg</p>
                       </div>
                   </div>
               </div>

               {/* Right Column: Details & Contact */}
               <div className="space-y-8">
                   <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                       <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                           Sobre o {pet.name}
                       </h2>
                       <p className="text-gray-600 leading-relaxed text-lg">
                           "{pet.bio || `${pet.name} é um animal incrível esperando por um lar amoroso.`}"
                       </p>
                       
                       <div className="mt-6 flex flex-wrap gap-2">
                           <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                               <ShieldCheck size={14} /> Vacinado
                           </span>
                           <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1">
                               <ShieldCheck size={14} /> Vermifugado
                           </span>
                           <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center gap-1">
                               <ShieldCheck size={14} /> Castrado
                           </span>
                       </div>
                   </div>

                   {/* Responsible Entity Card */}
                   <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                       <div className="bg-gray-900 p-6 text-white">
                           <h3 className="text-lg font-bold flex items-center gap-2">
                               <Building2 size={20} className="text-brand-400" />
                               Responsável pela Adoção
                           </h3>
                       </div>
                       <div className="p-8">
                           {ownerOng ? (
                               <div className="space-y-6">
                                   <div className="flex items-center gap-4">
                                       <img src={ownerOng.image} alt={ownerOng.name} className="w-16 h-16 rounded-xl object-cover bg-gray-100" />
                                       <div>
                                           <h4 className="text-xl font-bold text-gray-900">{ownerOng.name}</h4>
                                           <p className="text-sm text-gray-500">{t.partnerOngs}</p>
                                       </div>
                                   </div>
                                   
                                   <div className="space-y-3">
                                       {ownerOng.phone && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                               <Phone size={18} className="text-brand-500" />
                                               <span className="font-medium">{ownerOng.phone}</span>
                                           </div>
                                       )}
                                       {ownerOng.email && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                               <Mail size={18} className="text-brand-500" />
                                               <span className="font-medium truncate">{ownerOng.email}</span>
                                           </div>
                                       )}
                                       {ownerOng.website && (
                                           <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                               <Globe size={18} className="text-brand-500" />
                                               <span className="font-medium">Website Disponível</span>
                                           </div>
                                       )}
                                   </div>
                               </div>
                           ) : (
                               <div className="text-center py-6">
                                   <p className="text-gray-500 italic mb-4">Informações de contato disponíveis para usuários cadastrados.</p>
                               </div>
                           )}

                           <div className="mt-8 pt-6 border-t border-gray-100">
                               <Button size="lg" className="w-full text-lg shadow-xl shadow-brand-100" onClick={onSignup}>
                                   {t.interestBtn}
                               </Button>
                               <p className="text-center text-xs text-gray-400 mt-3">
                                   Ao clicar, você precisará criar uma conta gratuita para prosseguir.
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