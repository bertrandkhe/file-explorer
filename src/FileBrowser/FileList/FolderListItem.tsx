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

export type FolderListItemProps = ListItemProps<Folder> & {
  onDrop(args: { ev: React.DragEvent, data: Folder }): void,
};

const PREFIX = 'FolderListItem';

const classes = {
  root: `${PREFIX}-root`,
  label: `${PREFIX}-label`,
  selected: `${PREFIX}-selected`,
};

const Root = styled(ListItem)(() => css`
  .${classes.label} {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
`);

const FolderListItem: React.FC<FolderListItemProps> = (props) => {
  const {
    data, 
    onClick,
    onDoubleClick,
    classes: propsClasses = {},
    selected,
    onDrag,
    onDragStart,
    onDrop,
  } = props;

  const [state, setState] = useState({
    draggedOver: false,
  });

  return (
    <Root 
      className={clsx(classes.root, propsClasses.root)}
      onDrag={onDrag}
      onDragStart={(ev) => {
        if (onDragStart) {
          onDragStart({ ev, data });
        }
      }}
      onDragOver={(ev) => {
        if (selected) {
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
        setState({
          draggedOver: false,
        });
        onDrop({ ev, data });
      }}
      draggable
    >
      <ListItemButton 
        className={clsx({
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
        <ListItemIcon>
          <ItemIcon item={data} />
        </ListItemIcon>
        <ListItemText>
          <div className={classes.label}>
            <div className={propsClasses.col}>
              {data.name}
            </div>
            <div className={propsClasses.col} />
            <div className={propsClasses.col} />
            <div className={propsClasses.col} >
              Folder
            </div>
          </div>
        </ListItemText>
      </ListItemButton>
    </Root>
  );
};

export default FolderListItem;