import { atom } from 'recoil';

export const rWalletModalOpen = atom<boolean>({
  key: 'rWalletModalOpen',
  default: false,
});

export const rCircleSelectorOpen = atom<boolean>({
  key: 'rCircleSelectorOpen',
  default: false,
});

// Use this like a semaphore, add and subtract.
export const rGlobalLoading = atom<number>({
  key: 'rGlobalLoading',
  default: 0,
});

export const rGlobalLoadingText = atom<string>({
  key: 'rGlobalLoadingText',
  default: '',
});
