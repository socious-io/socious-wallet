import React, { useState, useEffect } from 'react';
import { Row, Col, InputGroup, FormControl } from 'react-bootstrap';

interface MnemonicsDisplayProps {
  mnemonics: string[];
  setMnemonics?: (mnemonics: string[]) => void;
  len?: number;
}

const MnemonicsDisplay: React.FC<MnemonicsDisplayProps> = ({ mnemonics, setMnemonics, len = 24 }) => {
  const [localMnemonics, setLocalMnemonics] = useState<string[]>([]);
  const wordsPerRow = 6;
  const isEmptyMnemonics = mnemonics.length === 0;

  useEffect(() => {
    // Initialize local mnemonics with either the provided mnemonics or empty strings for 24 inputs
    setLocalMnemonics(isEmptyMnemonics ? Array(len).fill('') : mnemonics);
  }, [mnemonics, isEmptyMnemonics, len]);

  const handleMnemonicChange = (index: number, value: string) => {
    const updatedMnemonics = [...localMnemonics];
    updatedMnemonics[index] = value;
    setLocalMnemonics(updatedMnemonics);
    setMnemonics(updatedMnemonics); // Update parent component's mnemonics state
  };

  const renderInputs = (mnemonicsToRender: string[]) => {
    let numRows = Math.ceil(mnemonicsToRender.length / wordsPerRow);

    return Array.from({ length: numRows }, (_, rowIndex) => {
      const start = rowIndex * wordsPerRow;
      const end = start + wordsPerRow;
      const rowMnemonics = mnemonicsToRender.slice(start, end);

      return (
        <Row key={rowIndex} className="mb-3">
          {rowMnemonics.map((mnemonic, colIndex) => (
            <Col key={colIndex} xs={2}>
              <InputGroup>
                <InputGroup.Text>{rowIndex * wordsPerRow + colIndex + 1}</InputGroup.Text>
                <FormControl
                  disabled={!isEmptyMnemonics}
                  value={mnemonic}
                  onChange={(e) => handleMnemonicChange(rowIndex * wordsPerRow + colIndex, e.target.value)}
                  maxLength={8}
                />
              </InputGroup>
            </Col>
          ))}
        </Row>
      );
    });
  };

  return <div>{renderInputs(localMnemonics)}</div>;
};

export default MnemonicsDisplay;
