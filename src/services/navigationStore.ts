import { create } from 'zustand';
import { useNavigate } from 'react-router-dom';

interface NavigationState {
  isNavVisible: boolean;
  setNavVisibility: (visible: boolean) => void;
  toggleNav: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  isNavVisible: false,
  setNavVisibility: (visible: boolean) => set({ isNavVisible: visible }),
  toggleNav: () => set((state) => ({ isNavVisible: !state.isNavVisible })),
}));

// Hook to handle navigation and nav state together
export const useNavigation = () => {
  const navigate = useNavigate();
  const { setNavVisibility } = useNavigationStore();

  const navigateTo = (path: string) => {
    setNavVisibility(false);  // Hide nav on navigation
    navigate(path);
  };

  return { navigateTo };
};
