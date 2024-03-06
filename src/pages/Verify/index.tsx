import Card from 'src/components/Card';
import useVerify from './index.services';

function Verify() {
  const { submitted, verification } = useVerify();

  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card containerClassName="h-auto w-auto rounded-3">
        <h4 className="fw-bold mb-4">Verification</h4>
        {!submitted && <div id="veriff-root"></div>}
        {submitted && !verification && <h3>Your verfication request has been submitted</h3>}
        {verification && <h3>Your identity has been verified</h3>}
      </Card>
    </div>
  );
}

export default Verify;
