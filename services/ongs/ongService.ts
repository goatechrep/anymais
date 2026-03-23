import { Ong } from '../../types';
import { db } from '../db';
import { catalogRepository } from '../repositories/catalogRepository';

export const ongService = {
  listAll(): Ong[] {
    return catalogRepository.listOngs();
  },
  listByOwner(ownerId: string): Ong[] {
    return db.ongs.listByOwner(ownerId);
  },
  getById(ongId: string): Ong | null {
    return catalogRepository.getOngById(ongId);
  },
  listPetsByOngId(ongId: string) {
    return catalogRepository.listPetsByOngId(ongId);
  },
  create(ong: Omit<Ong, 'id'>) {
    return db.ongs.create(ong);
  },
};
