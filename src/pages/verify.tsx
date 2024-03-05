import { useEffect, useState } from 'react';
import { useAppState, useAppDispatch } from 'src/store';
// @ts-ignore this package types has issue so we ignore error
import { Veriff } from '@veriff/js-sdk';
import { createVeriffFrame } from '@veriff/incontext-sdk';
import axios from 'axios';
import { config } from 'src/config';
import { useNavigate } from 'react-router-dom';

const FLAG_KEY = 'submitted_kyc';

function Verify() {
  const { did, credentials, verification } = useAppState();
  const [submitted, setSubmitted] = useState(localStorage.getItem(FLAG_KEY) ? true : false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const veriff = Veriff({
    apiKey: config.VERIFF_API_KEY,
    parentId: 'veriff-root',
    onSession: function (err, response) {
      console.log(response);
      createVeriffFrame({
        url: response.verification.url,
        onEvent: async function (msg) {
          if (msg === 'FINISHED') {
            localStorage.setItem(FLAG_KEY, `${true}`);
            localStorage.setItem('session', response.verification.id);
            setSubmitted(true);
            const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
            await axios.post(
              `${config.BACKUP_AGENT}/verify/start`,
              {
                session: response.verification.id,
                did: response.verification.vendorData,
              },
              { headers },
            );
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
        submitBtnText: 'Get verified',
      });
    }
  }, [credentials, did, submitted, veriff, verification]);

  useEffect(() => {
    if (did && submitted && verification === null) {
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
      const checkStatus = () => {
        axios.get(`${config.BACKUP_AGENT}/verify/${did.methodId}/status`, { headers }).then((r) => {
          switch (r.data.verification?.status) {
            case 'declined':
            case 'expired':
            case 'abandoned':
              localStorage.removeItem(FLAG_KEY);
              setSubmitted(false);
              break;
            case 'approved':
              const url = new URL(r.data.connection.url);
              // need to clear messages before redirect
              dispatch({ type: 'SET_NEW_MESSAGE', payload: [] });
              navigate(`${url.pathname}${url.search}`);
              break;
          }
        });
      };
      const intervalId = setInterval(checkStatus, 5000);
      return () => clearInterval(intervalId);
    }
  }, [did, submitted, navigate, dispatch, verification]);

  return (
    <>
      {!submitted && <div id="veriff-root"></div>}
      {submitted && !verification && <h3>Your verfication request has been submitted</h3>}
      {verification && <h3>Your identity has been verified</h3>}
    </>
  );
}

export default Verify;
