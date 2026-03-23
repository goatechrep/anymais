import { MOCK_ADOPTION_PETS, MOCK_DAILY_PHOTOS, MOCK_DATING_PETS, MOCK_ONGS, MOCK_SERVICES } from '../../constants';
import { Ong, Pet, ServiceProvider } from '../../types';
import { db } from '../db';

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export const catalogRepository = {
  listDailyPhotos() {
    return clone(MOCK_DAILY_PHOTOS);
  },
  listPublicAdoptionPets(): Pet[] {
    return clone(MOCK_ADOPTION_PETS);
  },
  listDatingPets(): Pet[] {
    return clone(MOCK_DATING_PETS);
  },
  listServiceProviders(): ServiceProvider[] {
    return clone(MOCK_SERVICES);
  },
  listOngs(): Ong[] {
    const storedOngs = db.ongs.listAll();
    const merged = new Map<string, Ong>();

    [...MOCK_ONGS, ...storedOngs].forEach((ong) => {
      merged.set(ong.id, clone(ong));
    });

    return Array.from(merged.values());
  },
  listPetsByOngId(ongId: string): Pet[] {
    return this.listPublicAdoptionPets().filter((pet) => pet.ongId === ongId);
  },
  getPetById(petId: string): Pet | null {
    return this.listPublicAdoptionPets().find((pet) => pet.id === petId) || null;
  },
  getOngById(ongId: string): Ong | null {
    return this.listOngs().find((ong) => ong.id === ongId) || null;
  },
};
