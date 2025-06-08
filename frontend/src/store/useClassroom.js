import { create } from "zustand";

const useClassroom = create((set) => ({
    updatedClass: null,
    setUpdatedClass: (classData) => {
        set({ updatedClass: classData });
    },
}));

export default useClassroom;