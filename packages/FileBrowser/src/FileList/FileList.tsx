import {
  css,
  CircularProgress,
  Paper,
  styled,
} from '@mui/material';
import clsx from 'clsx';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { useVirtualizer } from '@tanstack/react-virtual';
import { cwdAtom } from '../FileBrowser.atoms';
import { fileBrowser, Folder } from '../fileBrowser.lib';
import ObjectListItem from './ObjectListItem';
import FolderListItem from './FolderListItem';
import ListItemContextMenu from './ListItemContextMenu';
import { blue } from '@mui/material/colors';
import ItemIcon from './ItemIcon';
import { NewOperation, queueOperationsAtom } from '../OperationsService';
import { secondaryPanelContentAtom } from '../FileBrowser.atoms';
import {
  itemListAtom,
  setItemListAtom,
  selectedItemListAtom,
  onContextMenuAtom,
  onItemClickAtom,
  contextMenuAnchorPositionAtom,
  ItemData,
  viewModeAtom,
} from './atoms';
import { allowedExtensionsAtom } from '../FileBrowser.atoms';

const PREFIX = 'FileList';

const classes = {
  root: `${PREFIX}-root`,
  gridView: `${PREFIX}-grid`,
  listView: `${PREFIX}-list`,
  col: `${PREFIX}-col`,
  backItem: `${PREFIX}-backItem`,
  listItem: `${PREFIX}-listItem`,
  listItemButton: `${PREFIX}-listItemButton`,
  listItemLabel: `${PREFIX}-listItemLabel`,
  listItemIcon: `${PREFIX}-listItemIcon`,
  listItemPreviewImage: `${PREFIX}-listItemPreviewImage`,
  selected: `${PREFIX}-selected`,
  hovered: `${PREFIX}-hovered`,
  dragImageContainer: `${PREFIX}-dragImageContainer`,
  dragImage: `${PREFIX}-dragImage`,
  dragImageIcon: `${PREFIX}-dragImageIcon`,
  dragImageLabel: `${PREFIX}-dragImageLabel`,
  loader: `${PREFIX}-loader`,
};

const gridItemWidth = 144;
const gridItemHeight = 160;
const listItemHeight = 48;

