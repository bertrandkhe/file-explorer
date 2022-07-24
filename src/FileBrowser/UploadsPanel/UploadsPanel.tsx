import { Card, css, IconButton, List, styled, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';
import clsx from 'clsx';
import UploadControl from './UploadControl';
import { useUploadList } from '../UploadsService';

const PREFIX = 'UploadsManager';

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  headerActions: `${PREFIX}-headerActions`,
  headerBtn: `${PREFIX}-headerBtn`,
  list: `${PREFIX}-list`,
};

const Root = styled(Card)(({ theme }) => css`
  height: 100%;
  overflow: auto;

  .${classes.header} {
    background: ${grey[900]};
    color: ${grey[200]};
    padding: 0.5rem 1rem 0.5rem 2rem;
    display: flex;
    align-items: center;
  }

  .${classes.headerActions} {
    margin-left: auto;
  }

  .${classes.headerBtn} {
    color: ${grey[200]};
  }

  .${classes.list} {
    overflow-y: auto;
  }
`);

const UploadsPanel: React.FC = () => {
  const uploadList = useUploadList();
  return (
    <Root className={clsx(classes.root)}>
      <header className={classes.header}>
        <Typography variant="subtitle1">
          Import
        </Typography>
        <div className={classes.headerActions}>
          <IconButton 
            className={classes.headerBtn}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </header>
      <List className={classes.list}>
        {uploadList.map((item) => {
          return (
            <UploadControl
              item={item}
              key={item.id}
            />
          );
        })}
      </List>
    </Root>
  );
};

export default UploadsPanel;
