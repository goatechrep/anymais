

import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatCNPJ, formatPhone, validateCNPJ, validateTaxID } from '../utils';
import { Button } from './Button';
import { ArrowLeft, Building2, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../services/db';

interface OngRegistrationProps {
  lang: Language;
  onBack: () => void;
  prefilledLocation?: string;
}

export const OngRegistration: React.FC<OngRegistrationProps> = ({ lang, onBack, prefilledLocation }) => {
  const t = TRANSLATIONS[lang];
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    location: prefilledLocation || '',
    description: ''
  });
  const [errors, setErrors] = useState<{cnpj?: string}>({});

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Apply mask only if lang is PT (Brazil) or user input is numeric enough to start formatting
    if (lang === Language.PT) {
        setFormData(prev => ({ ...prev, cnpj: formatCNPJ(val) }));
    } else {
        setFormData(prev => ({ ...prev, cnpj: val }));
    }
    if (errors.cnpj) setErrors(prev => ({ ...prev, cnpj: undefined }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, phone: formatPhone(val) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    let isValid = true;
    const newErrors: {cnpj?: string} = {};

    if (lang === Language.PT) {
        if (!validateCNPJ(formData.cnpj)) {
            newErrors.cnpj = t.invalidCnpj;
            isValid = false;
        }
    } else {
        if (!validateTaxID(formData.cnpj)) {
            newErrors.cnpj = t.invalidTaxId;
            isValid = false;
        }
    }

    if (!isValid) {
        setErrors(newErrors);
        return;
    }

    // Determine current user for ownership
    const currentUser = db.auth.getSession();

    // Simulate API call and save to DB
    setTimeout(() => {
        // Create the NGO in the local DB
        db.ongs.create({
            name: formData.name,
            description: formData.description,
            location: formData.location,
            phone: formData.phone,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random&size=200`, // Placeholder image
            ownerId: currentUser ? currentUser.id : undefined // Link to user if logged in
        });

      setSubmitted(true);
    }, 800);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
             <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.ongRegisterSuccess}</h2>
             <p className="text-gray-500 mb-8">{t.ongSectionSubtitle}</p>
             <div className="flex flex-col gap-3">
               <Button onClick={onBack} variant="outline" className="w-full">{t.viewOngsBtn}</Button>
               <Button onClick={onBack} className="w-full">{t.backToHome}</Button>
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <nav className="border-b border-gray-100 py-4 bg-white">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-4">
             <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <span className="font-bold text-xl text-brand-600">AnyMais - {t.ongFormTitle}</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-12">
         <div className="text-center mb-10">
            <div className="w-16 h-16 bg-secondary-500/10 text-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
               <Building2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.ongFormTitle}</h1>
            <p className="text-gray-500">{t.ongFormDesc}</p>
         </div>

         <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.ongName}</label>
                  <input 
                    type="text" 
                    required 
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.ongCnpj}</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        required 
                        placeholder={lang === Language.PT ? "00.000.000/0000-00" : ""}
                        className={`w-full px-4 py-2 bg-white border ${errors.cnpj ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-brand-500'} rounded-lg focus:ring-2 outline-none text-gray-900`}
                        value={formData.cnpj}
                        onChange={handleCnpjChange}
                        maxLength={lang === Language.PT ? 18 : 20}
                    />
                    {errors.cnpj && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                            <AlertCircle size={18} />
                        </div>
                    )}
                  </div>
                  {errors.cnpj && (
                      <p className="mt-1 text-xs text-red-500 font-medium">{errors.cnpj}</p>
                  )}
               </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.phone}</label>
                  <input 
                    type="tel" 
                    required 
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-gray-900"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.locationLabel}</label>
                  <div className="relative">
                    <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none pl-10 text-gray-900"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
               </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.ongDescription}</label>
                <textarea 
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none resize-none text-gray-900"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                ></textarea>
            </div>

            <Button type="submit" size="lg" className="w-full">{t.ongBtn}</Button>
         </form>
      </div>
    </div>
  );
};