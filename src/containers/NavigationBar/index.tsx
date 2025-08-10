import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import Icon from 'src/components/Icon';
import styles from './index.module.scss';
import SelectCredentialModal from 'src/components/SelectCredentialModal';
import { useState } from 'react';
import { useAppContext } from 'src/store/context';

const NavigationBar = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const [openIdentityModal, setOpenIdentityModal] = useState(false);
  const { credentials } = useAppContext().state || {};
  const isScanAvailable = credentials.length > 0 && isMobile;

  return (
    <div className={styles['footer']}>
      <div className={styles['nav']} onClick={() => navigate('/')}>
        <Icon name="shield-tick" />
        {translate('nav-credentials')}
      </div>
      {isScanAvailable && (
        <div className={styles['nav']} onClick={() => setOpenIdentityModal(true)}>
          <Icon name="scan" />
          {translate('nav-scan')}
        </div>
      )}

      <div className={styles['nav']} onClick={() => navigate('/settings')}>
        <Icon name="settings" />
        {translate('nav-settings')}
      </div>
      <SelectCredentialModal
        open={openIdentityModal}
        onSuccess={() => {
          setOpenIdentityModal(false);
          navigate('/scan');
        }}
        onClose={() => {
          setOpenIdentityModal(false);
        }}
      />
    </div>
  );
};

export default NavigationBar;
