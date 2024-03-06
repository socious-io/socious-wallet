import { ButtonProps } from 'react-bootstrap';

export interface CardProps {
  children: React.ReactNode;
  buttons?: ButtonProps[];
  containerClassName?: string;
  contentClassName?: string;
}
