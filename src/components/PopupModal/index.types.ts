export interface PopupModalProps {
  open: boolean;
  onClose: () => void;
  closeButton?: boolean;
  header: string | React.ReactNode;
  children: string | React.ReactNode;
  transition?: 'bottom' | 'top';
  headerClassName?: string;
  contentClassName?: string;
}
