import React from 'react';
import { AlertCircle, Camera, Heart, Lock, Pencil, Save, Trash2, X } from 'lucide-react';
import { Language, Pet, User } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../Button';
import { OptimizedImage } from '../../shared/OptimizedImage';

interface PetProfileViewProps {
  lang: Language;
  activePet: Pet;
  editedPet: Pet;
  currentUser: User;
  isEditingPet: boolean;
  isGeneratingBio: boolean;
  datingAlert: boolean;
  setEditedPet: (pet: Pet) => void;
  setIsEditingPet: (value: boolean) => void;
  setDatingAlert: (value: boolean) => void;
  savePetChanges: () => void;
  handlePetPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGenerateBio: (target: 'new' | 'edit') => void;
  handleDeleteClick: () => void;
}

export const PetProfileView: React.FC<PetProfileViewProps> = ({
  lang,
  activePet,
  editedPet,
  currentUser,
  isEditingPet,
  isGeneratingBio,
  datingAlert,
  setEditedPet,
  setIsEditingPet,
  setDatingAlert,
  savePetChanges,
  handlePetPhotoUpload,
  handleGenerateBio,
  handleDeleteClick,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100 relative animate-fade-in">
        <div className="absolute top-6 right-6 flex gap-2">
          {!isEditingPet ? (
            <Button variant="outline" size="sm" onClick={() => { setEditedPet(activePet); setIsEditingPet(true); }} className="flex items-center gap-2"><Pencil size={16} /> {t.editProfile}</Button>
          ) : (
            <div className="flex gap-2"><Button variant="ghost" size="sm" onClick={() => { setIsEditingPet(false); setEditedPet(activePet); }} className="text-gray-500 hover:bg-gray-100"><X size={20} /></Button><Button variant="primary" size="sm" onClick={savePetChanges} className="flex items-center gap-2"><Save size={16} /> {t.saveChanges}</Button></div>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-8 items-start mt-4">
          <div className="flex flex-col items-center space-y-4 relative">
            <div className="relative">
              <OptimizedImage src={isEditingPet ? editedPet.image : activePet.image} alt={activePet.name} className="w-40 h-40 rounded-full object-cover border-4 border-brand-100 shadow-sm bg-gray-100" priority />
              {isEditingPet && (<label className="absolute bottom-0 right-0 bg-brand-600 text-white p-2 rounded-full cursor-pointer hover:bg-brand-600 shadow-lg transition-transform hover:scale-110"><Camera size={20} /><input type="file" accept="image/*" className="hidden" onChange={handlePetPhotoUpload} /></label>)}
            </div>
            {isEditingPet && (<p className="text-xs text-gray-500">{t.changePhoto}</p>)}
          </div>
          <div className="flex-1 w-full">
            {!isEditingPet ? (
              <>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{activePet.name}</h2>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.breedLabel}: <span className="font-semibold text-gray-800">{activePet.breed}</span></span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.ageLabel}: <span className="font-semibold text-gray-800">{activePet.age}</span></span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">{t.weight}: <span className="font-semibold text-gray-800">{activePet.weight}kg</span></span>
                </div>
                <div><h3 className="text-lg font-semibold text-gray-800 mb-2">Bio</h3><p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">{activePet.bio}</p></div>
                {activePet.availableForDating && (<div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-sm font-bold border border-pink-100"><Heart size={14} fill="currentColor" />{t.availableForDatingLabel}</div>)}
              </>
            ) : (
              <div className="space-y-4 w-full animate-fade-in">
                <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.petName}</label><input type="text" value={editedPet.name} onChange={(e) => setEditedPet({ ...editedPet, name: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.breedLabel}</label><input type="text" value={editedPet.breed} onChange={(e) => setEditedPet({ ...editedPet, breed: e.target.value })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.ageLabel}</label><input type="number" value={editedPet.age} onChange={(e) => setEditedPet({ ...editedPet, age: parseInt(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                  <div><label className="block text-sm font-bold text-gray-700 mb-1">{t.weight}</label><input type="number" value={editedPet.weight} onChange={(e) => setEditedPet({ ...editedPet, weight: parseFloat(e.target.value) || 0 })} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900" /></div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">{t.petType}</label>
                  <select value={editedPet.type} onChange={e => setEditedPet({ ...editedPet, type: e.target.value as Pet['type'] })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white text-gray-900">
                    <option value="dog">{t.typeDog}</option><option value="cat">{t.typeCat}</option><option value="bird">{t.typeBird}</option><option value="other">{t.typeOther}</option>
                  </select>
                </div>
                <div className="pt-2">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <div className="relative">
                      <input type="checkbox" className="peer sr-only" checked={editedPet.availableForDating || false} onChange={(e) => { if (e.target.checked && currentUser.plan !== 'premium') { setDatingAlert(true); return; } setDatingAlert(false); setEditedPet({ ...editedPet, availableForDating: e.target.checked }); }} />
                      <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-brand-600 transition-colors"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{t.availableForDatingLabel}</span>
                  </label>
                  {datingAlert && (<div className="mt-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm flex items-center animate-fade-in"><AlertCircle size={16} className="mr-2 flex-shrink-0" />{t.datingPlanWarning}</div>)}
                </div>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <label className="block text-sm font-bold text-gray-700">Bio</label>
                    <button onClick={() => handleGenerateBio('edit')} disabled={isGeneratingBio} className={`text-xs font-bold flex items-center gap-1 px-2 py-1 rounded-full transition-all ${currentUser.plan === 'premium' ? 'text-purple-600 bg-purple-50 hover:bg-purple-100' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'}`}>
                      {currentUser.plan === 'premium' ? 'IA' : <Lock size={10} />} {t.generateBio}
                    </button>
                  </div>
                  <textarea value={editedPet.bio} onChange={(e) => setEditedPet({ ...editedPet, bio: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none h-32 bg-white text-gray-900" />
                </div>
                <div className="pt-8 mt-8 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-red-600 mb-2">{t.deletePetWarning}</h3>
                  <button onClick={handleDeleteClick} className="flex items-center gap-2 text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-medium text-sm"><Trash2 size={16} />{t.deletePet}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