const Root = styled('div')(({ theme }) => css`
  & {
    overflow-y: auto;
    overflow-x: hidden;
  }
  .${classes.listItem} {
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

  .${classes.gridView} {
    display: flex;
    align-content: baseline;
    flex-wrap: wrap;


    .${classes.listItem} {
      width: ${gridItemWidth}px;
      height: ${gridItemHeight}px;
      overflow: hidden;
      align-items: flex-start;
    }

    .${classes.listItemLabel} {
      text-align: center;
      word-break: break-all;
    }

    .${classes.listItemButton} {
      padding: ${theme.spacing(1)};
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .${classes.listItemIcon} {
      min-width: 0;

      .MuiSvgIcon-root {
        width: ${theme.spacing(8)};
        height: ${theme.spacing(8)};
      }
    }

    .${classes.listItemPreviewImage} {
      width: ${theme.spacing(8)};
      height: ${theme.spacing(6)};
      object-fit: scale-down;
    }
  }

  .${classes.listView} {
    .${classes.listItem} {
      width: 100%;
      height: ${listItemHeight}px;
      overflow: hidden;
    }

    .${classes.listItemButton} {
      align-items: flex-start;
    }

    .${classes.listItemIcon} {
      margin-top: ${theme.spacing(0.5)};
      margin-bottom: ${theme.spacing(0.5)};
    }
    .${classes.listItemLabel} {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
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

  .${classes.loader} {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255 255 255 / 0.4)
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
  const [viewMode] = useAtom(viewModeAtom);
  const [, setItemList] = useAtom(setItemListAtom);
  const [itemList] = useAtom(itemListAtom);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [rootDOMRect, setRootDOMRect] = useState<DOMRect | null>(null);
  const [selectedItemList, dispatchToSelectedItemList] = useAtom(selectedItemListAtom);
  const [, onItemClick] = useAtom(onItemClickAtom);
  const [, onContextMenu] = useAtom(onContextMenuAtom);
  const [, queueOperations] = useAtom(queueOperationsAtom);
  const [secondaryPanelContent, setSecondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const [contextMenuAnchorPosition, setContextMenuAnchorPosition] = useAtom(contextMenuAnchorPositionAtom);
  const [allowedExtensions] = useAtom(allowedExtensionsAtom);

  const dragImgElemRef = useRef<HTMLDivElement | null>(null);
  const listObjectsQuery = fileBrowser.useQuery(['ls', {
    prefix,
  }]);
  const listObjectsResult = listObjectsQuery.data;

  useEffect(() => {
    if (!listObjectsResult) {
      return;
    }
    const { folders = [], objects = [] } = listObjectsResult;
    const filteredObjects = allowedExtensions.length > 0
      ? objects.filter((obj) => {
        const ext = obj.name.split('.').pop();
        if (!ext) {
          return false;
        }
        return allowedExtensions.includes(`.${ext}`);
      })
      : objects;
    setItemList({ folders, objects: filteredObjects });
  }, [listObjectsResult]);

  const { folders = [], objects = [], count = 0 } = listObjectsResult || {};
  const navigate = (prefix: string) => {
    dispatchToSelectedItemList({ type: 'reset' });
    setCwd(`/${prefix}`);
  };

  const isSelected = (data: ItemData) => selectedItemList.some((item) => item.id === data.id);
  const handleDragStart = (args: { ev: React.DragEvent, data: ItemData }) => {
    const { ev, data } = args;
    if (selectedItemList.length <= 1 || !isSelected(data)) {
      onItemClick({ ev, data });
    }
    const dragImage = dragImgElemRef.current as HTMLDivElement;
    ev.dataTransfer.setDragImage(dragImage, 10, 10);
  };

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
  };

  useEffect(() => {
    const animationDuration = 215;
    const handleSecondaryPanelContentChange = () => {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          const rootElem = rootRef.current;
          if (!rootElem) {
            return;
          }
          const rect = rootElem.getBoundingClientRect();
          setRootDOMRect(rect);
        });
      }, animationDuration);
    };
    handleSecondaryPanelContentChange();
  }, [secondaryPanelContent]);

  useEffect(() => {
    const rootElem = rootRef.current;
    if (!rootElem) {
      return undefined;
    }
    let timeoutId = -1;
    const rect = rootElem.getBoundingClientRect();
    setRootDOMRect(rect);
    const handleResize = () => {
      window.cancelAnimationFrame(timeoutId);
      timeoutId = window.requestAnimationFrame(() => {
        const rect = rootElem.getBoundingClientRect();
        setRootDOMRect(rect);
      });
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const viewModeClassName = viewMode === 'grid' ? classes.gridView : classes.listView;
  const itemsPerRow = useMemo(() => {
    if (!rootDOMRect) {
      return 1;
    }
    return Math.max(
      viewMode === 'grid'
        ? Math.floor(rootDOMRect.width / gridItemWidth)
        : 1
      , 1
    );
  }, [viewMode, rootDOMRect, itemList])
  const nbRows = Math.ceil(itemList.length / itemsPerRow);
  const rowVirtualizer = useVirtualizer({
    count: nbRows,
    getScrollElement: () => rootRef.current,
    estimateSize: () => viewMode === 'grid' ? gridItemHeight : listItemHeight,
    debug: true,
  });

  return (
    <Root
      className={clsx(classes.root, className)}
      ref={rootRef}
    >
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
      <div
        className={clsx(viewModeClassName)}
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
      {rowVirtualizer.getVirtualItems().map((virtualItem) => {
        const start = virtualItem.index * itemsPerRow;
        const end = (virtualItem.index + 1) * itemsPerRow;
        const items = itemList.slice(start, end);
        return (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: rootDOMRect?.width ? `${Math.floor(rootDOMRect.width - 16)}px` : '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <div style={{ position: 'relative', width: '100%', display: 'flex' }}>
            {items.map((item) => {
              if (item.type === 'folder') {
                const folder = item;
                return (
                  <FolderListItem
                    key={folder.prefix}
                    index={folders.indexOf(folder)}
                    onDoubleClick={() => {
                      navigate(`${folder.prefix}`);
                    }}
                    data={folder}
                    classes={{
                      root: classes.listItem,
                      col: classes.col,
                      selected: classes.selected,
                      listItemButton: classes.listItemButton,
                      listItemLabel: classes.listItemLabel,
                      listItemIcon: classes.listItemIcon,
                    }}
                    selected={selectedItemList.includes(folder)}
                    onClick={onItemClick}
                    onContextMenu={onContextMenu}
                    onDragStart={handleDragStart}
                    onDrop={handleDrop}
                    viewMode={viewMode}
                  />
                )
              }
              const obj = item;
              return (
                <ObjectListItem
                  data={obj}
                  index={objects.indexOf(obj)}
                  key={obj.key}
                  classes={{
                    root: classes.listItem,
                    col: classes.col,
                    selected: classes.selected,
                    listItemButton: classes.listItemButton,
                    listItemLabel: classes.listItemLabel,
                    listItemIcon: classes.listItemIcon,
                    previewImage: classes.listItemPreviewImage,
                  }}
                  selected={selectedItemList.includes(obj)}
                  onClick={onItemClick}
                  onDragStart={handleDragStart}
                  onContextMenu={onContextMenu}
                  viewMode={viewMode}
                />
              )
            })}
            </div>
          </div>
        );
      })}
      </div>
      {count === 0 && listObjectsQuery.isLoading && (
        <div className={classes.loader}>
          <CircularProgress />
        </div>
      )}
    </Root>
  );
};

export default FileList;
