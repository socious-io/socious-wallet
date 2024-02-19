import SocioLogo from '@/components/svg/SocioLogo';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

const Landing = () => {
  const intl = useIntl();

  return (
    <div className="bg-white dark:bg-gray-950 w-[27.5rem] rounded-xl shadow-sm mt-24 mx-auto">
      <div className="h-[20.75rem] pt-8 flex flex-col items-center justify-center px-8">
        <SocioLogo />
        <h1 className="font-semibold text-2xl mt-6 dark:text-gray-50">{intl.formatMessage({ id: 'welcome' })}</h1>
        <p className="text-center mt-2 text-gray-500 dark:text-gray-400">
          {intl.formatMessage({ id: 'to-get-started' })}
        </p>
      </div>
      <div className="px-8 py-6">
        <div>
          <Link
            className="mt-6 block text-center rounded-md bg-brand-forest-600 shadow-sm p-[.625rem] font-semibold text-white"
            to="/create-mnemonic"
          >
            {intl.formatMessage({ id: 'create-new-wallet' })}
          </Link>
        </div>
        <div className="mt-4">
          <Link
            className="block text-center rounded-md text-gray-600 dark:text-gray-500 p-[.625rem] font-semibold"
            to="/confirm-mnemonic"
          >
            {intl.formatMessage({ id: 'already-have-wallet' })}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
