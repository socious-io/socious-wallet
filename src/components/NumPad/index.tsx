import React, { useState } from 'react';
import Icon from '../Icon';
import { NumPadProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const NumPad: React.FC<NumPadProps> = ({
  digitsLength = 6,
  onFilled,
  filledPass = '',
  onChange,
  onRemove,
  onBack,
  containerClassName = '',
}) => {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'back'];
  const [enteredPass, setEnteredPass] = useState(filledPass);

  const handleNumPadClick = (num: number | string) => {
    if (enteredPass.length < digitsLength) {
      const newPass = enteredPass + num;
      setEnteredPass(newPass);
      if (newPass.length === digitsLength) {
        onFilled(newPass);
      }
    }
    onChange?.(num.toString());
  };

  const handleDeleteDigit = () => {
    if (enteredPass.length > 0) {
      const newPass = enteredPass.slice(0, -1);
      setEnteredPass(newPass);
    } else if (enteredPass.length === 0) {
      onBack?.();
    }
    onRemove?.();
  };

  return (
    <div className={cn('d-flex flex-column align-items-center gap-5', containerClassName)}>
      <div className="d-flex gap-3">
        {Array(digitsLength)
          .fill(false)
          .map((_, index) => (
            <div key={index} className={cn(styles['digit'], index < enteredPass.length && styles['digit--filled'])} />
          ))}
      </div>
      <div className={styles['nums']}>
        {nums.map(num => (
          <div key={num} className={styles['nums__pad']}>
            {num !== null && (
              <span
                className={styles['nums__text']}
                onClick={() => (num === 'back' ? handleDeleteDigit() : handleNumPadClick(num))}
              >
                {num === 'back' ? <Icon name="delete" /> : num}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NumPad;
