import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { isMobile } from 'react-device-detect';
import Icon from 'src/components/Icon';
import styles from './index.module.scss';

const NavigationBar = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles['footer']}>
      <div className={styles['nav']} onClick={() => navigate('/')}>
        <Icon name="shield-tick" />
        {translate('nav-credentials')}
      </div>
      {isMobile && (
        <div className={styles['nav']} onClick={() => navigate('/scan')}>
          <Icon name="scan" />
          {translate('nav-scan')}
        </div>
      )}
      <div className={styles['nav']} onClick={() => navigate('/settings')}>
        <Icon name="settings" />
        {translate('nav-settings')}
      </div>
    </div>
  );
};

export default NavigationBar;
