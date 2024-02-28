import React, { useState, useEffect } from 'react';
import { Row, Col, InputGroup, FormControl } from 'react-bootstrap';

interface MnemonicsDisplayProps {
  mnemonics: string[];
  len?: number;
  readOnly?: boolean;
  setMnemonics?: (mnemonics: string[]) => void;
}

const MnemonicsDisplay: React.FC<MnemonicsDisplayProps> = ({ mnemonics, len = 24, readOnly = false, setMnemonics }) => {
  const [mns, setMns] = useState(Array(len).fill(''));
  const wordsPerRow = 6;

  useEffect(() => {
    if (readOnly) setMns(mnemonics);
  }, [mnemonics, readOnly]);

  const handleMnemonicChange = (index: number, value: string) => {
    const updatedMnemonics = [...mns];
    updatedMnemonics[index] = value;
    setMns(updatedMnemonics);
    setMnemonics(updatedMnemonics);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    e.preventDefault(); // Prevent the default paste behavior

    const pastedText = e.clipboardData.getData('text'); // Get the pasted text
    const words = pastedText.split(/\s+/).slice(0, len); // Split by space and limit to `len`

    if (words.length > 0) {
      const updatedMnemonics = Array(len).fill(''); // Create a new array filled with empty strings
      words.forEach((word, index) => {
        updatedMnemonics[index] = word; // Update the array with the pasted words
      });

      setMns(updatedMnemonics);
      setMnemonics(updatedMnemonics);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mns.join(' '));
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
                  disabled={readOnly}
                  value={mnemonic}
                  onChange={(e) => handleMnemonicChange(rowIndex * wordsPerRow + colIndex, e.target.value)}
                  maxLength={8}
                  onPaste={handlePaste}
                  onCopy={handleCopy}
                />
              </InputGroup>
            </Col>
          ))}
        </Row>
      );
    });
  };

  return <div>{renderInputs(mns)}</div>;
};

export default MnemonicsDisplay;
