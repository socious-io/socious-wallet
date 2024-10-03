import { Navigate } from 'react-router-dom';
import Card from 'src/components/Card';
import { useEnterPass } from './index.services';
import styles from './index.module.scss';
import Input from 'src/components/Input';

function EnterPass() {
  const { translate, navigate, did, encrypted, register, errors, password, handleSubmit, onSubmit, errorMessage } =
    useEnterPass();

  if (did) return <Navigate to="/" />;
  else if (!encrypted) return <Navigate to="/import" />;
  return (
    <form className="h-100 d-flex align-items-center justify-content-center" onSubmit={handleSubmit(onSubmit)}>
      <Card
        contentClassName="justify-content-start align-items-stretch pt-5 text-center gap-4"
        buttons={[
          {
            children: translate('enter-pass-continue-button'),
            variant: 'primary',
            type: 'submit',
            disabled: !password,
            className: 'fw-semibold w-100 py-2',
          },
          {
            children: translate('enter-pass-back-button'),
            variant: 'light',
            className: 'fw-semibold w-100 py-2',
            onClick: () => navigate('/import'),
          },
        ]}
      >
        <div className="d-flex flex-column gap-2">
          <h4 className={styles['title']}>{translate('enter-pass-title')}</h4>
          <span className={styles['subtitle']}>{translate('enter-pass-subtitle')}</span>
        </div>
        <Input
          register={register}
          name="password"
          type="password"
          placeholder={translate('enter-pass-form.input-placeholder')}
          hasPostfixIcon
          errorMessage={errors['password']?.message ? errors['password'].message.toString() : ''}
        />
        {errorMessage && <span className={styles['error']}>{errorMessage}</span>}
      </Card>
    </form>
  );
}

export default EnterPass;
