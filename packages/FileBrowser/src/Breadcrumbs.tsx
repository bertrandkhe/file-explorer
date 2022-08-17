import React from 'react';
import {
  Breadcrumbs as MuiBreadcrumbs,
  Button,
} from '@mui/material';
import { useAtom } from 'jotai';
import { cwdAtom } from './FileBrowser.atoms';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useOpenContextMenu, useCanOpenGlobalContextMenu } from './GlobalContextMenu';

const Breadcrumbs: React.FC = () => {
  const [cwd, navigate] = useAtom(cwdAtom);
  const openContextMenu = useOpenContextMenu();
  const canOpenGlobalContextMenu = useCanOpenGlobalContextMenu();
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
          openContextMenu({
            anchorEl: element,
          });
        }}
        endIcon={(cwdParts.length === 0 && canOpenGlobalContextMenu && <ArrowDropDownIcon />)}
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
            endIcon={canOpenGlobalContextMenu ? <ArrowDropDownIcon /> : undefined}
            onClick={(e) => {
              const element = e.currentTarget;
              openContextMenu({ anchorEl: element });
            }}
            disabled={!canOpenGlobalContextMenu}
          >
            {folder}
          </Button>
        );
      })}
    </MuiBreadcrumbs>
  );
};

export default Breadcrumbs;
