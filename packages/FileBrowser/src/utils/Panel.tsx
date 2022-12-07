import React from 'react';
import { styled, css, Typography, IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import clsx from 'clsx';
import CloseIcon from '@mui/icons-material/Close';

const PREFIX = 'Panel';

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  headerActions: `${PREFIX}-headerActions`,
  headerBtn: `${PREFIX}-headerBtn`,
};

const Root = styled('div')(({ theme }) => css`
  height: 100%;
  overflow: auto;

  .${classes.header} {
    background: ${grey[900]};
    color: ${grey[200]};
    padding: ${theme.spacing(1)} ${theme.spacing(2)} ${theme.spacing(1)} ${theme.spacing(4)};
    display: flex;
    align-items: center;
  }

  .${classes.headerActions} {
    margin-left: auto;
  }

  .${classes.headerBtn} {
    color: ${grey[200]};
  }
`);

export type PanelProps = {
  children: React.ReactNode,
  title: React.ReactNode,
  className?: string,
  onClose?(): void,
  classes?: {
    root?: string,
    title?: string,
    header?: string,
    headerActions?: string,
    headerBtn?: string,
  },
};

const Panel: React.FC<PanelProps> = (props) => {
  const { 
    className,
    classes: propsClasses = {},
    children,
    title,
    onClose,
  } = props;
  return (
    <Root className={clsx(classes.root, propsClasses.root, className)}>
      <header className={clsx(classes.header, propsClasses.header)}>
        <Typography 
          className={propsClasses.title}
          variant="subtitle1"
        >
          {title}
        </Typography>
        <div className={clsx(classes.headerActions, propsClasses.headerActions)}>
          {onClose && (
            <IconButton 
              className={clsx(classes.headerBtn, propsClasses.headerBtn)}
              onClick={onClose}
            >
              <CloseIcon />
            </IconButton>
          )}
        </div>
      </header>
    {children}
  </Root>
  )
};

export default Panel;