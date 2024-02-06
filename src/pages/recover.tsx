import MnemonicsDisplay from 'src/components/mnemonics';
import { Button } from 'react-bootstrap';
import { useState } from 'react';

function Recover() {
  const [mns, setMns] = useState<string[]>([]);

  const getMnemonics = (mnemonics: string[]) => {
    // setMns(mnemonics)
  };

  const confirm = () => {
    alert('recover not ready to use');
  };

  return (
    <>
      <MnemonicsDisplay mnemonics={[]} setMnemonics={getMnemonics} />
      <Button variant="primary" onClick={confirm} disabled={mns.length < 24}>
        Confirm
      </Button>
    </>
  );
}

export default Recover;
