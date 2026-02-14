import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ConfirmModal from 'src/components/ConfirmModal';
import Loading from 'src/components/Loading';
import Card from 'src/components/Card';
// import Icon from 'src/components/Icon';
import useConnection from './index.services';
import styles from './index.module.scss';
import NavigationBar from 'src/containers/NavigationBar';

function Connection() {
  const { t: translate } = useTranslation();
  const { oob, openModal, handleConfirm, handleCancel, verification, verifyConnection, debugInfo } = useConnection();

  if (!oob) return <Navigate to="/" />;
  if (!verification && !verifyConnection) return <Navigate to="/" />;
  return (
    <>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
          <div className={styles['card__header']}>
            {translate('connection-card-header')}
            {/* <Icon name="bell" /> */}
          </div>
          <div className={styles['card__content']}>
            <Loading
              variant="inherit"
              className={styles['spinner']}
              show={!openModal}
              title={translate('connection-loading.title')}
              subtitles={[
                translate('connection-loading.subtitle1'),
                translate('connection-loading.subtitle2'),
                translate('connection-loading.subtitle3'),
              ]}
            />
          </div>
          <div style={{ fontSize: 10, color: '#999', padding: 8, wordBreak: 'break-all' }}>[DBG] {debugInfo}</div>
          <NavigationBar />
        </Card>
      </div>
      <ConfirmModal
        open={openModal}
        header={translate('connection-confirm.header')}
        onClose={handleCancel}
        buttons={[
          {
            children: translate('connection-confirm.cancel-button'),
            variant: 'light',
            onClick: handleCancel,
            className: 'flex-grow-1 border-solid',
          },
          {
            children: translate('connection-confirm.button'),
            variant: 'primary',
            onClick: handleConfirm,
            className: 'flex-grow-1',
          },
        ]}
      >
        <div className={styles['title']}>
          {translate('connection-confirm.title')}
          <span className={styles['subtitle']}>{translate('connection-confirm.subtitle')}</span>
        </div>
      </ConfirmModal>
    </>
  );
}

export default Connection;
