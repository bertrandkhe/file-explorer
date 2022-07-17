import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Button,
} from '@mui/material';
import { useAtom } from 'jotai';
import { cwdAtom } from './FileBrowser.atoms';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { contextMenuStateAtom  } from './GlobalContextMenu';

const Breadcrumbs: React.FC = () => {
  const [cwd, navigate] = useAtom(cwdAtom);
  const [, dispatchContextMenuState] = useAtom(contextMenuStateAtom);
  const openContextMenu = (anchorEl: Element) => {
    dispatchContextMenuState({
      type: 'open',
      anchorEl,
    });
  };
  const cwdParts = cwd.split('/').filter(f => f.length > 0);
  const head = cwdParts.slice(0, -1);
  const tail = cwdParts.slice(-1);

  return (
    <MuiBreadcrumbs>
      <Button 
        type="button"
        onClick={(e) => {
          if (cwdParts.length > 0) {
            navigate('/');
            return;
          }
          const element = e.currentTarget;
          openContextMenu(element);
        }}
        endIcon={(cwdParts.length === 0 && <ArrowDropDownIcon />)}
      >
        Home
      </Button>
      {head.map((folder, i) => {
        return (
          <Button 
            type="button"
            key={i}
            onClick={() => {
              const newCwd = `/${cwdParts.slice(0, i + 1).join('/')}`;
              navigate(newCwd);
            }}
          >
            {folder}
          </Button>
        );
      })}
      {tail.map((folder, i) => {
        return (
          <Button 
            type="button"
            key={i}
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => {
              const element = e.currentTarget;
              openContextMenu(element);
            }}
          >
            {folder}
          </Button>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
