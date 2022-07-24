import React from 'react';
import { styled, css, LinearProgress, IconButton, ListItem, Typography } from '@mui/material'
import { grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import clsx from 'clsx';
import { UploadItem, useUploadControls, useUploadStatus } from '../UploadsService';
import { useUploadProgress } from '../UploadsService/hooks';

const PREFIX = 'UploadItemControl';

const classes = {
  root: `${PREFIX}-root`,
  status: `${PREFIX}-status`,
  progress: `${PREFIX}-progress`,
  labelContainer: `${PREFIX}-labelContainer`,
  label: `${PREFIX}-label`,
  actions: `${PREFIX}-actions`,
  filename: `${PREFIX}-filename`,
};

const Root = styled(ListItem)(() => css`
  padding: 0.5rem 1rem 0.5rem 2rem;
  border-bottom: 1px solid ${grey[300]};
  flex-direction: column;
  align-items: flex-start;

  :last-of-type {
    border-bottom: none;
  }

  .${classes.progress} {
    width: 100%;
    padding-right: 2.5rem;
  }

  .${classes.label} {
    width: 100%;
    overflow: hidden;
    line-height: 1.1;
    font-size: 0.9em;
  }

  .${classes.filename} {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .${classes.labelContainer} {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 90px;
    align-items: center;

    .${classes.actions} {
      visibility: hidden;
    }

    &:hover,
    &:focus {
      .${classes.actions} {
        visibility: visible;
      }
    }
  }
  
  .${classes.actions} {
    margin-left: 0.5rem;
    display: flex;
    justify-content: flex-end;
  }

  .${classes.status} {
    color:  ${grey[600]};
  }
`);

type UploadControlProps = {
  className?: string,
  item: UploadItem,
};

const UploadControl: React.FC<UploadControlProps> = (props) => {
  const {
    className,
    item,
  } = props;
  const { 
    isInProgress,
    isDone,
    isStopped,
    isOnHold,
  } = useUploadStatus(item);
  const progress = useUploadProgress(item);
  const { 
    startUpload,
    stopUpload,
    closeUpload,
  } = useUploadControls();
  return (
    <Root
     className={clsx(classes.root, className)}
    >
      <div className={classes.labelContainer}>
        <div className={classes.label}>
          <div className={classes.filename}>
            {item.file.name}
          </div>
          {!isInProgress && (
            <Typography
              className={classes.status}
              variant="caption"
            >
              {isDone && 'Done'}
              {isStopped && 'Cancelled'}
            </Typography>
          )}
        </div>
        <div className={classes.actions}>
          {isInProgress && (
            <IconButton
              onClick={() => {
                stopUpload(item);
              }}
              size="small"
            >
              <StopIcon />
            </IconButton>
          )}
          {isStopped && (
            <IconButton
              onClick={() => {
                startUpload(item);
              }}
              size="small"
            >
              <ReplayIcon />
            </IconButton>
          )}
          {(isDone || isOnHold || isStopped) && (
            <IconButton
              onClick={() => closeUpload(item)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </div>
      {isInProgress && (
        <div className={classes.progress}>
          {progress.loaded > 0 && (
            <LinearProgress 
              variant="determinate" 
              value={Math.ceil((progress.loaded * 100) / progress.total)} 
              // value={50}
            />
          )}
          {!progress.loaded && (
            <LinearProgress variant="indeterminate" />
          )}
        </div>
      )}
    </Root>
  );
};

export default UploadControl;