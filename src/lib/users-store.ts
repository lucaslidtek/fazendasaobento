/**
 * Local reactive store for users (mock prototype).
 * Avoids API fetch mutations entirely, preventing interceptor errors.
 */
import { DEMO_USERS } from "./demo-data";

// Mutable in-memory array (singleton)
let _users: any[] = [...DEMO_USERS];
const _listeners: Set<() => void> = new Set();

function notify() {
  _listeners.forEach((fn) => fn());
}

export const usersStore = {
  getAll: () => _users,

  subscribe: (fn: () => void) => {
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  },

  create: (data: any) => {
    const newUser = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      lastActive: "agora",
      bonifications: [],
      absences: 0,
      status: "ativo",
      ...data,
    };
    _users = [..._users, newUser];
    notify();
    return newUser;
  },

  update: (id: number, data: any) => {
    _users = _users.map((u) => (u.id === id ? { ...u, ...data } : u));
    notify();
  },

  delete: (id: number) => {
    _users = _users.filter((u) => u.id !== id);
    notify();
  },

  addAbsence: (id: number) => {
    _users = _users.map((u) =>
      u.id === id ? { ...u, absences: (u.absences ?? 0) + 1 } : u
    );
    notify();
  },

  removeAbsence: (id: number) => {
    _users = _users.map((u) =>
      u.id === id ? { ...u, absences: Math.max(0, (u.absences ?? 0) - 1) } : u
    );
    notify();
  },
};
