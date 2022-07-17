import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled, css, LinearProgress, IconButton, ListItem, Typography } from '@mui/material'
import { QueueItem } from './UploadsManager';
import { grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import StopIcon from '@mui/icons-material/Stop';
import ReplayIcon from '@mui/icons-material/Replay';
import clsx from 'clsx';
import { fileBrowser } from './fileBrowser';

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

type UploadItemControlProps = {
  className?: string,
  item: QueueItem,
  isInProgress: boolean,
  isOnHold: boolean,
  isDone: boolean,
  isStopped: boolean,
  onSuccess(): void,
  onClose(): void,
  onStop(): void,
  onStart(): void,
};

const UploadItemControl: React.FC<UploadItemControlProps> = (props) => {
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
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const { file } = item;
  const [progressData, setProgressData] = useState({
    loaded: 0,
    total: file.size,
  });
  const uploadMutation = fileBrowser.useMutation(['upload'], {
    onSuccess,
  });

  // const signQuery = trpc.useQuery(['aliyun.oss.postObjectData', {
  //   key: item.key,
  //   contentType: file.type.length > 0 ? file.type : undefined,
  //   filesize: file.size,
  // }], {
  //   refetchOnWindowFocus: false,
  //   enabled: !xhrRef.current && isInProgress,
  // });

  // const postObjectMutation = useMutation(async (signData: NonNullable<typeof signQuery.data>): Promise<string> => {
  //   const formData = new FormData();
  //   formData.set('key', signData.key);
  //   formData.set('policy', signData.policyBase64);
  //   formData.set('OSSAccessKeyId', signData.accessKeyId);
  //   formData.set('signature', signData.signature);
  //   formData.set('file', file);
  //   formData.set('success_action_status', signData.successActionsStatus);
  //   const uri = `/${signData.bucket}/${signData.key}`;
  //   return new Promise((resolve) => {
  //     const xhr = new XMLHttpRequest();
  //     xhr.open('POST', signData.endpoint);
  //     xhr.addEventListener('load', () => {
  //       resolve(uri);
  //     });
  //     xhr.upload.addEventListener('progress', (ev) => {
  //       setProgressData((prevData) => ({
  //         ...prevData,
  //         loaded: ev.loaded,
  //       }));
  //     });
  //     xhr.send(formData);
  //     xhrRef.current = xhr;
  //   });
  // }, {
  //   onSuccess,
  // });

  useEffect(() => {
    if (!isInProgress || uploadMutation.isSuccess || !uploadMutation.isIdle) {
      return;
    }
    uploadMutation.mutate({
      file: item.file,
      key: item.key,
      onProgress(ev) {
        setProgressData((prevData) => ({
          ...prevData,
          loaded: ev.loaded,
        }));
      },
    });
  }, [isInProgress]);

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
                xhrRef.current?.abort();
                xhrRef.current = null;
                setProgressData((prevData) => ({
                  ...prevData,
                  loaded: 0,
                }));
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
          <LinearProgress 
            variant="determinate" 
            value={Math.ceil((progressData.loaded * 100) / progressData.total)} 
            // value={50}
          />
        </div>
      )}
    </Root>
  );
};

export default UploadItemControl;