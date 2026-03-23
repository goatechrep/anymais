import { Appointment } from '../../types';
import { db } from '../db';

export const appointmentService = {
  create(appointment: Omit<Appointment, 'id'>) {
    return db.appointments.create(appointment);
  },
  listByUser(userId: string) {
    return db.appointments.listByUser(userId);
  },
  updateStatus(appointmentId: string, status: Appointment['status']) {
    db.appointments.updateStatus(appointmentId, status);
  },
};
