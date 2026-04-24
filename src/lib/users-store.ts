/**
 * Local reactive store for users (mock prototype).
 * Avoids API fetch mutations entirely, preventing interceptor errors.
 */
import { DEMO_USERS } from "./demo-data";

export interface AbsenceRecord {
  id: number;
  date: string; // ISO date string YYYY-MM-DD
  note?: string;
}

function withAbsenceHistory(user: any): any {
  if (!user.absenceHistory) {
    // Build mock history from existing absences count
    const history: AbsenceRecord[] = [];
    const count = user.absences ?? 0;
    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (count - i) * 7);
      history.push({ id: Date.now() + i, date: d.toISOString().split("T")[0] });
    }
    return { ...user, absenceHistory: history };
  }
  return user;
}

// Mutable in-memory array (singleton) — seed with mock history
let _users: any[] = DEMO_USERS.map(withAbsenceHistory);
const _listeners: Set<() => void> = new Set();

function notify() {
  _listeners.forEach((fn) => fn());
}

export const usersStore = {
  getAll: () => _users,

  subscribe: (fn: () => void): (() => void) => {
    _listeners.add(fn);
    return () => { _listeners.delete(fn); };
  },

  create: (data: any) => {
    const newUser = {
      id: Date.now(),
      createdAt: new Date().toISOString(),
      lastActive: "agora",
      bonifications: [],
      absences: 0,
      absenceHistory: [] as AbsenceRecord[],
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

  addAbsence: (id: number, date: string, note?: string) => {
    const record: AbsenceRecord = { id: Date.now(), date, note };
    _users = _users.map((u) => {
      if (u.id !== id) return u;
      const history: AbsenceRecord[] = [...(u.absenceHistory ?? []), record];
      return { ...u, absences: history.length, absenceHistory: history };
    });
    notify();
  },

  removeAbsence: (userId: number, absenceId: number) => {
    _users = _users.map((u) => {
      if (u.id !== userId) return u;
      const history: AbsenceRecord[] = (u.absenceHistory ?? []).filter(
        (a: AbsenceRecord) => a.id !== absenceId
      );
      return { ...u, absences: history.length, absenceHistory: history };
    });
    notify();
  },
};
