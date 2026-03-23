import React from 'react';
import { Heart, MapPin, Sparkles, ShieldCheck, Scale, CalendarDays } from 'lucide-react';
import { Language, Pet } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { findCompatibleDatingPets } from '../../../services/adoption/datingMatcher';
import { OptimizedImage } from '../../shared/OptimizedImage';

interface DatingViewProps {
  lang: Language;
  activePet: Pet;
  datingPets: Pet[];
  getDistanceText: (location?: Pet['location']) => string | null;
}

export const DatingView: React.FC<DatingViewProps> = ({ lang, activePet, datingPets, getDistanceText }) => {
  const t = TRANSLATIONS[lang];
  const compatiblePets = findCompatibleDatingPets(activePet, datingPets);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t.dashDating}</h2>
          <p className="text-gray-500 mt-1">
            Matches exibidos com base no pet selecionado: <span className="font-bold text-brand-600">{activePet.name}</span>
          </p>
        </div>
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-4 py-2 text-sm font-bold w-fit">
          <Sparkles size={16} />
          {compatiblePets.length} compat{compatiblePets.length === 1 ? 'ível' : 'íveis'}
        </div>
      </div>

      {compatiblePets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {compatiblePets.map((pet) => (
            <article key={pet.id} className="group rounded-[2rem] overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="relative h-80 overflow-hidden">
                <OptimizedImage src={pet.image} alt={pet.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-extrabold text-gray-900 border border-white/50 shadow-sm">
                  {pet.compatibilityScore}% match
                </div>
                {getDistanceText(pet.location) && (
                  <div className="absolute top-4 right-4 bg-black/55 text-white backdrop-blur-md rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
                    <MapPin size={12} />
                    {getDistanceText(pet.location)}
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <h3 className="text-3xl font-extrabold leading-none">{pet.name}</h3>
                      <p className="text-white/85 mt-2">{pet.breed}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/15 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">
                      <Heart size={22} className="text-pink-200 fill-pink-200" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <p className="text-sm leading-relaxed text-gray-600 min-h-[44px]">{pet.bio}</p>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                      <CalendarDays size={14} />
                      Idade
                    </div>
                    <div className="text-gray-900 font-bold mt-1">{pet.age} anos</div>
                  </div>
                  <div className="rounded-2xl bg-gray-50 border border-gray-100 p-3">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-bold uppercase tracking-wide">
                      <Scale size={14} />
                      Peso
                    </div>
                    <div className="text-gray-900 font-bold mt-1">{pet.weight ? `${pet.weight} kg` : '-'}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {pet.compatibilityReasons.map((reason) => (
                    <span key={reason} className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 border border-green-100 px-3 py-1 text-xs font-bold">
                      <ShieldCheck size={12} />
                      {reason}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 pt-1">
                  <button className="flex-1 rounded-full border border-gray-200 bg-white py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Ignorar
                  </button>
                  <button className="flex-1 rounded-full bg-brand-600 py-3 text-sm font-bold text-white hover:bg-brand-700 transition-colors shadow-lg shadow-brand-100 flex items-center justify-center gap-2">
                    <Heart size={16} className="fill-white" />
                    {t.match}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4">
            <Heart size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Nenhum match compatível agora</h3>
          <p className="text-gray-500 max-w-xl mx-auto">
            Os candidatos precisam ser da mesma espécie, estar disponíveis para namoro e manter uma faixa de idade e porte compatível com {activePet.name}.
          </p>
        </div>
      )}
    </div>
  );
};
