import {
  css,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  styled,
} from '@mui/material';
import React, { useRef } from 'react';
import { atom, useAtom } from 'jotai';
import { atomWithReducer  } from 'jotai/utils';
import { cwdAtom } from '../FileBrowser.atoms';
import { fileBrowser, Object, Folder } from '../fileBrowser';
import ObjectListItem from './ObjectListItem';
import FolderListItem from './FolderListItem';
import { blue } from '@mui/material/colors';
import ItemIcon from './ItemIcon';
import { NewOperation, queueOperationsAtom  } from '../OperationsPanel/OperationsPanel';


const PREFIX = 'FileList';

const classes = {
  root: `${PREFIX}-root`,
  col: `${PREFIX}-col`,
  row: `${PREFIX}-row`,
  selected: `${PREFIX}-selected`,
  dragImageContainer: `${PREFIX}-dragImageContainer`,
  dragImage: `${PREFIX}-dragImage`,
  dragImageIcon: `${PREFIX}-dragImageIcon`,
  dragImageLabel: `${PREFIX}-dragImageLabel`,
};

const Root = styled(List)(() => css`
  .${classes.row} {
    padding: 0;
  }
  .${classes.selected} {
    background-color: ${blue[50]};
    &:hover {
      background-color: ${blue[50]};
    }
  }
  .${classes.col} {
    text-align: center;
    &:first-of-type {
      text-align: left;
    }
    &:last-of-type {
      margin-left: auto;
      text-align: right;
    }
  }

  .${classes.dragImageContainer} {
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    left: -9999px;
    top: -9999px;
  }

  .${classes.dragImage} {
    width: 95%;
    height: 95%;
    background: ${blue[50]};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .${classes.dragImageIcon} {
    position: absolute;
    width: 90%;
    height: 90%;
    z-index: 0;
    transform: translate(5%, 5%);
  }

  .${classes.dragImageLabel} {
    z-index: 1;
    position: relative;
    background: ${blue[900]};
    padding: 2px;
    color: white;
    border: 2px solid white;
    font-weight: bold;
  }
`);

type ItemData = (Folder | Object);

type ItemList = ItemData[];

const folderListAtom = atom<Folder[]>([]);
const objectListAtom = atom<Object[]>([]);
const itemListAtom = atom<ItemList>([]);

const setItemListAtom = atom(
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

const selectedItemListAtom = atomWithReducer<ItemList, SelectItemAction>(
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

const selectionAnchorAtom = atom<ItemData | null>(null);

const onItemClickAtom = atom(
  null,
  (get, set, update: { ev: React.MouseEvent, data: ItemData }) => {
    const { ev, data } = update;
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
)


const FileList: React.FC = () => {
  const [cwd, setCwd] = useAtom(cwdAtom);
  const [, setItemList] = useAtom(setItemListAtom);
  const [selectedItemList, dispatchToSelectedItemList] = useAtom(selectedItemListAtom);
  const [, onItemClick] = useAtom(onItemClickAtom);
  const [, queueOperations] = useAtom(queueOperationsAtom); 
  const dragImgElemRef = useRef<HTMLDivElement | null>(null);
  const cwdParts = cwd.split('/').filter(f => f.length > 0);
  const listObjectsQuery = fileBrowser.useQuery(['ls', {
    prefix: cwd,
  }], {
    onSuccess({ folders = [], objects = [] }) {
      setItemList({ folders, objects });
    }
  });
  const listObjectsResult = listObjectsQuery.data;
  const { folders = [], objects = [] } = listObjectsResult || {};

  const navigate = (directory: string) => {
    dispatchToSelectedItemList({ type: 'reset' });
    setCwd(directory);
  };

  const isSelected = (data: ItemData) => selectedItemList.some((item) => item.id === data.id);
  const handleDragStart = (args: { ev: React.DragEvent, data: ItemData }) => {
    const { ev, data } = args;
    if (selectedItemList.length <= 1 || !isSelected(data)) {
      onItemClick({ ev, data });
    }
    const dragImage = dragImgElemRef.current as HTMLDivElement;
    ev.dataTransfer.setDragImage(dragImage, 10, 10);
  }

  const handleDrop = (args: { data: Folder }) => {
    const { data } = args;
    const operations: NewOperation[] = selectedItemList.map((selectedItem) => {
      return {
        type: 'rename',
        source: selectedItem.id,
        destination: `${data.prefix}${selectedItem.name}${selectedItem.type === 'folder' ? '/' : ''}`,
      }
    });
    queueOperations(operations);
  }

  return (
    <Root className={classes.root} dense>
      <div
        className={classes.dragImageContainer} 
        ref={dragImgElemRef}
      >
        <Paper
         className={classes.dragImage}
         elevation={5}
        >
          {selectedItemList.length > 0 && (
            <div>
              {selectedItemList.slice(0, 8).map((item, i, arr) => {
                const offset = (i + 1 - arr.length);
                return (
                  <ItemIcon 
                    key={i}
                    item={item} 
                    className={classes.dragImageIcon}
                    style={{
                      top: `${offset}px`,
                      left: `${offset}px`,
                    }}
                  />
                );
              })}
            </div>
          )}
          <div className={classes.dragImageLabel}>
            {selectedItemList.length}
          </div>
        </Paper>
      </div>
      <ListItem className={classes.row}>
        <ListItemButton
          onClick={() => navigate(`/${cwdParts.slice(0, -1).join('/')}`)}
          disabled={cwd === '/'}
        >
          <ListItemText>
            ..
          </ListItemText>
        </ListItemButton>
      </ListItem>
      {folders.map((folder) => (
        <FolderListItem
          key={folder.prefix}
          onDoubleClick={() => navigate(`/${folder.prefix}`)}
          data={folder}
          classes={{
            root: classes.row,
            col: classes.col,
            selected: classes.selected,
          }}
          selected={selectedItemList.includes(folder)}
          onClick={onItemClick}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
      {objects.map((obj) => (
        <ObjectListItem 
          data={obj} 
          key={obj.key}
          classes={{
            root: classes.row,
            col: classes.col,
            selected: classes.selected,
          }}
          selected={selectedItemList.includes(obj)}
          onClick={onItemClick}
          onDragStart={handleDragStart}
         />
      ))}
    </Root>
  );
};

export default FileList;
