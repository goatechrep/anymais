import React from 'react';
import { Heart, Navigation } from 'lucide-react';
import { AdoptionInterest, Language, Pet, User } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../Button';
import { adoptionService } from '../../../services/adoption/adoptionService';
import { OptimizedImage } from '../../shared/OptimizedImage';

interface AdoptionViewProps {
  lang: Language;
  adoptionTab: 'find' | 'interests';
  setAdoptionTab: (tab: 'find' | 'interests') => void;
  adoptionPets: Pet[];
  currentUser: User;
  adoptionInterests: AdoptionInterest[];
  toggleFavorite: (petId: string) => void;
  onViewPet: (pet: Pet) => void;
  getDistanceText: (location?: Pet['location']) => string | null;
}

export const AdoptionView: React.FC<AdoptionViewProps> = ({
  lang,
  adoptionTab,
  setAdoptionTab,
  adoptionPets,
  currentUser,
  adoptionInterests,
  toggleFavorite,
  onViewPet,
  getDistanceText,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{t.dashAdoption}</h2>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setAdoptionTab('find')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adoptionTab === 'find' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.findPetsTab}
          </button>
          <button
            onClick={() => setAdoptionTab('interests')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${adoptionTab === 'interests' ? 'bg-white shadow-sm text-brand-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.myInterestsTab}
          </button>
        </div>
      </div>

      {adoptionTab === 'find' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {adoptionPets.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
              <div className="overflow-hidden h-48 relative">
                <OptimizedImage src={pet.image} alt={pet.name} className="w-full h-full object-cover bg-gray-100 transition-transform duration-500 group-hover:scale-105" />

                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(pet.id); }}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm z-10"
                >
                  <Heart
                    size={20}
                    className={`transition-colors ${currentUser.favorites?.includes(pet.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                  />
                </button>

                {getDistanceText(pet.location) && (
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Navigation size={10} />
                    {getDistanceText(pet.location)}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-500">{pet.breed}</p>
                <p className="text-sm mt-2 text-gray-600 line-clamp-2">{pet.bio}</p>
                <Button
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewPet(pet);
                  }}
                >
                  {t.adoptMe}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {adoptionInterests.length > 0 ? (
            adoptionInterests.map((interest) => {
              const pet = adoptionService.getPetById(interest.petId);
              if (!pet) return null;

              return (
                <div key={interest.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex items-center gap-4">
                  <OptimizedImage src={pet.image} alt={pet.name} className="w-20 h-20 rounded-lg object-cover bg-gray-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{pet.name}</h3>
                        <p className="text-sm text-gray-500">{new Date(interest.date).toLocaleDateString()}</p>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-md border border-yellow-200 uppercase tracking-wider">
                        {interest.status === 'pending' ? t.statusPending : interest.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-500">
                      {t.statusLabel}: <span className="font-medium text-gray-700">{t.statusPending}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onViewPet(pet)}>
                    {t.viewDetails}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <Heart size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium">{t.noInterests}</p>
              <Button variant="ghost" className="mt-2 text-brand-600" onClick={() => setAdoptionTab('find')}>
                {t.findPetsTab}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
