import {
  css,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  styled,
} from '@mui/material';
import clsx from 'clsx';
import React, { useMemo, useRef } from 'react';
import { useAtom } from 'jotai';
import { cwdAtom } from '../FileBrowser.atoms';
import { fileBrowser, Folder } from '../fileBrowser';
import ObjectListItem from './ObjectListItem';
import FolderListItem from './FolderListItem';
import ListItemContextMenu from './ListItemContextMenu';
import { blue } from '@mui/material/colors';
import ItemIcon from './ItemIcon';
import { NewOperation, queueOperationsAtom } from '../OperationsService';
import { secondaryPanelContentAtom } from '../FileBrowser.atoms';
import { 
  setItemListAtom, 
  selectedItemListAtom, 
  onContextMenuAtom,
  onItemClickAtom,
  contextMenuAnchorPositionAtom,
  ItemData,
} from './atoms';

const PREFIX = 'FileList';

const classes = {
  root: `${PREFIX}-root`,
  col: `${PREFIX}-col`,
  row: `${PREFIX}-row`,
  selected: `${PREFIX}-selected`,
  hovered: `${PREFIX}-hovered`,
  dragImageContainer: `${PREFIX}-dragImageContainer`,
  dragImage: `${PREFIX}-dragImage`,
  dragImageIcon: `${PREFIX}-dragImageIcon`,
  dragImageLabel: `${PREFIX}-dragImageLabel`,
};

const Root = styled(List)(() => css`
  height: 100%;
  overflow: auto;
  .${classes.row} {
    padding: 0;
    &.hovered {
      background-color: rgba(0, 0, 0, 0.04);
      &:hover {
        background-color: rgba(0, 0, 0, 0.04);
      }
    }
    .${classes.selected} {
      background-color: ${blue[50]};
      &:hover {
        background-color: ${blue[50]};
      }
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

type FileListProps = {
  className?: string,
};

const FileList: React.FC<FileListProps> = (props) => {
  const { className } = props; 
  const [cwd, setCwd] = useAtom(cwdAtom);
  const prefix = useMemo(() => {
    return cwd.slice(1);
  }, [cwd]);
  const [, setItemList] = useAtom(setItemListAtom);
  const [selectedItemList, dispatchToSelectedItemList] = useAtom(selectedItemListAtom);
  const [, onItemClick] = useAtom(onItemClickAtom);
  const [, onContextMenu] = useAtom(onContextMenuAtom);
  const [, queueOperations] = useAtom(queueOperationsAtom); 
  const [, setSecondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const [contextMenuAnchorPosition, setContextMenuAnchorPosition] = useAtom(contextMenuAnchorPositionAtom);
  const dragImgElemRef = useRef<HTMLDivElement | null>(null);
  const cwdParts = prefix.split('/').filter(f => f.length > 0);
  const listObjectsQuery = fileBrowser.useQuery(['ls', {
    prefix,
  }], {
    onSuccess({ folders = [], objects = [] }) {
      setItemList({ folders, objects });
    }
  });
  const listObjectsResult = listObjectsQuery.data;
  const { folders = [], objects = [], count = 0 } = listObjectsResult || {};

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
    setSecondaryPanelContent('operations');
  }

  return (
    <Root className={clsx(classes.root, className)} dense>
      <ListItemContextMenu 
        anchorReference="anchorPosition"
        anchorPosition={contextMenuAnchorPosition}
        open={Boolean(contextMenuAnchorPosition)}
        onClose={() => setContextMenuAnchorPosition()}
      />
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
      {folders.map((folder, i) => (
        <FolderListItem
          key={folder.prefix}
          index={i}
          onDoubleClick={() => navigate(`/${folder.prefix}`)}
          data={folder}
          classes={{
            root: classes.row,
            col: classes.col,
            selected: classes.selected,
          }}
          selected={selectedItemList.includes(folder)}
          onClick={onItemClick}
          onContextMenu={onContextMenu}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
        />
      ))}
      {objects.map((obj, i) => (
        <ObjectListItem 
          data={obj}
          index={i}
          key={obj.key}
          classes={{
            root: classes.row,
            col: classes.col,
            selected: classes.selected,
          }}
          selected={selectedItemList.includes(obj)}
          onClick={onItemClick}
          onDragStart={handleDragStart}
          onContextMenu={onContextMenu}
         />
      ))}
      {count === 0 && listObjectsQuery.isLoading && (
        <div>Loading</div>
      )}
    </Root>
  );
};

export default FileList;
