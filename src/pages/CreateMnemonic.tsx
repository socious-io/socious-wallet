import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import SDK from '@atala/prism-wallet-sdk';
import { createDID } from '@/utils/dids';
import { MnemonicWordList } from '@atala/prism-wallet-sdk/build/typings/domain';
import Tag from '@/components/Tag';
import { Link } from 'react-router-dom';

const CreateMnemonic = () => {
  const intl = useIntl();

  const [mnemonics, setMnemonics] = useState<MnemonicWordList>();

  useEffect(() => {
    const exampleService = new SDK.Domain.Service('didcomm', ['DIDCommMessaging'], {
      uri: 'https://example.com/endpoint',
      accept: ['didcomm/v2'],
      routingKeys: ['did:example:somemediator#somekey'],
    });
    createDID([exampleService]).then(({ mnemonics }) => {
      setMnemonics(mnemonics);
      setMnemonics(mnemonics);
    });
  }, []);

  return (
    <div className="bg-white dark:bg-gray-950 rounded-xl shadow-sm mt-24 mx-auto p-8 w-[38rem]">
      <h1 className="font-semibold text-2xl dark:text-gray-50 text-center">{intl.formatMessage({ id: 'welcome' })}</h1>
      <h2 className="text-center mt-2 text-gray-500 dark:text-gray-400">
        {intl.formatMessage({ id: 'to-get-started' })}
      </h2>
      <div className="grid grid-cols-4 gap-3 mt-6">
        {mnemonics?.map((elem, i) => {
          return (
            <div key={elem + i}>
              <Tag text={`${i + 1}. ${elem}`} />
            </div>
          );
        })}
      </div>
      <div>
        <Link
          className="mt-6 block text-center rounded-md bg-brand-forest-600 shadow-sm p-[.625rem] font-semibold text-white"
          to="/confirm-mnemonic"
        >
          {intl.formatMessage({ id: 'ok-I-saved' })}
        </Link>
      </div>
    </div>
  );
};

export default CreateMnemonic;
