export interface NumPadProps {
  digitsLength?: number;
  onFilled: (pass: string) => void;
  filledPass?: string;
  onChange?: (pass: string) => void;
  onRemove?: () => void;
  onBack?: () => void;
  containerClassName?: string;
}
