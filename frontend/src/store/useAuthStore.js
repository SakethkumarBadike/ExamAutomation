import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,

      login: (role, id) => {
        set({ user: { role, id } });
        console.log("Logged in as", role);
      },

      logout: () => {
        set({ user: null });
      },

      checkAuth: () => {
        const user=get(state => state.user);
        if (user) {
        
            return true;
            }
        
        return false;
        }
    }),
    {
      name: "auth-store", // name in localStorage
      partialize: (state) => ({ user: state.user }), // only persist 'user'
    }
  )
);

export default useAuthStore;
