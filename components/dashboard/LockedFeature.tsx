import React from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { Button } from '../Button';

interface LockedFeatureProps {
  title: string;
  description: string;
  ctaLabel: string;
  onUnlock: () => void;
}

export const LockedFeature: React.FC<LockedFeatureProps> = ({ title, description, ctaLabel, onUnlock }) => (
  <div className="flex flex-col items-center justify-center text-center py-20 px-4">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Lock size={40} className="text-gray-400" />
    </div>
    <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500 mb-8 max-w-md">{description}</p>
    <Button onClick={onUnlock} className="flex items-center gap-2 shadow-lg shadow-brand-100">
      <CreditCard size={18} /> {ctaLabel}
    </Button>
  </div>
);
