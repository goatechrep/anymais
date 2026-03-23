import { catalogRepository } from '../repositories/catalogRepository';

export const providerService = {
  listAll() {
    return catalogRepository.listServiceProviders();
  },
};
