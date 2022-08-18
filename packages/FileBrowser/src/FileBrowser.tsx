import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import GlobalContextMenu, { useOpenContextMenu } from './GlobalContextMenu';
import NewFolderDialog from './NewFolderDialog';
import FileBrowserMainMenu from './FileBrowserMainMenu';
import FileList, { clearSelectionAtom, viewModeAtom } from './FileList';
import { css, styled } from '@mui/material';
import { 
  secondaryPanelContentAtom, 
  closeSecondaryPanelAtom, 
  cwdAtom,
  allowedExtensionsAtom,
} from './FileBrowser.atoms';
import { useAtom, Provider, Atom } from 'jotai';
import { FileBrowserContext } from './fileBrowser';
import type { FileBrowserContextValue } from './fileBrowser';
import clsx from 'clsx';
import OperationsPanel from './OperationsPanel';
import OperationsService from './OperationsService';
import UploadsPanel from './UploadsPanel';
import UploadsService from './UploadsService';
import { grantAllPermissions, permissionsAtom, usePermissions } from './permissions';
import { ViewMode } from './FileList/atoms';
import FileBrowserActions from './FileBrowserActions';

const PREFIX = 'FileBrowser';

const classes = {
  root: `${PREFIX}-root`,
  main: `${PREFIX}-main`,
  mainGrid: `${PREFIX}-mainGrid`,
  header: `${PREFIX}-header`,
  fileList: `${PREFIX}-fileList`,
  actions: `${PREFIX}-actions`,
  secondaryPanel: `${PREFIX}-secondaryPanel`,
  secondaryPanelPaper: `${PREFIX}-secondaryPanelPaper`,
  secondaryPanelVisible: `${PREFIX}-secondaryPanelVisible`,
};

const Root = styled('div')(() => css`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
  * {
    box-sizing: border-box;
  }

  .${classes.main} {
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: width 0.2s;
    position: relative;
    padding: 1rem 1.5rem;
  }

  .${classes.mainGrid} {
    height: 100%;
    width: 100%;
    display: grid;
    grid-template: 2.5rem 1fr 3.5rem / 1fr;
    grid-row-gap: 0.25rem;
  }

  .${classes.header} {
    display: grid;
    grid-template: 1fr / auto auto;
  }

  .${classes.secondaryPanel} {
    height: 100%;
    width: 0;
    transition: width 0.2s;
    background: white;
    position: relative;
  }


  &.${classes.secondaryPanelVisible} {
    .${classes.main} {
      width: calc(100% - 350px);
    }
    .${classes.secondaryPanel} {
      width: 350px;
    }
  }
`);


const FileBrowser: React.FC = () => {
  const [secondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const [, closeSecondaryPanel] = useAtom(closeSecondaryPanelAtom);
  const [, clearSelection] = useAtom(clearSelectionAtom)
  const secondaryPanelIsVisible = secondaryPanelContent.length > 0;
  const openContextMenu = useOpenContextMenu();
  return (
    <Root 
      className={clsx(
        classes.root,
        {
          [classes.secondaryPanelVisible]: secondaryPanelIsVisible,
        },
      )}
    >
      <OperationsService />
      <UploadsService />
      <NewFolderDialog />
      <GlobalContextMenu />
      <div 
        className={classes.main}
        onClick={(ev) => {
          if (ev.defaultPrevented) {
            return;
          }
          clearSelection();
        }}
        onContextMenu={(ev) => {
          if (ev.defaultPrevented) {
            return;
          }
          ev.preventDefault();
          const anchorPosition = {
            left: ev.clientX,
            top: ev.clientY,
          };
          openContextMenu({
            anchorReference: 'anchorPosition',
            anchorPosition,
          });
        }}
      >
        <div className={classes.mainGrid}>
          <div className={classes.header}>
            <Breadcrumbs />
            <FileBrowserMainMenu />
          </div>
          <FileList />
          <FileBrowserActions />
        </div>
      </div>
      <div className={classes.secondaryPanel}>
        {secondaryPanelContent === 'operations' && (
          <OperationsPanel onClose={closeSecondaryPanel} />
        )}
        {secondaryPanelContent === 'uploads' && (
          <UploadsPanel onClose={closeSecondaryPanel} />
        )}
      </div>
    </Root>
  );
};

type ScopedFileBrowserProps = FileBrowserContextValue & {
  permissions?: Permissions,
  viewMode?: ViewMode,
  allowedExtensions?: string[],
};

const ScopedFileBrowser: React.FC<ScopedFileBrowserProps> = (props) => {
  return (
    <FileBrowserContext.Provider 
      value={{
        adapter: props.adapter,
        onChooseFiles: props.onChooseFiles,
        onClose: props.onClose,
        portalContainer: props.portalContainer,
      }}
    >
      <Provider
        initialValues={[
          [viewModeAtom, props.viewMode || 'list'],
          [permissionsAtom, props.permissions || grantAllPermissions],
          [cwdAtom, '/'],
          [allowedExtensionsAtom, props.allowedExtensions || []]
        ] as Iterable<[Atom<unknown>, unknown]>}
      >
        <FileBrowser />
      </Provider>
    </FileBrowserContext.Provider>
  )
};


export default ScopedFileBrowser;