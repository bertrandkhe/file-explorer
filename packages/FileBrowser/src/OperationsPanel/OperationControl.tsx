import React from 'react';
import { 
  Operation, 
  OperationStatus,
  stopOperationAtom,
  startOperationAtom,
  closeOperationAtom,
} from '../OperationsService';
import { css, IconButton, styled, Typography, LinearProgress } from '@mui/material';
import { grey, red  } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import clsx from 'clsx';
import { useAtom } from 'jotai';

const PREFIX = 'OperationControl';

const classes = {
  root: `${PREFIX}-root`,
  status: `${PREFIX}-status`,
  progress: `${PREFIX}-progress`,
  labelContainer: `${PREFIX}-labelContainer`,
  label: `${PREFIX}-label`,
  actions: `${PREFIX}-actions`,
  filename: `${PREFIX}-filename`,
  errorMsg: `${PREFIX}-errorMsg`,
};

const Root = styled('div')(() => css`
  padding: 0.6rem 1rem 0.5rem 1.25rem;
  border-bottom: 1px solid ${grey[300]};
  display: grid;
  grid-template:
    "label actions" 2.25rem
    "progress progress" 4px
    / 1fr 4.5rem
  ;

  .${classes.progress} {
    grid-area: progress;
  }

  .${classes.label} {
    font-size: 0.8em;
  }

  .${classes.status} {
    font-size: 0.65rem;
    color:  ${grey[600]};
  }

  .${classes.errorMsg} {
    color: ${red[500]};
  }

  .${classes.filename} {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .${classes.actions} {
    display: grid;
    grid-template-columns: 1fr 1fr;
    visibility: hidden;
  }

  &:hover,
  &:focus {
    .${classes.actions} {
      visibility: visible;
    }
  }
`);

type OperationControlProps = {
  className?: string,
  item: Operation,
};

const OperationControl: React.FC<OperationControlProps> = (props) => {
  const {
    className,
    item,
  } = props;

  const [, stop] = useAtom(stopOperationAtom);
  const [, start] = useAtom(startOperationAtom);
  const [, close] = useAtom(closeOperationAtom);

  const { status } = item;
  const isInProgress = status === OperationStatus.IN_PROGRESS;
  const isDone = status === OperationStatus.DONE;
  const isOnHold = status === OperationStatus.ON_HOLD;
  const isStopped = status === OperationStatus.STOPPED;
  const hasFailed = status === OperationStatus.FAILED;

  return (
    <Root
      className={clsx(classes.root, className)}
    >
      <div className={classes.labelContainer}>
        <div className={classes.label}>
          <div className={classes.filename}>
            {item.type === 'rename' && `Move ${item.source}`}
          </div>
          {!isInProgress  && (
            <div
              className={clsx(classes.status, { [classes.errorMsg]: hasFailed })}
            >
              {isDone && 'Done'}
              {isStopped && 'Cancelled'}
              {hasFailed && 'Operation failed'}
            </div>
          )}
        </div>
      </div>
      <div className={classes.actions}>
        {isOnHold && (
          <IconButton
            onClick={() => {
              stop(item);
            }}
            size="small"
          >
            <StopIcon />
          </IconButton>
        )}
        {(isStopped || hasFailed) && (
          <IconButton
            onClick={() => {
              start(item);
            }}
          >
            <ReplayIcon fontSize="small" />
          </IconButton>
        )}
        {(isDone || isOnHold || isStopped || hasFailed) && (
          <IconButton
            onClick={() => close(item)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </div>
      <div className={classes.progress}>
        {isInProgress && <LinearProgress />}
      </div>
    </Root>
  )
};

export default OperationControl;