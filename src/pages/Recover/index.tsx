import { Navigate } from 'react-router-dom';
import Card from 'src/components/Card';
import useRecover from './index.services';
import styles from './index.module.scss';

function Recover() {
  const { translate, navigate, did, inputRef, onClickUpload, onUploadWallet, errorMessage } = useRecover();

  if (did) return <Navigate to="/" />;
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <Card
        contentClassName="justify-content-start pt-5 text-center"
        buttons={[
          {
            children: translate('recover-import-button'),
            variant: 'primary',
            className: 'fw-semibold w-100 py-2',
            onClick: onClickUpload,
          },
          {
            children: translate('recover-back-button'),
            variant: 'light',
            className: 'fw-semibold w-100 py-2',
            onClick: () => navigate('/intro'),
          },
        ]}
      >
        <div className="d-flex flex-column gap-2">
          <h4 className={styles['title']}>{translate('recover-title')}</h4>
          <span className={styles['subtitle']}>{translate('recover-subtitle')}</span>
        </div>
        <input type="file" accept=".enc" ref={inputRef} className="d-none" onChange={onUploadWallet} />
        {errorMessage && <span className={styles['error']}>{errorMessage}</span>}
      </Card>
    </div>
  );
}

export default Recover;
