import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../../axios.config";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      

      login: (role, id) => {
        set({ user: { role, id } });
        console.log("Logged in as", role);
      },

      logout: () => {
        set({ user: null, });
        localStorage.removeItem("auth-store");
      },

      checkAuth: async () => {
        try {
          const res = await api.get("/auth/user/");
          if (res?.data) {
            set({ user: res.data });
            console.log("User is authenticated:", res.data);
            return { status: 200 };
          }
        } catch (err) {
          console.warn("User is NOT authenticated");
          set({ user: null });
          return { status: 401 };
        } 
      }
    }),
    {
      name: "auth-store",
      partialize: (state) => ({ user: state.user }) // persist only user
    }
  )
);

export default useAuthStore;
