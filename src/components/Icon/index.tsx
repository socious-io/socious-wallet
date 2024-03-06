import { IconProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const Icon = ({ name, width, height, onClick, className = '' }: IconProps) => {
  return (
    <div className={cn(styles['custom__icon'], className)} onClick={onClick}>
      <img src={`/icons/${name}.svg`} width={width} height={height} />
    </div>
  );
};

export default Icon;
