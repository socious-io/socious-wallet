import { ChangeEvent } from 'react';

export interface InputProps {
  register?: any;
  name?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: 'text' | 'password';
  label?: string;
  placeholder?: string;
  hasPostfixIcon?: boolean;
  postfixIcon?: React.ReactNode;
  onPostfixClick?: () => void;
  hintMessage?: string;
  errorMessage?: string;
}
