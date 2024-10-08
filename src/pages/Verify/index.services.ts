import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore this package types has issue so we ignore error
import { Veriff } from '@veriff/js-sdk';
import { createVeriffFrame } from '@veriff/incontext-sdk';
import axios from 'src/services/http';
import { config } from 'src/config';

const FLAG_KEY = 'submitted_kyc';

//FIXME: create api folder for each axios request
const startKYC = async (did: string, session: string) => {
  const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
  return axios.post(`${config.BACKUP_AGENT}/verify/start`, { session, did }, { headers });
};

const useVerify = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const { did, credentials, verification } = state || {};
  const [submitted, setSubmitted] = useState(localStorage.getItem(FLAG_KEY) === 'APPROVED');

  const veriff = Veriff({
    apiKey: config.VERIFF_API_KEY,
    parentId: 'veriff-root',
    onSession: function (err, response) {
      createVeriffFrame({
        url: response.verification.url,
        onEvent: async function (msg) {
          if (msg === 'FINISHED') {
            localStorage.setItem(FLAG_KEY, 'APPROVED');
            localStorage.setItem('session', response.verification.id);
            setSubmitted(true);
            dispatch({ type: 'SET_SUBMIT', payload: 'APPROVED' });
            await startKYC(did.methodId, response.verification.id);
          }
        },
      });
    },
  });

  useEffect(() => {
    if (did && !submitted && verification === null) {
      veriff.setParams({
        person: {
          givenName: ' ',
          lastName: ' ',
        },
        vendorData: did.methodId,
      });
      veriff.mount({
        submitBtnText: translate('verify-veriff-button'),
      });
    }
  }, [credentials, did, submitted, veriff, verification]);

  useEffect(() => {
    if (did && submitted && verification === null) {
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
      const checkStatus = () => {
        axios
          .get(`${config.BACKUP_AGENT}/verify/${did.methodId}/status`, { headers })
          .then(r => {
            switch (r.data.verification?.status) {
              case 'declined':
                localStorage.setItem(FLAG_KEY, 'DECLINED');
                setSubmitted(false);
                dispatch({ type: 'SET_SUBMIT', payload: 'DECLINED' });
                break;
              case 'expired':
                localStorage.setItem(FLAG_KEY, 'EXPIRED');
                setSubmitted(false);
                dispatch({ type: 'SET_SUBMIT', payload: 'EXPIRED' });
                break;
              case 'abandoned':
                localStorage.setItem(FLAG_KEY, 'ABANDONED');
                setSubmitted(false);
                dispatch({ type: 'SET_SUBMIT', payload: 'ABANDONED' });
                break;
              case 'approved': {
                const url = new URL(r.data.connection.url);
                // need to clear messages before redirect
                dispatch({ type: 'SET_NEW_MESSAGE', payload: [] });
                navigate(`${url.pathname}${url.search}`);
                break;
              }
            }
          })
          .catch(err => {
            const sessionID = localStorage.getItem('session');
            console.log(err);
            if (err?.response?.status === 400 && sessionID) {
              startKYC(did.methodId, sessionID);
            }
          });
      };
      const intervalId = setInterval(checkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [did, submitted, navigate, dispatch, verification]);

  return { translate, submitted, verification };
};

export default useVerify;
