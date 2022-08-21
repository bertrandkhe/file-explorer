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
import { fileBrowser, Object } from '../fileBrowser.lib';
import { grey } from '@mui/material/colors';
import ItemIcon from './ItemIcon';
import { ViewMode } from './atoms';
import { allowedExtensionsAtom } from '../FileBrowser.atoms';
import { useAtom } from 'jotai';

export type ListItemProps<Data> = {
  data: Data,
  onClick?(args: { ev: React.MouseEvent, data: Data }): void,
  onContextMenu?(args: { ev: React.MouseEvent, data: Data }): void,
  onDoubleClick?(item: Data): void,
  classes?: {
    root?: string,
    col?: string,
    selected?: string,
    listItemButton?: string,
    listItemLabel?: string,
    listItemIcon?: string,
    previewImage?: string,
  },
  selected?: boolean,
  onDragStart?(args: { ev: React.DragEvent, data: Data }): void,
  onDrag?(ev: React.DragEvent): void,
  index: number,
  viewMode: ViewMode,
};

type ObjectListItemProps = ListItemProps<Object>;

const getFileType = (ext: string): string => {
  switch (ext) {
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
      return `File ${ext}`;
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

const Root = styled('div')(() => css`
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
    viewMode,
  } = props;
  const { name, lastModified, size, key } = data;
  const extension = (name.split('.').pop() || '').toLowerCase();
  const [focused, setFocused] = useState(false);
  const [allowedExtensions] = useAtom(allowedExtensionsAtom);

  const isGridViewMode = viewMode === 'grid';
  const isImage = getFileType(extension) === 'Image';
  const expires = dayjs().add(1, 'hour').startOf('hour');
  const now = dayjs();
  const objectUrlQuery = fileBrowser.useQuery(['imagePreviewUrl', {
    key,
    expires: expires.unix(),
    width: 144,
  }], {
    enabled: isImage && isGridViewMode,
    staleTime: expires.diff(now, 'seconds'),
  });
  const objectUrl = objectUrlQuery.data;

  if (allowedExtensions.length > 0 && !allowedExtensions.includes(`.${extension}`)) {
    return null;
  }

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
        className={clsx(classes.listItemButton, propsClasses.listItemButton, {
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
        <ListItemIcon className={propsClasses.listItemIcon}>
          {isImage && isGridViewMode && objectUrl ? (
            <img 
              src={objectUrl} 
              title={name} 
              loading="lazy" 
              className={propsClasses.previewImage}
            />
          ) : (
            <ItemIcon item={data} viewMode={viewMode} />
          )}
        </ListItemIcon>
        <ListItemText>
          <div className={clsx(classes.label, propsClasses.listItemLabel)}>
            <div className={propsClasses.col}>
              {name}
            </div>
            {viewMode === 'list' && (
              <>
                <div className={clsx(classes.lastModified, propsClasses.col)}>
                  {dayjs(lastModified).format('MMM D, YYYY h:mm A	')}
                </div>
                <div className={clsx(classes.size, propsClasses.col)}>
                  {humanSize(size)}
                </div> 
                <div className={propsClasses.col}>
                  {getFileType(extension)}
                </div>
              </>
            )}
          </div>
        </ListItemText>
      </ListItemButton>
    </Root>
  );
};

export default ObjectListItem;
