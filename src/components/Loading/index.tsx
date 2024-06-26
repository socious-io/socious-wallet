import React from 'react';
import { Spinner } from 'react-bootstrap';
import { LoadingProps } from './index.types';

const Loading: React.FC<LoadingProps> = ({
  show,
  title = '',
  subtitles = [],
  animation = 'border',
  role = 'status',
  variant = 'primary',
  ...rest
}) => {
  if (show) {
    return (
      <div className="h-100 d-flex flex-column align-items-center justify-content-center">
        <Spinner animation={animation} role={role} variant={variant} {...rest} />
        {title && <h5 className="mt-5 text-center fw-semibold lh-lg">{title}</h5>}
        {!!subtitles.length && (
          <div className="d-flex flex-column align-items-center px-2">
            {subtitles.map(subtitle => (
              <p key={subtitle} className="text-center text-gray">
                {subtitle}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  } else {
    return <></>;
  }
};

export default Loading;
