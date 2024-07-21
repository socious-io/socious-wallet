import { ButtonProps } from 'react-bootstrap';
export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  header: string | React.ReactNode;
  children: string | React.ReactNode;
  buttons?: ButtonProps[];
  headerClassName?: string;
  contentClassName?: string;
}