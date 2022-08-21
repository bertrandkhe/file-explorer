import React, { useEffect, useRef } from 'react';
import { styled, css } from '@mui/system';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { cwdAtom } from '../FileBrowser.atoms';
import { useAtom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';

const PREFIX = 'Navigation';

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled('div')(() => css`
  & {
    display: flex;
  }
`);

type HistoryAction = {
  type: 'push',
  payload: {
    directory: string,
  },
} | {
  type: 'move'
  payload: {
    position: number,
  },
}

const historyAtom = atomWithReducer(
  {
    position: -1,
    items: [] as string[],
  },
  (value, action: HistoryAction) => {
    const { type, payload } = action;
    switch (type) {
      case 'push':
        const currentItem = value.position >= 0 ? value.items[value.position] : null;
        if (currentItem === payload.directory) {
          return value;
        }
        const newPosition = value.position + 1;
        const newItems = [...(value.items.slice(0, newPosition)), payload.directory];
        return {
          position:  newPosition,
          items: newItems,
        };

      case 'move':
        return {
          position: payload.position,
          items: value.items,
        };
    }
  }
);

const Navigation: React.FC = () => {
  const [cwd, setCwd] = useAtom(cwdAtom);
  const [history, dispatch] = useAtom(historyAtom);
  const skipRef = useRef(false);
  const maxPos = history.items.length - 1;

  useEffect(() => {
    if (skipRef.current) {
      skipRef.current = false;
      return;
    }
    dispatch({
      type: 'push',
      payload: {
        directory: cwd,
      },
    });
  }, [cwd]);

  const move = (newPosition: number) => {
    skipRef.current = true;
    const newCwd = history.items[newPosition];
    setCwd(newCwd);
    dispatch({
      type: 'move',
      payload: {
        position: newPosition,
      },
    });
  }

  return (
    <Root className={classes.root}>
      <IconButton 
        onClick={() => move(history.position - 1)}
        disabled={history.position <= 0}
      >
        <ArrowBackIcon />
      </IconButton>
      <IconButton
        onClick={() => move(history.position + 1)}
        disabled={history.position >= maxPos}
      >
        <ArrowForwardIcon />
      </IconButton>
    </Root>
  )
};

export default Navigation;