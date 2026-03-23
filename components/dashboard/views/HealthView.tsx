import React from 'react';
import { Plus, QrCode, Syringe } from 'lucide-react';
import { Language, Pet } from '../../../types';
import { TRANSLATIONS } from '../../../constants';
import { Button } from '../../Button';

interface HealthViewProps {
  lang: Language;
  activePet: Pet;
  onOpenAddVaccine: () => void;
  onOpenQrModal: () => void;
}

export const HealthView: React.FC<HealthViewProps> = ({ lang, activePet, onOpenAddVaccine, onOpenQrModal }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Syringe className="text-brand-600" /> {t.vaccines} - <span className="text-brand-500">{activePet.name}</span>
        </h2>
        <Button size="sm" variant="outline" onClick={onOpenAddVaccine} className="flex items-center gap-2">
          <Plus size={16} /> <span className="hidden sm:inline">{t.addManual}</span>
        </Button>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl shadow-lg p-6 mb-8 text-white flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <QrCode size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg">{t.qrCodeTitle}</h3>
            <p className="text-white/90 text-sm max-w-md">{t.qrCodeDesc}</p>
          </div>
        </div>
        <Button size="sm" onClick={onOpenQrModal} className="!bg-white !text-blue-600 hover:!bg-blue-50 border-none shadow-sm whitespace-nowrap">
          {t.generateQrBtn}
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
              <tr><th className="px-6 py-3">{t.healthVaccine}</th><th className="px-6 py-3">{t.healthDate}</th><th className="px-6 py-3">{t.healthNextDue}</th><th className="px-6 py-3">{t.healthStatus}</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activePet.vaccines && activePet.vaccines.length > 0 ? (
                activePet.vaccines.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                    <td className="px-6 py-4 text-gray-500">{new Date(v.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-brand-600 font-medium">{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">OK</span></td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">{t.healthNoRecords}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">{t.healthTip}</div>
    </div>
  );
};
