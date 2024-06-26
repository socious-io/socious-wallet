import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jsQR from 'jsqr';
import Icon from 'src/components/Icon';
import styles from './index.module.scss';
import cn from 'classnames';
import axios from 'axios';

const Scan = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraScannerIntervalRef = useRef(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: 'environment',
          },
        })
        .then(stream => {
          setCameraStream(stream);
          const cameraElement = videoRef.current;
          cameraElement.srcObject = stream;
          cameraElement.onloadedmetadata = () => {
            cameraElement.play();
          };
        })
        .catch(error => console.error('Error accessing camera', error));
    } else {
      alert('getUserMedia() is not supported by your browser');
    }
  }, []);

  useEffect(() => {
    const cameraElement = videoRef.current;
    const canvasElement = canvasRef.current;
    if (cameraElement && canvasElement) {
      cameraElement.onloadeddata = () => {
        cameraScannerIntervalRef.current = setInterval(async () => {
          if (cameraElement.videoWidth > 0 && cameraElement.videoHeight > 0) {
            const canvas = canvasElement;
            canvas.width = cameraElement.videoWidth;
            canvas.height = cameraElement.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            ctx.drawImage(cameraElement, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const codeData = jsQR(imageData.data, imageData.width, imageData.height);

            if (codeData) {
              let url = codeData.data;
              try {
                const { data } = await axios.get(`${codeData.data}/fetch`);
                url = data.long_url;
              } catch {
                alert('QR code is not valid! Please try again.');
                return;
              }
              const { search, searchParams } = new URL(url);
              if (searchParams.get('_oob')) {
                navigate(`/connect/${search}`);
                if (cameraElement) {
                  cameraElement.pause();
                }
              } else {
                alert('QR code is not valid! Please try again.');
              }
            }
          }
        }, 1000);
      };
    }

    const stopCamera = (cameraStream: MediaStream | null) => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };

    return () => {
      if (cameraScannerIntervalRef.current) {
        clearInterval(cameraScannerIntervalRef.current);
      }
      stopCamera(cameraStream);
    };
  }, [cameraStream]);

  return (
    <>
      <div className={styles['scanner']}>
        <div className={styles['back']} onClick={() => navigate(-1)}>
          <Icon name="chevron-left" />
          Back
        </div>
        <video ref={videoRef} className={styles['video']} playsInline />
        <div className={styles['frame']}>
          <div className={cn(styles['frame__corner'], styles['frame__corner--top'])} />
          <div className={cn(styles['frame__corner'], styles['frame__corner--right'])} />
          <div className={cn(styles['frame__corner'], styles['frame__corner--bottom'])} />
          <div className={cn(styles['frame__corner'], styles['frame__corner--left'])} />
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
};

export default Scan;
