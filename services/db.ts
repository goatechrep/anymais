
import { User, Pet, ServiceProvider } from '../types';
import { MOCK_ADOPTION_PETS, MOCK_DATING_PETS, MOCK_SERVICES } from '../constants';

const DB_KEY = 'anymais_db_v1';
const SESSION_KEY = 'anymais_session_v1';

interface Schema {
  users: User[];
  pets: Pet[];
}

// Initial Seed Data (so the app doesn't look empty on first load)
const INITIAL_DATA: Schema = {
  users: [
    {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+55 11 99999-8888',
      image: 'https://i.pravatar.cc/150?img=5',
      plan: 'start',
      password: '123' // In a real app, this would be hashed!
    }
  ],
  pets: [
    {
      id: 'pet-1',
      ownerId: 'u1',
      name: 'Paçoca',
      breed: 'Vira-lata',
      age: 3,
      weight: 12,
      type: 'dog',
      image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
      bio: 'Sou muito brincalhão!',
      vaccines: [
        { id: 'v1', name: 'Raiva (Rabies)', date: '2023-10-10', nextDueDate: '2024-10-10' },
        { id: 'v2', name: 'V10', date: '2023-05-15', nextDueDate: '2024-05-15' }
      ]
    },
    {
      id: 'pet-2',
      ownerId: 'u1',
      name: 'Mimi',
      breed: 'Persa',
      age: 5,
      weight: 4,
      type: 'cat',
      image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
      bio: 'Rainha da casa.',
      vaccines: []
    }
  ]
};

// Helper to load DB
const loadDB = (): Schema => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  return JSON.parse(stored);
};

// Helper to save DB
const saveDB = (data: Schema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
};

export const db = {
  auth: {
    login: (email: string, password: string): User | null => {
      const data = loadDB();
      const user = data.users.find(u => u.email === email && u.password === password);
      if (user) {
        // Legacy support for users without plan (if DB was already created)
        if (!user.plan) user.plan = 'basic';
        localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        return user;
      }
      return null;
    },
    signup: (user: Omit<User, 'id'>): User | null => {
      const data = loadDB();
      if (data.users.find(u => u.email === user.email)) {
        return null; // User already exists
      }
      const newUser = { 
        ...user, 
        id: `u-${Date.now()}`,
        plan: user.plan || 'basic' 
      };
      data.users.push(newUser);
      saveDB(data);
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    },
    logout: () => {
      localStorage.removeItem(SESSION_KEY);
    },
    getSession: (): User | null => {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    },
    updateUser: (updatedUser: User) => {
        const data = loadDB();
        const index = data.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
            // Keep password if not provided in update (simplified logic)
            const existingPassword = data.users[index].password;
            data.users[index] = { ...updatedUser, password: existingPassword };
            saveDB(data);
            // Update session if it's the current user
            localStorage.setItem(SESSION_KEY, JSON.stringify(data.users[index]));
        }
    }
  },
  pets: {
    listByOwner: (ownerId: string): Pet[] => {
      const data = loadDB();
      return data.pets.filter(p => p.ownerId === ownerId);
    },
    create: (pet: Omit<Pet, 'id'>): Pet => {
      const data = loadDB();
      const newPet = { ...pet, id: `pet-${Date.now()}` };
      data.pets.push(newPet);
      saveDB(data);
      return newPet;
    },
    update: (pet: Pet) => {
      const data = loadDB();
      const index = data.pets.findIndex(p => p.id === pet.id);
      if (index !== -1) {
        data.pets[index] = pet;
        saveDB(data);
      }
    },
    delete: (petId: string) => {
      const data = loadDB();
      data.pets = data.pets.filter(p => p.id !== petId);
      saveDB(data);
    }
  }
};
