import { SpinnerProps } from 'react-bootstrap';

export interface LoadingProps extends SpinnerProps {
  show: boolean;
  message?: string;
}