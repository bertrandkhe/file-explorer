import React, { useState } from 'react';
import { 
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  styled,
  css,
} from '@mui/material';
import filesize from 'filesize';
import dayjs from 'dayjs';
import clsx from 'clsx';
import { Object } from '../fileBrowser';
import { grey } from '@mui/material/colors';
import ItemIcon from './ItemIcon'; 

export type ListItemProps<Data> = {
  data: Data,
  onClick?(args: { ev: React.MouseEvent, data: Data }): void,
  onContextMenu?(args: { ev: React.MouseEvent, data: Data }): void,
  onDoubleClick?(item: Data): void,
  classes?: {
    root?: string,
    col?: string,
    selected?: string,
  },
  selected?: boolean,
  onDragStart?(args: { ev: React.DragEvent, data: Data }): void,
  onDrag?(ev: React.DragEvent): void,
  index: number,
};

type ObjectListItemProps = ListItemProps<Object>;

const getFileType = (ext: string): string => {
  switch (ext.toLowerCase()) {
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'webp':
      return 'Image';

    case 'txt':
    case 'doc':
    case 'docx':
    case 'pdf':
    case 'odt':
      return 'Document'

    default:
      return `File ${ext.toUpperCase()}`;
  }
}

const PREFIX = 'ObjectListItem';

export const classes = {
  root: `${PREFIX}-root`,
  label: `${PREFIX}-label`,
  lastModified: `${PREFIX}-lastModified`,
  size: `${PREFIX}-size`,
  lastCol: `${PREFIX}-lastCol`,
  selected: `${PREFIX}-selected`,
  hovered: `${PREFIX}-hovered`,
  listItemButton: `${PREFIX}-listItemButton`,
};

const Root = styled(ListItem)(() => css`
  .${classes.label} {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr;
  }
  .${classes.lastModified} {
    color: ${grey[600]};
  }
`);

const humanSize = filesize.partial({base: 2, standard: "jedec"});

const ObjectListItem: React.FC<ObjectListItemProps> = (props) => {
  const { 
    data, 
    classes: propsClasses = {},
    onClick,
    onDoubleClick,
    onContextMenu,
    onDrag,
    onDragStart,
    selected,
    index,
  } = props;
  const { name, lastModified, size } = data;
  const extension = name.split('.').pop() || '';
  const [focused, setFocused] = useState(false);
  return (
    <Root 
      className={clsx(classes.root, propsClasses.root)}
      data-index={index}
      data-type={data.type}
      onDrag={onDrag}
      onDragStart={(ev) => {
        if (onDragStart) {
          onDragStart({ ev, data });
        }
      }}
      draggable
    >
      <ListItemButton
        className={clsx(classes.listItemButton, {
          [propsClasses.selected || classes.selected]: selected,
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
        onContextMenu={(ev) => {
          if (onContextMenu) {
            onContextMenu({ ev, data });
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
              {name}
            </div>
            <div className={clsx(classes.lastModified, propsClasses.col)}>
              {dayjs(lastModified).format('MMM D, YYYY h:mm A	')}
            </div>
            <div className={clsx(classes.size, propsClasses.col)}>
              {humanSize(size)}
            </div> 
            <div className={propsClasses.col}>
              {getFileType(extension)}
            </div>
          </div>
        </ListItemText>
      </ListItemButton>
    </Root>
  );
};

export default ObjectListItem;
