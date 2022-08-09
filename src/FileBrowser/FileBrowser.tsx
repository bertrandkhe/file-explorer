import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import GlobalContextMenu, { useOpenContextMenu } from './GlobalContextMenu';
import NewFolderDialog from './NewFolderDialog';
import FileBrowserMainMenu from './FileBrowserMainMenu';
import FileList, { clearSelectionAtom } from './FileList';
import { css, styled } from '@mui/material';
import { secondaryPanelContentAtom, closeSecondaryPanelAtom } from './FileBrowser.atoms';
import { useAtom } from 'jotai';
import { FileBrowserContext, ObjectStorageAdapter } from './fileBrowser';
import clsx from 'clsx';
import OperationsPanel from './OperationsPanel';
import OperationsService from './OperationsService';
import UploadsPanel from './UploadsPanel';
import UploadsService from './UploadsService';

const PREFIX = 'FileBrowser';

const classes = {
  root: `${PREFIX}-root`,
  main: `${PREFIX}-main`,
  mainGrid: `${PREFIX}-mainGrid`,
  fileList: `${PREFIX}-fileList`,
  secondaryPanel: `${PREFIX}-secondaryPanel`,
  secondaryPanelPaper: `${PREFIX}-secondaryPanelPaper`,
  secondaryPanelVisible: `${PREFIX}-secondaryPanelVisible`,
};

const Root = styled('div')(() => css`
  position: relative;
  height: 100%;
  width: 100%;
  display: flex;
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
    grid-template: 2.5rem 1fr / 1fr 1fr;
    grid-row-gap: 0.25rem;
  }

  .${classes.fileList} {
    grid-column: 1 / span 2;
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


type FileBrowserProps = {
  adapter: ObjectStorageAdapter,
};

export const FileBrowser: React.FC<FileBrowserProps> = (props) => {
  const { adapter } = props;
  const [secondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const [, closeSecondaryPanel] = useAtom(closeSecondaryPanelAtom);
  const [, clearSelection] = useAtom(clearSelectionAtom)
  const secondaryPanelIsVisible = secondaryPanelContent.length > 0;
  const openContextMenu = useOpenContextMenu();
  return (
    <FileBrowserContext.Provider 
      value={{ adapter }}
    >
      <OperationsService />
      <UploadsService />
      <Root 
        className={clsx(
          classes.root,
          {
            [classes.secondaryPanelVisible]: secondaryPanelIsVisible,
          },
        )}
      >
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
            <Breadcrumbs />
            <FileBrowserMainMenu />
            <FileList className={classes.fileList} />
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
    </FileBrowserContext.Provider>
  );
};

export default FileBrowser;