import { PlanType, User } from '../../types';
import { db } from '../db';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  image: string;
  plan: PlanType;
}

export const authService = {
  getSession(): User | null {
    return db.auth.getSession();
  },
  login(email: string, password: string) {
    return db.auth.login(email, password);
  },
  signup(input: SignupInput) {
    return db.auth.signup(input);
  },
  logout() {
    db.auth.logout();
  },
  updateUser(user: User) {
    db.auth.updateUser(user);
  },
};
