import { Card, css, IconButton, List, Paper, styled, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import CloseIcon from '@mui/icons-material/Close';
import React, { useEffect } from 'react';
import { useQueryClient  } from 'react-query';
import { atom, useAtom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import clsx from 'clsx';
import { v4 as uuidv4 } from 'uuid';
import UploadItemControl from './UploadItemControl';
import { cwdAtom } from './FileBrowser.atoms';

const PREFIX = 'UploadsManager';

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  headerActions: `${PREFIX}-headerActions`,
  headerBtn: `${PREFIX}-headerBtn`,
  list: `${PREFIX}-list`,
};

const Root = styled(Card)(({ theme }) => css`
  position: fixed;
  right: 100px;
  bottom: 0;
  z-index: ${theme.zIndex.modal};
  width: 360px;
  max-height: 500px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  transition: transform .2s;
  transform: translateY(100%);

  &.visible {
    transform: translateY(0);
  }

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
    max-height: 400px;
    overflow-y: auto;
  }
`);

const visibleAtom = atom(true);

export const toggleUploadsManagerVisibilityAtom = atom(
  null,
  (get, set) => {
    const visible = get(visibleAtom);
    const newValue = !visible;
    set(visibleAtom, newValue);
  },
);

export type QueueItem = {
  id: string,
  file: File,
  key: string,
  directory: string,
};

type QueueAction = {
  type: 'addFileList',
  fileList: File[] | FileList,
  cwd: string,
} | {
  type: 'remove',
  id: string,
} | {
  type: 'add',
  item: QueueItem,
} | {
  type: 'addMultiple',
  items: QueueItem[],
};

const queueReducer = (
  value: QueueItem[], 
  action: QueueAction,
) => {
  if (!action) {
    return value;
  }
  switch (action.type) {
    case 'addFileList': {
      return [
        ...value,
        ...Array.from(action.fileList).map((file) => ({
          id: uuidv4(),
          file,
          key: `${action.cwd}${file.name}`.slice(1),
          directory: action.cwd,
        })),
      ];
    }

    case 'remove':
      return value.filter((item) => item.id !== action.id);

    case 'add':
      return [
        ...value,
        action.item,
      ];

    case 'addMultiple':
      return [
        ...value,
        ...action.items,
      ];

    default:
      throw new Error('Unsupported action type');
  }
};

export const waitListAtom = atomWithReducer<QueueItem[], QueueAction>([], queueReducer);
export const inProgressListAtom = atomWithReducer<QueueItem[], QueueAction>([], queueReducer);
export const fileQueueAtom = atomWithReducer<QueueItem[], QueueAction>([], queueReducer);
export const stoppedListAtom = atomWithReducer<QueueItem[], QueueAction>([], queueReducer);
export const doneListAtom = atomWithReducer<QueueItem[], QueueAction>([], queueReducer);

export const queueFilesForUploadAtom = atom(null,
  (get, set, value: File | File[] | FileList) => {
    const fileList = (() => {
      if (value instanceof File) {
        return [value];
      }
      return Array.from(value);
    })();
    const cwd = get(cwdAtom);
    const fileQueue = get(fileQueueAtom);
    set(fileQueueAtom, {
      type: 'addFileList',
      fileList,
      cwd,
    });
    const newFileQueue = get(fileQueueAtom);
    const newItems = newFileQueue.slice(fileQueue.length, newFileQueue.length);
    set(waitListAtom, {
      type: 'addMultiple',
      items: newItems,
    });
  }
);

const CONCURRENCY = 10;

const UploadsManager: React.FC = () => {
  const [visible, setVisible] = useAtom(visibleAtom);
  const [fileQueue, dispatchToFileQueue] = useAtom(fileQueueAtom);
  const [waitList, dispatchToWaitList] = useAtom(waitListAtom);
  const [inProgressList, dispatchToInProgressList] = useAtom(inProgressListAtom);
  const [stoppedList, dispatchToStoppedList] = useAtom(stoppedListAtom);
  const [doneList, dispatchToDoneList] = useAtom(doneListAtom);
  const queryClient = useQueryClient();


  useEffect(() => {
    if (waitList.length === 0 || inProgressList.length === CONCURRENCY) {
      return;
    }
    const nextItem = waitList[0];
    dispatchToInProgressList({ type: 'add', item: nextItem });
    dispatchToWaitList({ type: 'remove', id: nextItem.id });
  }, [waitList, inProgressList]);

  useEffect(() => {
    if (visible || fileQueue.length === 0) {
      return;
    }
    setVisible(true);
  }, [fileQueue]);

  return (
    <Root
      elevation={9}
      className={clsx(classes.root, { visible })}
    >
      <header className={classes.header}>
        <Typography variant="subtitle1">
          Import
        </Typography>
        <div className={classes.headerActions}>
          <IconButton 
            className={classes.headerBtn}
            onClick={() => setVisible(false)}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </header>
      <List className={classes.list}>
        {fileQueue.map((item) => {
          const isInProgress = inProgressList.includes(item);
          const isOnHold = waitList.includes(item);
          const isDone = doneList.includes(item);
          const isStopped = stoppedList.includes(item);
          return (
            <UploadItemControl
              item={item}
              key={item.id}
              isInProgress={isInProgress}
              isOnHold={isOnHold}
              isDone={isDone}
              isStopped={isStopped}
              onSuccess={() => {
                dispatchToDoneList({ type: 'add', item });
                dispatchToInProgressList({ type: 'remove', id: item.id });
                queryClient.invalidateQueries(['aliyun.oss.listObjects', {
                  directory: item.directory,
                }]);
              }}
              onClose={() => {
                if (isOnHold) {
                  dispatchToWaitList({ type: 'remove', id: item.id });
                }
                if (isDone) {
                  dispatchToDoneList({ type: 'remove', id: item.id });
                }
                if (isStopped) {
                  dispatchToStoppedList({ type: 'remove', id: item.id });
                }
                dispatchToFileQueue({ type: 'remove', id: item.id });
              }}
              onStop={() => {
                dispatchToInProgressList({ type: 'remove', id: item.id });
                dispatchToStoppedList({ type: 'add', item });
              }}
              onStart={() => {
                dispatchToStoppedList({ type: 'remove', id: item.id });
                dispatchToWaitList({ type: 'add', item });
              }}
            />
          );
        })}
      </List>
    </Root>
  );
};

export default UploadsManager;
