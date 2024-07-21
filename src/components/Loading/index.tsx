import React from 'react';
import { Spinner } from 'react-bootstrap';
import { LoadingProps } from './index.types';

const Loading: React.FC<LoadingProps> = ({
  show,
  message,
  animation = 'border',
  role = 'status',
  variant = 'primary',
  ...rest
}) => {
  if (show) {
    return (
      <div className="h-100 d-flex flex-column gap-5 align-items-center justify-content-center">
        {message && <h5 className="text-center">{message}</h5>}
        <Spinner animation={animation} role={role} variant={variant} {...rest} />
      </div>
    );
  } else {
    return <></>;
  }
};
export default Loading;
