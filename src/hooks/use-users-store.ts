import { useState, useEffect } from "react";
import { usersStore } from "@/lib/users-store";

/**
 * React hook that subscribes to the local users store and triggers re-renders on changes.
 */
export function useUsersStore() {
  const [users, setUsers] = useState(() => usersStore.getAll());

  useEffect(() => {
    const unsubscribe = usersStore.subscribe(() => {
      setUsers(usersStore.getAll());
    });
    return () => { unsubscribe(); };
  }, []);

  return { users };
}
