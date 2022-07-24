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
    margin-top: 0.25rem;
  }

  .${classes.errorMsg} {
    color: ${red[500]};
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
            <Typography
              className={clsx(classes.status, { [classes.errorMsg]: hasFailed })}
              variant="caption"
              component="div"
            >
              {isDone && 'Done'}
              {isStopped && 'Cancelled'}
              {hasFailed && 'Operation failed'}
            </Typography>
          )}
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
              size="small"
            >
              <ReplayIcon />
            </IconButton>
          )}
          {(isDone || isOnHold || isStopped || hasFailed) && (
            <IconButton
              onClick={() => close(item)}
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