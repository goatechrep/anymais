

import React, { useRef, useState, useEffect } from 'react';
import { Language, Pet } from '../types';
import { TRANSLATIONS, MOCK_ADOPTION_PETS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, Heart, Dog, Cat, Info, Play, Pause, ChevronDown, Globe, MapPin, Navigation, Ruler, Check } from 'lucide-react';
import { db } from '../services/db';

interface PublicAdoptionProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
  onSignup: () => void;
  onViewPet?: (pet: Pet) => void;
  onInterest?: (pet: Pet) => void;
}

export const PublicAdoption: React.FC<PublicAdoptionProps> = ({ lang, setLang, onBack, onSignup, onViewPet, onInterest }) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [successId, setSuccessId] = useState<string | null>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<string[]>(() => {
    const session = db.auth.getSession();
    if (session && session.favorites) return session.favorites;
    const local = localStorage.getItem('guest_favorites');
    try {
        return local ? JSON.parse(local) : [];
    } catch {
        return [];
    }
  });

  const toggleFavorite = (e: React.MouseEvent, petId: string) => {
    e.stopPropagation();
    const isFav = favorites.includes(petId);
    let newFavs: string[];
    
    if (isFav) {
        newFavs = favorites.filter(id => id !== petId);
    } else {
        newFavs = [...favorites, petId];
    }
    setFavorites(newFavs);

    const session = db.auth.getSession();
    if (session) {
        // If logged in, update user profile
        const updatedUser = { ...session, favorites: newFavs };
        db.auth.updateUser(updatedUser);
    } else {
        // If guest, save to local storage
        localStorage.setItem('guest_favorites', JSON.stringify(newFavs));
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleInterestClick = (e: React.MouseEvent, pet: Pet) => {
      e.stopPropagation();
      
      // Visual feedback
      setSuccessId(pet.id);
      
      // Execute logic
      if (onInterest) {
          onInterest(pet); 
      } else if (onSignup) {
          onSignup();
      }

      // Reset feedback after delay
      setTimeout(() => {
          setSuccessId(null);
      }, 2000);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <nav className="fixed w-full z-50 bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
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
                 {/* Styled Combobox for Subheader consistency */}
                 <div className="relative group">
                    <Globe size={14} className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-600 transition-colors" />
                    <select
                        value={lang}
                        onChange={(e) => setLang(e.target.value as Language)}
                        className="appearance-none bg-transparent pl-5 pr-4 py-1 text-sm font-bold text-gray-600 hover:text-brand-600 cursor-pointer outline-none transition-colors uppercase"
                    >
                        {Object.values(Language).map((l) => (
                            <option key={l} value={l} className="text-gray-900">
                                {l}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-brand-600 transition-colors" />
                 </div>
            </div>
        </div>
      </nav>

      <main className="pt-24 pb-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t.publicAdoptionTitle}</h1>
               <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t.publicAdoptionSubtitle}</p>
            </div>

            {/* Demo Video Section */}
            <div className="relative max-w-4xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] group">
                <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src="https://cdn.pixabay.com/video/2023/09/24/182069-867966838_large.mp4" 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <button 
                        onClick={togglePlay}
                        className="bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full p-6 transition-all transform hover:scale-110"
                    >
                        {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                    </button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 text-center md:text-left">
                    <p className="text-white/90 text-sm md:text-base font-medium drop-shadow-md">
                        {isPlaying ? t.pauseVideo : t.watchVideo}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               {MOCK_ADOPTION_PETS.map(pet => {
                  const isSuccess = successId === pet.id;
                  return (
                  <div 
                    key={pet.id} 
                    className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col h-full"
                    onClick={() => onViewPet && onViewPet(pet)}
                  >
                      <div className="relative h-60 overflow-hidden bg-gray-100">
                          <img 
                            src={pet.image} 
                            alt={pet.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          
                          {/* Favorite Button */}
                          <button 
                            onClick={(e) => toggleFavorite(e, pet.id)}
                            className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm transition-all hover:scale-110 active:scale-95 group/fav z-10"
                          >
                            <Heart 
                                size={18} 
                                className={`transition-colors ${favorites.includes(pet.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 group-hover/fav:text-red-500'}`} 
                            />
                          </button>

                          {/* Pet Type Icon */}
                          <div className="absolute top-3 right-14 bg-white/95 backdrop-blur-sm p-2 rounded-full shadow-sm text-brand-600">
                              {pet.type === 'cat' ? <Cat size={18} /> : <Dog size={18} />}
                          </div>

                          <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                              <MapPin size={10} />
                              {pet.location ? 'São Paulo' : 'Brasil'}
                          </div>
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10">
                              <h3 className="text-2xl font-bold text-white leading-tight">{pet.name}</h3>
                              <p className="text-white/90 text-sm font-medium opacity-90">{pet.breed}</p>
                          </div>
                      </div>
                      
                      <div className="p-5 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                             <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                <Info size={12} className="text-brand-500" />
                                <span>{pet.age} anos</span>
                             </div>
                             <div className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                <Ruler size={12} className="text-brand-500" />
                                <span>{pet.weight ? `${pet.weight}kg` : '? kg'}</span>
                             </div>
                          </div>

                          <p className="text-gray-500 text-sm line-clamp-2 mb-4 italic flex-grow">
                              "{pet.bio}"
                          </p>
                          
                          <Button 
                            className={`w-full mt-auto flex items-center justify-center gap-2 shadow-md transition-all duration-300 ${
                                isSuccess 
                                ? 'bg-green-500 hover:bg-green-600 border-transparent text-white' 
                                : 'group-hover:bg-brand-700 shadow-brand-100'
                            }`}
                            onClick={(e) => handleInterestClick(e, pet)}
                          >
                              {isSuccess ? (
                                  <Check size={18} />
                              ) : (
                                  <Heart size={16} className="text-pink-200 fill-pink-200" />
                              )}
                              {t.interestBtn}
                          </Button>
                      </div>
                  </div>
               )})}
            </div>

            {/* Empty State / CTA */}
            <div className="mt-24 bg-gray-50 rounded-[2rem] p-12 text-center border border-dashed border-gray-200">
               <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                   <Dog size={32} className="text-gray-400" />
               </div>
               <p className="text-gray-500 mb-2 font-medium">Não encontrou o que procurava?</p>
               <h3 className="text-2xl font-bold text-gray-900 mb-8">Cadastre-se para receber alertas de novos pets!</h3>
               <Button size="lg" onClick={() => onSignup()} className="px-8 shadow-xl shadow-brand-100">{t.createAccount}</Button>
            </div>
         </div>
      </main>
    </div>
  );
};
