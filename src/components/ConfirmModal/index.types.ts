import { ButtonProps } from 'react-bootstrap';

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  closeButton?: boolean;
  header: string | React.ReactNode;
  headerIcon?: React.ReactNode;
  children: string | React.ReactNode;
  buttons?: ButtonProps[];
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
}
