import React from 'react';
import { Badge } from 'react-bootstrap';
import { MnemonicsDisplayProps } from './index.types';
import styles from './index.module.scss';

const MnemonicsDisplay: React.FC<MnemonicsDisplayProps> = ({ mnemonics }) => {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(mnemonics.join(' '));
  };

  return (
    <div className="d-flex flex-wrap gap-2">
      {mnemonics.map((mns, index) => (
        <Badge key={mns} bg="light" text="black" className={styles['badge']} onCopy={handleCopy} onClick={handleCopy}>
          {index + 1}. {mns}
        </Badge>
      ))}
    </div>
  );
};

export default MnemonicsDisplay;
