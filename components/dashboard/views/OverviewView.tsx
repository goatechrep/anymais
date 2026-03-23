import React from 'react';
import { Activity, ArrowRight, Calendar, CheckCircle, Clock, Heart, PawPrint, Syringe } from 'lucide-react';
import { Language, Pet, User, DashboardView } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../Button';
import { OptimizedImage } from '../../shared/OptimizedImage';

interface OverviewStats {
  totalPets: number;
  pendingVaccines: number;
  activeMatches: number;
  upcomingAppointments: Array<{ providerName: string; date: string; time: string }>;
  upcomingVaccineList: Array<{ petName: string; vaccineName: string; daysLeft: number }>;
}

interface OverviewViewProps {
  lang: Language;
  currentUser: User;
  pets: Pet[];
  activePetId: string | null;
  overviewStats: OverviewStats;
  favoritePets: Pet[];
  onSetView: (view: DashboardView) => void;
  onSelectPet: (petId: string) => void;
  onToggleFavorite: (petId: string) => void;
  getDistanceText: (location?: Pet['location']) => string | null;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  lang,
  currentUser,
  pets,
  activePetId,
  overviewStats,
  favoritePets,
  onSetView,
  onSelectPet,
  onToggleFavorite,
  getDistanceText,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{t.overviewTitle}</h2>
          <p className="text-gray-500 mt-1">{t.welcome}, {currentUser.name.split(' ')[0]}!</p>
        </div>
        <Button onClick={() => onSetView('create-pet')} size="sm" className="hidden sm:flex items-center gap-2">
          {t.addNewPet}
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">{t.statsTotalPets}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><PawPrint size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overviewStats.totalPets}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetView('health')}>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">{t.statsVaccinesDue}</span>
            <div className={`p-2 rounded-lg ${overviewStats.pendingVaccines > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              <Syringe size={18} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overviewStats.pendingVaccines}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetView('dating')}>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">{t.statsMatches}</span>
            <div className="p-2 bg-pink-50 text-pink-600 rounded-lg"><Heart size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overviewStats.activeMatches}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-32 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSetView('services')}>
          <div className="flex justify-between items-start">
            <span className="text-gray-500 font-medium text-xs uppercase tracking-wide">{t.statsAppointments}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar size={18} /></div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{overviewStats.upcomingAppointments.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 text-lg">{t.myPets}</h3>
            <button onClick={() => onSetView('create-pet')} className="text-brand-600 text-sm font-medium hover:text-brand-800">{t.addNewPet}</button>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${activePetId === pet.id ? 'border-brand-200 bg-brand-50' : 'border-gray-200 hover:border-brand-200 hover:bg-gray-50'}`}
                onClick={() => { onSelectPet(pet.id); onSetView('profile'); }}
              >
                <OptimizedImage src={pet.image} alt={pet.name} className="w-14 h-14 rounded-full object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 truncate">{pet.name}</h4>
                  <p className="text-sm text-gray-500 truncate">{pet.breed}</p>
                </div>
                <div className="text-gray-400 hover:text-brand-600">
                  <ArrowRight size={18} />
                </div>
              </div>
            ))}
            {pets.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                {t.noPets}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> {t.upcomingEvents}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {overviewStats.upcomingVaccineList.length > 0 ? (
              overviewStats.upcomingVaccineList.map((v, i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${v.daysLeft < 0 ? 'bg-red-500' : v.daysLeft <= 7 ? 'bg-yellow-500' : 'bg-green-500'}`} />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{v.vaccineName} ({v.petName})</p>
                    <p className="text-xs text-gray-500">
                      {v.daysLeft < 0 ? `Atrasada ${Math.abs(v.daysLeft)} dias` : v.daysLeft === 0 ? 'Vence hoje!' : `Vence em ${v.daysLeft} dias`}
                    </p>
                  </div>
                </div>
              ))
            ) : null}

            {overviewStats.upcomingAppointments.length > 0 ? (
              overviewStats.upcomingAppointments.map((apt, i) => (
                <div key={i} className="flex items-start gap-3 pt-2">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{apt.providerName}</p>
                    <p className="text-xs text-gray-500">{new Date(apt.date).toLocaleDateString()} - {apt.time}</p>
                  </div>
                </div>
              ))
            ) : null}

            {overviewStats.upcomingVaccineList.length === 0 && overviewStats.upcomingAppointments.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                <CheckCircle size={24} className="mx-auto mb-2 opacity-50" />
                {t.noUpcomingEvents}
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
            <button onClick={() => onSetView('services')} className="text-sm font-bold text-brand-600 hover:text-brand-800">
              {t.viewDetails}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-brand-600 to-pink-600 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Activity size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.quickActions}</h3>
            <p className="text-white/80 text-sm">Gerencie o dia a dia do seu pet com facilidade.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button size="sm" onClick={() => onSetView('services')} className="!bg-white !text-brand-600 hover:!bg-gray-100 border-none shadow-sm">
            {t.dashServices}
          </Button>
          <Button size="sm" onClick={() => onSetView('health')} className="!bg-brand-900 !text-white hover:!bg-black/20 border-none shadow-sm">
            {t.dashHealth}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">{t.myFavorites}</h3>
        {favoritePets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favoritePets.map((pet) => (
              <div key={pet.id} className="relative group flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50">
                <OptimizedImage src={pet.image} alt={pet.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-gray-900 truncate">{pet.name}</h4>
                    <button onClick={() => onToggleFavorite(pet.id)} className="text-red-500 hover:text-red-700 transition-colors">
                      <Heart size={16} fill="currentColor" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{pet.breed}</p>
                  <div className="flex items-center gap-1 text-xs text-brand-600 font-medium">
                    {getDistanceText(pet.location)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Heart className="mx-auto text-gray-300 mb-2" size={32} />
            <p className="text-gray-500 text-sm">{t.noFavorites}</p>
            <Button variant="ghost" size="sm" className="mt-2 text-brand-600" onClick={() => onSetView('adoption')}>
              {t.landingAdoptionBtn}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
