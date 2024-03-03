import { useEffect, useState } from 'react';
import { useAppState } from 'src/store';
// @ts-ignore this package types has issue so we ignore error
import { Veriff } from '@veriff/js-sdk';
import { createVeriffFrame } from '@veriff/incontext-sdk';
import axios from 'axios';
import { config } from 'src/config';

const FLAG_KEY = 'submitted_kyc';

function Verify() {
  const { did, credentials } = useAppState();
  const [submitted, setSubmitted] = useState(localStorage.getItem(FLAG_KEY) ? true : false);
  const [verifyStatus, setVerifyStatus] = useState<'PENDING' | 'VERIFIED' | 'DECLINED'>('PENDING');

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
    for (const c of credentials) {
      c.claims.filter((cl) => cl.verfied === true);
    }

    if (did && !submitted) {
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

    if (did && submitted) {
      const headers = { 'x-api-key': config.BACKUP_AGENT_API_KEY };
      axios.get(`${config.BACKUP_AGENT}/verify/${did.methodId}/status`, { headers }).then((r: any) => {
        switch (r.verification?.status) {
          case 'declined':
          case 'expired':
          case 'abandoned':
            localStorage.removeItem(FLAG_KEY);
            setSubmitted(false);
            return setVerifyStatus('DECLINED');
          case 'approved':
            return setVerifyStatus('VERIFIED');
          default:
            return setVerifyStatus('PENDING');
        }
      });
    }
  }, [credentials, did, submitted, veriff]);

  return (
    <>
      {!submitted && <div id="veriff-root"></div>}
      {submitted && <h3>You already submitted</h3>}
    </>
  );
}

export default Verify;
