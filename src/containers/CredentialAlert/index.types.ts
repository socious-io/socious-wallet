import { AlertProps } from 'react-bootstrap';

export interface CredentialAlertProps {
  variant: AlertProps['variant'];
  iconName: string;
  title: string;
  subtitle: string;
  links?: { to: string; label: string }[];
}
