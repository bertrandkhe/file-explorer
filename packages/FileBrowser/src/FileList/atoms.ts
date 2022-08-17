import { atom } from 'jotai';
import { MenuProps } from '@mui/material';
import { atomWithReducer } from 'jotai/utils';
import { Object, Folder } from '../fileBrowser';

export type ItemData = (Folder | Object);

export type ItemList = ItemData[];

export const folderListAtom = atom<Folder[]>([]);
export const objectListAtom = atom<Object[]>([]);
export const itemListAtom = atom<ItemList>([]);

export type ViewMode = 'list' | 'grid';
export const viewModeAtom = atom<ViewMode>('list');


export const setItemListAtom = atom(
  null,
  (get, set, value: { folders: Folder[], objects: Object[] }) => {
    set(folderListAtom, value.folders);
    set(objectListAtom, value.objects);
    set(itemListAtom, [...value.folders, ...value.objects]);
  }
);

type SelectItemAction = {
  type: 'single',
  item: ItemData
} | {
  type: 'add',
  items: ItemData[],
} | {
  type: 'remove',
  item: ItemData,
} | {
  type: 'reset',
} | {
  type: 'set',
  items: ItemData[],
};

export const selectedItemListAtom = atomWithReducer<ItemList, SelectItemAction>(
  [], 
  (value, action) => {
    if (!action) {
      return value;
    }
    switch (action.type) {
      case 'single':
        return [action.item];

      case 'add': {
        const newValue = action.items.filter((item) => {
          return !value.some((selectedItem) => selectedItem.id === item.id);
        });
        return [...value, ...newValue];
      }

      case 'set':
        return [...action.items];

      case 'remove': 
        return value.filter((item) => action.item.id !== item.id);

      case 'reset':
        return [];
    }
    throw new Error('Unsupported action type');
  },
);

export const clearSelectionAtom = atom(
  null,
  (get, set) => {
    set(selectedItemListAtom, {
      type: 'reset',
    });
  }
);

export const clipboardAtom = atom<ItemList>([]);

export const copySelectionToClipboardAtom = atom(
  null,
  (get, set) => {
    const selectedItemList = get(selectedItemListAtom);
    set(clipboardAtom, selectedItemList);
  },
);

export const clearClipboardAtom = atom(
  null,
  (get, set) => {
    set(clipboardAtom, []);
  },
);


const selectionAnchorAtom = atom<ItemData | null>(null);

export const onItemClickAtom = atom(
  null,
  (get, set, update: { ev: React.MouseEvent, data: ItemData }) => {
    const { ev, data } = update;
    ev.preventDefault();
    const selectedItemList = get(selectedItemListAtom);
    const itemList = get(itemListAtom);
    const isSelected = (data: ItemData) => selectedItemList.some((item) => item.id === data.id);
    const getItemIndex = (data: ItemData) => itemList.findIndex((item) => item.id === data.id);
    if (ev.shiftKey) {
      const selectionAnchor = get(selectionAnchorAtom);
      if (!selectionAnchor) {
        set(selectedItemListAtom, { type: 'add', items: [data] });
        set(selectionAnchorAtom, data);
        return;
      }
      const selectionAnchorIndex = getItemIndex(selectionAnchor);
      const selectedItemIndex = getItemIndex(data);
      const range = [selectedItemIndex, selectionAnchorIndex]
        .sort((a, b) => a > b ? 1 : -1);
      const selection = itemList.slice(range[0], range[1] + 1);
      if (ev.ctrlKey) {
        set(selectedItemListAtom, { type: 'add', items: selection });
        return;
      }
      set(selectedItemListAtom, { type: 'set', items: selection });
      return;
    }
    if (ev.ctrlKey) {
      if (isSelected(data)) {
        set(selectedItemListAtom, { type: 'remove', item: data });
        if (selectedItemList.length - 1 === 0) {
          set(selectionAnchorAtom, null);
        }
      } else {
        set(selectedItemListAtom, { type: 'add', items: [data] });
        set(selectionAnchorAtom, data);
      }
      return;
    }

    set(selectedItemListAtom, {
      type: 'single',
      item: data,
    });
    set(selectionAnchorAtom, data);
  }
);

export const contextMenuAnchorPositionAtom = atom<MenuProps['anchorPosition']>(undefined);

export const onContextMenuAtom = atom(
  null,
  (get, set, update: { ev: React.MouseEvent, data: ItemData }) => {
    const { ev, data } = update;
    ev.preventDefault();
    const selectedItemList = get(selectedItemListAtom);
    if (!selectedItemList.includes(data)) {
      set(onItemClickAtom, { ev, data });
    }
    set(contextMenuAnchorPositionAtom, {
      left: ev.clientX,
      top: ev.clientY,
    })
  },
);