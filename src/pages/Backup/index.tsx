import { Button } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import NavigationBar from 'src/containers/NavigationBar';
import { useBackup } from './index.services';
import styles from './index.module.scss';

function Backup() {
  const { translate, navigate, register, errors, handleSubmit, onSubmit, errorMessage } = useBackup();

  return (
    <form className="h-100 d-flex align-items-center justify-content-center" onSubmit={handleSubmit(onSubmit)}>
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          <div className={styles['back']} onClick={() => navigate('/settings')}>
            <Icon name="chevron-left" />
            {translate('backup-back-link')}
          </div>
        </div>
        <div className={styles['card__content']}>
          <div className={styles['title']}>
            <h4 className={styles['title--bold']}>{translate('backup-title')}</h4>
            {translate('backup-subtitle')}
          </div>
          <Input
            register={register}
            name="newPass"
            label={`${translate('backup-form.new-pass-label')}*`}
            type="password"
            placeholder={translate('backup-form.new-pass-placeholder')}
            hasPostfixIcon
            hintMessage={translate('backup-form.new-pass-hint')}
            errorMessage={errors['newPass']?.message ? errors['newPass'].message.toString() : ''}
          />
          <Input
            register={register}
            name="confirmPass"
            label={`${translate('backup-form.confirm-pass-label')}*`}
            type="password"
            placeholder={translate('backup-form.confirm-pass-placeholder')}
            hasPostfixIcon
            errorMessage={errors['confirmPass']?.message ? errors['confirmPass'].message.toString() : ''}
          />
        </div>
        <span className={styles['error']}>{errorMessage}</span>
        <Button variant="primary" type="submit" className={styles['button']}>
          {translate('backup-form.button')}
        </Button>
        <NavigationBar />
      </Card>
    </form>
  );
}

export default Backup;
