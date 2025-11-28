

import React, { useRef, useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, MOCK_ADOPTION_PETS } from '../constants';
import { Button } from './Button';
import { ArrowLeft, Heart, Dog, Cat, Info, Play, Pause } from 'lucide-react';

interface PublicAdoptionProps {
  lang: Language;
  setLang: (lang: Language) => void;
  onBack: () => void;
}

export const PublicAdoption: React.FC<PublicAdoptionProps> = ({ lang, setLang, onBack }) => {
  const t = TRANSLATIONS[lang];
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

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
               <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{t.publicAdoptionTitle}</h1>
               <p className="text-xl text-gray-500 max-w-2xl mx-auto">{t.publicAdoptionSubtitle}</p>
            </div>

            {/* Demo Video Section */}
            <div className="relative max-w-4xl mx-auto mb-16 rounded-3xl overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] group">
                <video 
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    src="https://videos.pexels.com/video-files/5801170/5801170-hd_1920_1080_24fps.mp4" 
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {MOCK_ADOPTION_PETS.map(pet => (
                  <div key={pet.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-64 overflow-hidden">
                          <img 
                            src={pet.image} 
                            alt={pet.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-sm">
                              {pet.type === 'cat' ? <Cat size={20} className="text-brand-500"/> : <Dog size={20} className="text-brand-500"/>}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 pt-12">
                              <h3 className="text-2xl font-bold text-white mb-1">{pet.name}, {pet.age}</h3>
                              <p className="text-white/90 font-medium">{pet.breed}</p>
                          </div>
                      </div>
                      <div className="p-6">
                          <p className="text-gray-600 mb-6 italic min-h-[3rem]">"{pet.bio}"</p>
                          <div className="flex items-center justify-between gap-4">
                             <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <Info size={12} />
                                <span>Vacinas em dia</span>
                             </div>
                             <div className="text-xs font-bold text-gray-400">ID: #{pet.id}</div>
                          </div>
                          <Button className="w-full mt-6 flex items-center justify-center gap-2 group-hover:bg-brand-700" onClick={() => alert('Feature demo: In a real app, this would open a contact form.')}>
                              <Heart size={18} className="text-pink-200 fill-pink-200" />
                              {t.interestBtn}
                          </Button>
                      </div>
                  </div>
               ))}
            </div>

            {/* Empty State / CTA */}
            <div className="mt-20 bg-gray-50 rounded-3xl p-10 text-center border border-gray-100">
               <p className="text-gray-500 mb-6">Não encontrou o que procurava?</p>
               <h3 className="text-2xl font-bold text-gray-900 mb-6">Cadastre-se para receber alertas de novos pets!</h3>
               <Button onClick={onBack}>{t.createAccount}</Button>
            </div>
         </div>
      </main>
    </div>
  );
};