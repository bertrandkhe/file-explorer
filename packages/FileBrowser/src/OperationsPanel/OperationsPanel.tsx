import React from 'react';
import { useAtom } from 'jotai';
import { css, styled } from '@mui/system';
import OperationControl from './OperationControl';
import { operationListAtom } from '../OperationsService';
import Panel, { PanelProps } from '../utils/Panel';

const Root = styled(Panel)(() => css`
  
`);


type OperationsPanelProps = Pick<PanelProps, 'onClose'>;


const OperationsPanel: React.FC<OperationsPanelProps> = (props) => {
  const [operationList] = useAtom(operationListAtom);
  return (
    <Root
      title="Operations"
      onClose={props.onClose}
    >
      {operationList.map((item) => {
        return (
          <OperationControl 
            key={item.id}
            item={item}
          />
        );
      })}
    </Root>
  );
};

export default OperationsPanel;