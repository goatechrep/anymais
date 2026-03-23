import React from 'react';
import { AlertCircle, Camera, CheckCircle, CreditCard, Crosshair, Heart, Loader2, MapPin, Navigation, Pencil } from 'lucide-react';
import { Language, Pet, PlanType, User } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../Button';
import { OptimizedImage } from '../../shared/OptimizedImage';

interface UserProfileViewProps {
  lang: Language;
  currentUser: User;
  editedUser: User;
  isEditingUser: boolean;
  setEditedUser: (user: User) => void;
  setIsEditingUser: (value: boolean) => void;
  saveUser: () => void;
  handleUserPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGetLocation: () => void;
  handleVerifyLocation: () => void;
  isUpdatingLocation: boolean;
  isVerifyingLocation: boolean;
  verificationStatus: 'idle' | 'match' | 'mismatch';
  locationAddress: string;
  getPlanColor: (plan: PlanType) => string;
  getPlanName: (plan: PlanType) => string;
  getPlanDescription: (plan: PlanType) => string;
  setShowPlanModal: (value: boolean) => void;
  pets: Pet[];
  onSelectPet: (petId: string) => void;
  onSetView: (view: 'profile' | 'create-pet' | 'adoption') => void;
  favoritePets: Pet[];
  toggleFavorite: (petId: string) => void;
  getDistanceText: (location?: Pet['location']) => string | null;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  lang,
  currentUser,
  editedUser,
  isEditingUser,
  setEditedUser,
  setIsEditingUser,
  saveUser,
  handleUserPhotoUpload,
  handleGetLocation,
  handleVerifyLocation,
  isUpdatingLocation,
  isVerifyingLocation,
  verificationStatus,
  locationAddress,
  getPlanColor,
  getPlanName,
  getPlanDescription,
  setShowPlanModal,
  pets,
  onSelectPet,
  onSetView,
  favoritePets,
  toggleFavorite,
  getDistanceText,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <h2 className="text-2xl font-bold text-gray-800">{t.userProfile}</h2>
          {!isEditingUser ? (
            <Button variant="outline" size="sm" onClick={() => { setEditedUser(currentUser); setIsEditingUser(true); }}>
              <Pencil size={16} className="mr-2" /> {t.editProfile}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setIsEditingUser(false)}>{t.cancel}</Button>
              <Button onClick={saveUser}>{t.saveChanges}</Button>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <OptimizedImage src={isEditingUser ? editedUser.image : currentUser.image} alt="User" className="w-32 h-32 rounded-full object-cover border-4 border-gray-100" priority />
            {isEditingUser && (
              <label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-600 transition-transform hover:scale-110">
                <Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handleUserPhotoUpload} />
              </label>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">{t.name}</label>
            {isEditingUser ? (
              <input type="text" value={editedUser.name} onChange={e => setEditedUser({ ...editedUser, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" />
            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.name}</p>)}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">{t.email}</label>
            {isEditingUser ? (
              <input type="email" value={editedUser.email} onChange={e => setEditedUser({ ...editedUser, email: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" />
            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.email}</p>)}
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">{t.phone}</label>
            {isEditingUser ? (
              <input type="tel" value={editedUser.phone} onChange={e => setEditedUser({ ...editedUser, phone: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" placeholder="(XX) XXXXX-XXXX" />
            ) : (<p className="text-lg font-medium text-gray-900">{currentUser.phone}</p>)}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-500 mb-2">{t.locationLabel}</label>
            <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:border-brand-200 transition-colors">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
              <div className="relative p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className={`p-4 rounded-full shadow-lg border-4 border-white shrink-0 ${currentUser.location ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    <MapPin size={24} />
                  </div>

                  <div className="text-center sm:text-left flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-gray-900 leading-tight">
                      {locationAddress || (currentUser.location ? t.detecting : t.locationNotFound)}
                    </h4>
                    {currentUser.location ? (
                      <p className="text-xs font-mono text-gray-500 bg-white/50 px-2 py-1 rounded-md inline-block border border-gray-200 mt-2">
                        {currentUser.location.lat.toFixed(5)}, {currentUser.location.lng.toFixed(5)}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-500">{t.locationError}</p>
                    )}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {!isEditingUser && currentUser.location && (
                      <Button onClick={handleVerifyLocation} disabled={isVerifyingLocation} variant="outline" className="shadow-sm flex items-center gap-2 bg-white whitespace-nowrap" title={t.verifyLocationBtn}>
                        {isVerifyingLocation ? <Loader2 className="animate-spin" size={18} /> : <Crosshair size={18} />}
                        <span className="hidden sm:inline">{t.verifyLocationBtn}</span>
                      </Button>
                    )}
                    {isEditingUser && (
                      <Button onClick={handleGetLocation} disabled={isUpdatingLocation} variant="primary" className="shadow-md flex items-center gap-2 whitespace-nowrap">
                        {isUpdatingLocation ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
                        {t.getLocationBtn}
                      </Button>
                    )}
                  </div>
                </div>

                {!isEditingUser && currentUser.location && (verificationStatus === 'match' || verificationStatus === 'mismatch') && (
                  <div className={`mt-4 flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-bold animate-fade-in ${verificationStatus === 'match' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>
                    {verificationStatus === 'match' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    <span>{verificationStatus === 'match' ? t.locationMatch : t.locationMismatch}</span>
                  </div>
                )}
              </div>

              {!isEditingUser && currentUser.location && (
                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider shadow-sm">
                  GPS Ativo
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-start">
          <div><h3 className="text-lg font-bold text-gray-800 mb-2">{t.currentPlan}</h3><span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getPlanColor(currentUser.plan || 'basic')}`}>{getPlanName(currentUser.plan || 'basic')}</span></div>
          <Button variant="outline" size="sm" onClick={() => setShowPlanModal(true)}><CreditCard size={16} className="mr-2" /> {t.upgradePlan}</Button>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-500">{t.planBenefits}: {getPlanDescription(currentUser.plan || 'basic')}</div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">{t.myPets} ({pets.length})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pets.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:border-brand-200 hover:bg-white transition-all" onClick={() => { onSelectPet(p.id); onSetView('profile'); }}>
              <OptimizedImage src={p.image} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
              <div className="overflow-hidden"><p className="font-bold text-gray-900 truncate">{p.name}</p><p className="text-xs text-gray-500 truncate">{p.breed}</p></div>
            </div>
          ))}
          <button onClick={() => onSetView('create-pet')} className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-all">{t.addNewPet}</button>
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
                    <button onClick={() => toggleFavorite(pet.id)} className="text-red-500 hover:text-red-700 transition-colors">
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
