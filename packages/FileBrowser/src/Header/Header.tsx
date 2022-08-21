import React from 'react';
import { css, styled } from '@mui/system';
import Breadcrumbs from './Breadcrumbs';
import Navigation from './Navigation';
import RightMenu from './RightMenu';
import { grey } from '@mui/material/colors';

const PREFIX = 'Header';

const classes = {
  root: `${PREFIX}-root`,
};

const Root = styled('div')(() => css`
  & {
    display: grid;
    grid-template: 1fr / max-content auto auto;
    align-items: center;
    border-bottom: 1px solid ${grey[300]};
  }
`);

const Header: React.FC = () => {
  return (
    <Root className={classes.root}>
      <Navigation />
      <Breadcrumbs />
      <RightMenu />
    </Root>
  );
};

export default Header;