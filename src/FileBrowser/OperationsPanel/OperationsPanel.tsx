import React from 'react';
import { useAtom } from 'jotai';
import { css, styled } from '@mui/system';
import OperationControl from './OperationControl';
import { operationListAtom } from '../OperationsService';

const Root = styled('div')(() => css`
  
`);


const OperationsPanel: React.FC = () => {
  const [operationList] = useAtom(operationListAtom);
  return (
    <Root>
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