import { atom } from 'jotai';

export const cwdAtom = atom('/');

export const secondaryPanelContentAtom = atom<'operations' | ''>('');

export const secondaryPanelIsVisibleAtom = atom(
  false,
  (get, set) => {
    const visible = get(secondaryPanelIsVisibleAtom);
    set(secondaryPanelIsVisibleAtom, !visible);
  }
);
