import React, { useCallback, useEffect, useRef } from 'react';
import { Backdrop, BackdropProps, Menu, MenuProps } from '@mui/material';
import { classes as objectClasses } from '../FileList/ObjectListItem';
import { classes as folderClasses } from '../FileList/FolderListItem';
import { 
  onContextMenuAtom,
  onItemClickAtom,
  ItemData,
  folderListAtom,
  objectListAtom,
} from '../FileList/atoms';
import { useAtom } from 'jotai';

type ContextMenuBackdropProps = Omit<
  BackdropProps,
  'invisible'
>;

type Point = {
  x: number,
  y: number,
};

const ContextMenuBackdrop: React.FC<ContextMenuBackdropProps> = (props) => {
  const { children, onClick, ...otherProps } = props;
  const [, onContextMenu] = useAtom(onContextMenuAtom);
  const [, onItemClick] = useAtom(onItemClickAtom);
  const [folderList] = useAtom(folderListAtom);
  const [objectList] = useAtom(objectListAtom);
  const mouseMoveHandleRef = useRef(-1);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const getListItemElementFromPoint = useCallback((point: Point) => {
    const elements = document.elementsFromPoint(point.x, point.y);
    return elements.find((elem) => {
      const isListItem = elem.classList.contains(objectClasses.root) 
      || elem.classList.contains(folderClasses.root);
      return isListItem;
    });
  }, []);

  const getItemDataFromPoint = useCallback((point: Point) => {
    const listItem = getListItemElementFromPoint(point);
    if (!listItem) {
      return;
    }
    const itemType = listItem.getAttribute('data-type') as ItemData['type'];
    const itemIndex = Number.parseInt(listItem.getAttribute('data-index') || '', 10);
    if (Number.isNaN(itemIndex) || !['folder', 'file'].includes(itemType)) {
      return;
    }
    const list = itemType === 'folder' ? folderList : objectList;
    if (itemIndex >= list.length || itemIndex < 0) {
      return;
    }
    const itemData = list[itemIndex];
    return itemData;
  }, [folderList, objectList]);

  const handleContextMenu = (ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault();
    if (onClick) {
      onClick(ev);
    }
    const itemData = getItemDataFromPoint({
      x: ev.clientX,
      y: ev.clientY,
    });
    if (!itemData) {
      return;
    }
    onContextMenu({ ev, data: itemData });
  }

  const handleClick = (ev: React.MouseEvent<HTMLElement>) => {
    if (onClick) {
      onClick(ev);
    }
    const itemData = getItemDataFromPoint({
      x: ev.clientX,
      y: ev.clientY,
    });
    if (!itemData) {
      return;
    }
    onItemClick({ ev, data: itemData });
  };

  const handleMouseMove = (ev: React.MouseEvent<HTMLElement>) => {
    window.cancelAnimationFrame(mouseMoveHandleRef.current);
    mouseMoveHandleRef.current = window.requestAnimationFrame(() => {
      const element = getListItemElementFromPoint({
        x: ev.clientX,
        y: ev.clientY,
      });
      const prevHoveredElement = document.querySelector(
        `.${objectClasses.root}.hovered, .${folderClasses.root}.hovered`
      );
      if (prevHoveredElement === element) {
        return;
      }
      prevHoveredElement?.classList.remove('hovered');
      if (element) {
        element.classList.add('hovered');
        if (rootRef.current) {
          rootRef.current.style.cursor = 'pointer';
        }
        return;
      }
      if (rootRef.current) {
        rootRef.current.style.cursor = 'auto';
      }
    });
  };

  const handleMouseLeave = useCallback(() => {
    const hoveredElement = document.querySelector(
      `.${objectClasses.root}.hovered, .${folderClasses.root}.hovered`
    );
    if (!hoveredElement) {
      return;
    }
    hoveredElement?.classList.remove('hovered');
  }, []);

  useEffect(() => {
    return () => {
      handleMouseLeave();
    };
  }, []);

  return (
    <Backdrop 
      {...otherProps}
      ref={rootRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      sx={{
        backgroundColor: 'transparent',
      }}
    >
      {children}
    </Backdrop>
  );
};

const ContextMenu: React.FC<MenuProps> = (props) => {
  const { components = {}, children, ...otherProps } = props;
  return (
    <Menu
      {...otherProps}
      components={{
        ...components,
        Backdrop: ContextMenuBackdrop,
      }}
    >
      {children}
    </Menu>
  );
};

export default ContextMenu;