import { useEffect, useState } from 'react';
import { User } from '../types';
import { authService } from '../services/auth/authService';

export const useAppSession = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const session = authService.getSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  return {
    currentUser,
    setCurrentUser,
  };
};
