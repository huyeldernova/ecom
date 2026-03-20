import { create } from 'zustand';

interface UIStore {
  // ─── Auth Modal ───────────────────────────────────────
  authModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;

  // ─── Cart Drawer ──────────────────────────────────────
  cartDrawerOpen: boolean;
  openCartDrawer: () => void;
  closeCartDrawer: () => void;

  // ─── Search Modal ─────────────────────────────────────
  searchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  // ─── Wishlist Drawer ──────────────────────────────────
  wishlistDrawerOpen: boolean;
  openWishlistDrawer: () => void;
  closeWishlistDrawer: () => void;

  // ─── Category Modal ───────────────────────────────────
  categoryModalOpen: boolean;
  openCategoryModal: () => void;
  closeCategoryModal: () => void;

  // ─── Confirm Modal ────────────────────────────────────
  confirmModalOpen: boolean;
  confirmModalTitle: string;
  confirmModalMessage: string;
  confirmModalOnConfirm: (() => void) | null;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  // ─── Auth Modal ───────────────────────────────────────
  authModalOpen: false,
  authModalTab: 'login',
  openAuthModal: (tab = 'login') =>
    set({ authModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ authModalOpen: false }),

  // ─── Cart Drawer ──────────────────────────────────────
  cartDrawerOpen: false,
  openCartDrawer: () => set({ cartDrawerOpen: true }),
  closeCartDrawer: () => set({ cartDrawerOpen: false }),

  // ─── Search Modal ─────────────────────────────────────
  searchModalOpen: false,
  openSearchModal: () => set({ searchModalOpen: true }),
  closeSearchModal: () => set({ searchModalOpen: false }),

  // ─── Wishlist Drawer ──────────────────────────────────
  wishlistDrawerOpen: false,
  openWishlistDrawer: () => set({ wishlistDrawerOpen: true }),
  closeWishlistDrawer: () => set({ wishlistDrawerOpen: false }),

  // ─── Category Modal ───────────────────────────────────
  categoryModalOpen: false,
  openCategoryModal: () => set({ categoryModalOpen: true }),
  closeCategoryModal: () => set({ categoryModalOpen: false }),

  // ─── Confirm Modal ────────────────────────────────────
  confirmModalOpen: false,
  confirmModalTitle: '',
  confirmModalMessage: '',
  confirmModalOnConfirm: null,
  openConfirmModal: (title, message, onConfirm) =>
    set({
      confirmModalOpen: true,
      confirmModalTitle: title,
      confirmModalMessage: message,
      confirmModalOnConfirm: onConfirm,
    }),
  closeConfirmModal: () =>
    set({
      confirmModalOpen: false,
      confirmModalTitle: '',
      confirmModalMessage: '',
      confirmModalOnConfirm: null,
    }),
}));
