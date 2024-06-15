const SRC = 'https://socious.io/wallet';
const TITLE = 'Download Wallet app';

function Doownload() {
  return (
    <div className="iframe-container" style={{ width: '100%', height: '100%' }}>
      <iframe src={SRC} title={TITLE} style={{ border: 'none', width: '100%', height: '100%' }} allowFullScreen />
    </div>
  );
}

export default Doownload;
