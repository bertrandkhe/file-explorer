import React from 'react';
import { Button, css, styled } from '@mui/material';
import { useFileBrowserContext, Object } from './fileBrowser.lib';
import { selectedItemListAtom, } from './FileList/atoms';
import { useAtom } from 'jotai';
import { grey } from '@mui/material/colors';

const PREFIX = 'FileBrowserActions';

const classes = {
  root: `${PREFIX}-root`,
};


const Root = styled('div')(({ theme }) => css`
  & {
    display: flex;
    justify-content: flex-end;
    padding: ${theme.spacing(1)} 0;
    border-top: 1px solid ${grey[300]};
  }

  .MuiButton-root {
    margin-right: ${theme.spacing(1)};
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