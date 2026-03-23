const GUEST_FAVORITES_KEY = 'guest_favorites';

export const guestFavoritesService = {
  getAll(): string[] {
    const local = localStorage.getItem(GUEST_FAVORITES_KEY);

    try {
      return local ? JSON.parse(local) : [];
    } catch {
      return [];
    }
  },
  save(favorites: string[]) {
    localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
  },
};
