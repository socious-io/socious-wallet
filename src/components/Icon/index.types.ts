export interface IconProps {
  name: string;
  width?: number;
  height?: number;
  onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
}
