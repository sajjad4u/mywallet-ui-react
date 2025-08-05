import { create } from 'zustand';

interface NavigationState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));
