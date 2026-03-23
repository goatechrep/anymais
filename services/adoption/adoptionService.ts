import { Pet } from '../../types';
import { db } from '../db';
import { catalogRepository } from '../repositories/catalogRepository';

export const adoptionService = {
  listPublicPets() {
    return catalogRepository.listPublicAdoptionPets();
  },
  listDatingPets() {
    return catalogRepository.listDatingPets();
  },
  getPetById(petId: string) {
    return catalogRepository.getPetById(petId);
  },
  registerInterest(userId: string, petId: string) {
    return db.adoptionInterests.create({ userId, petId });
  },
  listInterestsByUser(userId: string) {
    return db.adoptionInterests.listByUser(userId);
  },
  listFavoritePets(favoriteIds: string[]): Pet[] {
    const favoriteSet = new Set(favoriteIds);
    return this.listPublicPets().filter((pet) => favoriteSet.has(pet.id));
  },
};
