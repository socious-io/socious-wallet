import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import Icon from '../Icon';
import { InputProps } from './index.types';
import styles from './index.module.scss';
import cn from 'classnames';

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  register,
  name = '',
  type = 'text',
  label,
  placeholder,
  hasPostfixIcon = false,
  postfixIcon,
  onPostfixClick,
  hintMessage = '',
  errorMessage = '',
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputType = type === 'password' && (isPasswordVisible ? 'text' : 'password');

  const handlePostfixClick = () => {
    if (onPostfixClick) {
      onPostfixClick?.();
    }
    if (type === 'password') {
      setIsPasswordVisible(!isPasswordVisible);
    }
  };

  return (
    <Form.Group controlId={name}>
      {label && <Form.Label className={styles['label']}>{label}</Form.Label>}
      <InputGroup
        className={cn(styles['container'], errorMessage ? styles['container--error'] : styles['container--default'])}
      >
        <Form.Control
          name={name}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles['input']}
          {...register(name)}
        />
        {hasPostfixIcon && (
          <InputGroup.Text onClick={handlePostfixClick} className={styles['postfix']}>
            {type === 'password' ? <Icon name={isPasswordVisible ? 'eye-off' : 'eye'} /> : postfixIcon}
          </InputGroup.Text>
        )}
      </InputGroup>
      {hintMessage && <p className={styles['hint']}>{hintMessage}</p>}
      {errorMessage && <p className={styles['error']}>{errorMessage}</p>}
    </Form.Group>
  );
};

export default Input;
