import { atom } from 'jotai';

export const cwdAtom = atom('/');

export const secondaryPanelContentAtom = atom<'operations' | 'uploads' | ''>('');

export const secondaryPanelIsVisibleAtom = atom(
  false,
  (get, set) => {
    const visible = get(secondaryPanelIsVisibleAtom);
    set(secondaryPanelIsVisibleAtom, !visible);
  }
);

export const closeSecondaryPanelAtom = atom(
  null,
  (get, set) => {
    set(secondaryPanelContentAtom, '');
  },
);

// Format must be ['.jpg', '.png', '.jpeg']
export const allowedExtensionsAtom = atom<`.${string}`[]>([]);
