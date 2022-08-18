import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  css,
} from '@mui/material';
import { Folder } from '../fileBrowser';
import clsx from 'clsx';
import React, { useState } from 'react';
import { ListItemProps } from './ObjectListItem';
import ItemIcon from './ItemIcon';
import { usePermissions } from '../permissions';

export type FolderListItemProps = ListItemProps<Folder> & {
  onDrop?(args: { ev: React.DragEvent, data: Folder }): void,
};

const PREFIX = 'FolderListItem';

export const classes = {
  root: `${PREFIX}-root`,
  label: `${PREFIX}-label`,
  listItemButton: `${PREFIX}-listItemButton`,
  selected: `${PREFIX}-selected`,
};

const Root = styled(ListItem)(() => css`

`);

const FolderListItem: React.FC<FolderListItemProps> = (props) => {
  const {
    data, 
    onClick,
    onDoubleClick,
    onContextMenu,
    classes: propsClasses = {},
    selected,
    onDrag,
    onDragStart,
    onDrop,
    index,
    viewMode,
  } = props;

  const [state, setState] = useState({
    draggedOver: false,
  });

  const permissions = usePermissions();
  return (
    <Root
      data-index={index}
      data-type={data.type} 
      className={clsx(classes.root, propsClasses.root)}
      onContextMenu={(ev) => {
        if (onContextMenu) {
          onContextMenu({ ev, data });
        }
      }}
      onDrag={onDrag}
      onDragStart={(ev) => {
        if (onDragStart) {
          onDragStart({ ev, data });
        }
      }}
      onDragOver={(ev) => {
        if (selected || !permissions.canMove) {
          ev.dataTransfer.dropEffect = 'none';
          return;
        }
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'move';
        setState({
          draggedOver: true,
        });
      }}
      onDragLeave={() => {
        setState({
          draggedOver: false,
        });
      }}
      onDrop={(ev) => {
        if (!permissions.canMove) {
          return;
        }
        setState({
          draggedOver: false,
        });
        if (!onDrop) {
          return;
        }
        onDrop({ ev, data });
      }}
      draggable
    >
      <ListItemButton 
        className={clsx(classes.listItemButton, propsClasses.listItemButton, {
          [propsClasses.selected || classes.selected]: selected || state.draggedOver,
        })}
        onDoubleClick={() => {
          if (onDoubleClick) {
            onDoubleClick(data);
          }
        }}
        onClick={(ev) => {
          if (onClick) {
            onClick({ ev, data });
          }
        }}
        disableRipple
      >
        <ListItemIcon className={propsClasses.listItemIcon}>
          <ItemIcon item={data} />
        </ListItemIcon>
        <ListItemText>
          <div className={clsx(classes.label, propsClasses.listItemLabel)}>
            <div className={propsClasses.col}>
              {data.name}
            </div>
            {viewMode === 'list' && (
              <>
                <div className={propsClasses.col} />
                <div className={propsClasses.col} />
                <div className={propsClasses.col} >
                  Folder
                </div>
              </>
            )}
          </div>
        </ListItemText>
      </ListItemButton>
    </Root>
  );
};

export default FolderListItem;