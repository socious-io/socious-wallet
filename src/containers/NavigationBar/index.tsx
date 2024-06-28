import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';
import Icon from 'src/components/Icon';
import styles from './index.module.scss';

const NavigationBar = () => {
  const navigate = useNavigate();

  return (
    <div className={styles['footer']}>
      <div className={styles['nav']} onClick={() => navigate('/')}>
        <Icon name="shield-tick" />
        Credentials
      </div>
      {isMobile && (
        <div className={styles['nav']} onClick={() => navigate('/scan')}>
          <Icon name="scan" />
          Scan
        </div>
      )}
      <div className={styles['nav']} onClick={() => navigate('/settings')}>
        <Icon name="settings" />
        Settings
      </div>
    </div>
  );
};

export default NavigationBar;
