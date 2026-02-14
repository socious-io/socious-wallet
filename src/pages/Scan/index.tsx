import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  CapacitorBarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
} from '@capacitor/barcode-scanner';
import Icon from 'src/components/Icon';
import styles from './index.module.scss';
import axios from 'src/services/http';
import { logger } from 'src/utilities';

const Scan = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const scan = async () => {
      try {
        const result = await CapacitorBarcodeScanner.scanBarcode({
          hint: CapacitorBarcodeScannerTypeHint.QR_CODE,
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanInstructions: translate('scan-instruction'),
        });

        if (result.ScanResult) {
          let url = result.ScanResult;
          try {
            const { data } = await axios.get(`${url}/fetch`);
            url = data.long_url;
          } catch (err) {
            logger(err, { componentStack: 'scanner', digest: 'on fetching url' });
            alert(translate('scan-error-qr'));
            navigate(-1);
            return;
          }
          const { search, searchParams } = new URL(url);
          if (searchParams.get('_oob')) {
            navigate(`/connect/${search}`);
          } else {
            logger(Error(`oob not found on ${JSON.stringify(searchParams)}`), {
              componentStack: 'scanner',
              digest: 'on fetching url params',
            });
            alert(translate('scan-error-qr'));
            navigate(-1);
          }
        } else {
          navigate(-1);
        }
      } catch (error) {
        console.error('Scan error:', error);
        navigate(-1);
      }
    };
    scan();
  }, []);

  return (
    <div className={styles['scanner']}>
      <div className={styles['back']} onClick={() => navigate(-1)}>
        <Icon name="chevron-left" />
        {translate('scan-back-button')}
      </div>
    </div>
  );
};

export default Scan;
