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

const Root = styled('div')(({ theme }) => css`
  padding: ${theme.spacing(1.2)} ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(2.5)};
  border-bottom: 1px solid ${grey[300]};
  display: grid;
  grid-template:
    "label actions" ${theme.spacing(4.5)}
    "progress progress" 4px
    / 1fr ${theme.spacing(9)} 
  ;

  .${classes.progress} {
    grid-area: progress;
  }

  .${classes.label} {
    font-size: ${theme.typography.fontSize * 0.8}px;
  }

  .${classes.status} {
    font-size: ${theme.typography.fontSize * 0.65}px;
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