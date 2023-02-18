import { css, List, styled } from '@mui/material';
import React from 'react';
import UploadControl from './UploadControl';
import { useUploadList } from '../UploadsService';
import Panel, { PanelProps } from '../utils/Panel';

const PREFIX = 'UploadsManager';

const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  headerActions: `${PREFIX}-headerActions`,
  headerBtn: `${PREFIX}-headerBtn`,
  list: `${PREFIX}-list`,
};

const Root = styled(Panel)(() => css`
  .${classes.list} {
    overflow-y: auto;
  }
`);

type UploadsPanelProps = Pick<PanelProps, 'onClose'>;

const UploadsPanel: React.FC<UploadsPanelProps> = (props) => {
  const uploadList = useUploadList();
  return (
    <Root
      title="Uploads"
      onClose={props.onClose}
    >
      <List className={classes.list}>
        {uploadList.map((item) => {
          return (
            <UploadControl
              item={item}
              key={item.id}
            />
          );
        })}
      </List>
    </Root>
  );
};

export default UploadsPanel;
