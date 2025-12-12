import { User, Pet, ServiceProvider, Ong, Appointment, AdoptionInterest, Vaccine } from '../types';
import { MOCK_ADOPTION_PETS, MOCK_DATING_PETS, MOCK_SERVICES, MOCK_ONGS } from '../constants';

const DB_KEY = 'anymais_db_v1';
const SESSION_KEY = 'anymais_session_v1';

interface Schema {
  users: User[];
  pets: Pet[];
  ongs: Ong[];
  appointments: Appointment[];
  adoptionInterests: AdoptionInterest[];
}

// Initial Seed Data
const INITIAL_DATA: Schema = {
  users: [
    {
      id: 'u1',
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+55 11 99999-8888',
      image: 'https://i.pravatar.cc/150?img=5',
      plan: 'start',
      password: '123', // In a real app, this would be hashed!
      location: { lat: -23.5555, lng: -46.6333 }, // Mock default location (SP)
      favorites: []
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
  ],
  ongs: MOCK_ONGS, // Seed with constant mock ONGs
  appointments: [
      {
          id: 'apt-1',
          userId: 'u1',
          petId: 'pet-1',
          providerId: 's2',
          providerName: 'Banho & Tosa Fofura',
          providerType: 'petshop',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          time: '14:00',
          transport: 'owner',
          status: 'confirmed'
      }
  ],
  adoptionInterests: []
};

// Helper to load DB
const loadDB = (): Schema => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) {
    localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
    return INITIAL_DATA;
  }
  const data = JSON.parse(stored);
  // Migration check: if ongs/appointments missing in stored data, add them
  if (!data.ongs) {
      data.ongs = MOCK_ONGS;
      saveDB(data);
  }
  if (!data.appointments) {
      data.appointments = INITIAL_DATA.appointments;
      saveDB(data);
  }
  if (!data.adoptionInterests) {
      data.adoptionInterests = [];
      saveDB(data);
  }
  return data;
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
        plan: user.plan || 'basic',
        favorites: []
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
      // Also cleanup appointments
      data.appointments = data.appointments.filter(a => a.petId !== petId);
      saveDB(data);
    },
    addVaccine: (petId: string, vaccine: Omit<Vaccine, 'id'>) => {
      const data = loadDB();
      const index = data.pets.findIndex(p => p.id === petId);
      if (index !== -1) {
        if (!data.pets[index].vaccines) {
          data.pets[index].vaccines = [];
        }
        data.pets[index].vaccines?.push({
          id: `vac-${Date.now()}`,
          ...vaccine
        });
        saveDB(data);
      }
    }
  },
  ongs: {
    create: (ong: Omit<Ong, 'id'>): Ong => {
      const data = loadDB();
      const newOng = { ...ong, id: `ong-${Date.now()}` };
      data.ongs.push(newOng);
      saveDB(data);
      return newOng;
    },
    listByOwner: (ownerId: string): Ong[] => {
      const data = loadDB();
      return data.ongs.filter(o => o.ownerId === ownerId);
    },
    listAll: (): Ong[] => {
        const data = loadDB();
        return data.ongs;
    }
  },
  appointments: {
      create: (appointment: Omit<Appointment, 'id'>): Appointment => {
          const data = loadDB();
          const newApt = { ...appointment, id: `apt-${Date.now()}` };
          data.appointments.push(newApt);
          saveDB(data);
          return newApt;
      },
      listByUser: (userId: string): Appointment[] => {
          const data = loadDB();
          return data.appointments.filter(a => a.userId === userId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      },
      updateStatus: (appointmentId: string, status: Appointment['status']) => {
          const data = loadDB();
          const index = data.appointments.findIndex(a => a.id === appointmentId);
          if (index !== -1) {
              data.appointments[index].status = status;
              saveDB(data);
          }
      }
  },
  adoptionInterests: {
      create: (interest: Omit<AdoptionInterest, 'id' | 'date' | 'status'>): AdoptionInterest => {
          const data = loadDB();
          const newInterest: AdoptionInterest = {
              ...interest,
              id: `int-${Date.now()}`,
              date: new Date().toISOString(),
              status: 'pending'
          };
          data.adoptionInterests.push(newInterest);
          saveDB(data);
          return newInterest;
      },
      listByUser: (userId: string): AdoptionInterest[] => {
          const data = loadDB();
          return data.adoptionInterests.filter(i => i.userId === userId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
  }
};