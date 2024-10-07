import { ButtonProps } from 'react-bootstrap';

export interface CreatedCardProps {
  title: string;
  subtitle: string;
  iconName?: string;
  buttons?: ButtonProps[];
  contentClassName?: string;
}
