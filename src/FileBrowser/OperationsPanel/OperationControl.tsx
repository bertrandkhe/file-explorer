import React, { useRef, useEffect } from 'react';
import { Operation } from './OperationsPanel';
import { css, IconButton, styled, Typography, LinearProgress } from '@mui/material';
import { grey  } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import clsx from 'clsx';
import { fileBrowser } from '../fileBrowser';

const PREFIX = 'OperationItemControl';

const classes = {
  root: `${PREFIX}-root`,
  status: `${PREFIX}-status`,
  progress: `${PREFIX}-progress`,
  labelContainer: `${PREFIX}-labelContainer`,
  label: `${PREFIX}-label`,
  actions: `${PREFIX}-actions`,
  filename: `${PREFIX}-filename`,
};

const Root = styled('div')(() => css`
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

type OperationControlProps = {
  className?: string,
  item: Operation,
  isInProgress: boolean,
  isOnHold: boolean,
  isDone: boolean,
  isStopped: boolean,
  onSuccess(): void,
  onClose(): void,
  onStop(): void,
  onStart(): void,
};

const OperationControl: React.FC<OperationControlProps> = (props) => {
  const {
    className,
    item,
    isInProgress,
    isOnHold,
    isDone,
    isStopped,
    onClose,
    onSuccess,
    onStop,
    onStart,
  } = props;
  const renameMutation = fileBrowser.useMutation(['rename'], {
    onSuccess,
  });

  useEffect(() => {
    if (!isInProgress) {
      return;
    }
    switch (item.type) {
      case 'rename':
        renameMutation.mutate(item);
        break;
    }
  }, [isInProgress, item]);


  return (
    <Root
      className={clsx(classes.root, className)}
    >
      <div className={classes.labelContainer}>
        <div className={classes.label}>
          <div className={classes.filename}>
            {item.type === 'rename' && `Move ${item.source}`}
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
          {isOnHold && (
            <IconButton
              onClick={() => {
                onStop();
              }}
              size="small"
            >
              <StopIcon />
            </IconButton>
          )}
          {isStopped && (
            <IconButton
              onClick={() => {
                onStart();
              }}
              size="small"
            >
              <ReplayIcon />
            </IconButton>
          )}
          {(isDone || isOnHold || isStopped) && (
            <IconButton
              onClick={() => onClose()}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </div>
      {isInProgress && (
        <div className={classes.progress}>
          <LinearProgress />
        </div>
      )}
    </Root>
  )
};

export default OperationControl;