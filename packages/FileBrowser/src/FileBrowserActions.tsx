import React from 'react';
import { Button, css, styled } from '@mui/material';
import { useFileBrowserContext, Object } from './fileBrowser.lib';
import { selectedItemListAtom, } from './FileList/atoms';
import { useAtom } from 'jotai';

const PREFIX = 'FileBrowserActions';

const classes = {
  root: `${PREFIX}-root`,
};


const Root = styled('div')(() => css`
  display: flex;
  justify-content: flex-end;
  padding: 0.5rem 0;

  .MuiButton-root {
    margin-right: 0.5rem;
    &:last-of-type {
      margin-right: 0;
    }
  }
`);

const FileBrowserActions: React.FC = () => {
  const { onChooseFiles, onClose } = useFileBrowserContext();
  const [selectedItemList] = useAtom(selectedItemListAtom);
  if (!onChooseFiles) {
    return null;
  }
  const selectedFiles = selectedItemList.filter((s) => s.type === 'file') as Object[];
  return (
    <Root className={classes.root}>
      {onClose && (
        <Button 
          variant="outlined"
          onClick={(ev) => {
            ev.preventDefault();
            onClose();
          }}
        >
          Cancel
        </Button>
      )}
      <Button 
        variant="contained"
        onClick={(ev) => {
          ev.preventDefault();
          onChooseFiles(selectedFiles);
        }}
        disabled={selectedFiles.length === 0}
      >
        Choose files
      </Button>
    </Root>
  );
};

export default FileBrowserActions;