import { Button } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import NavigationBar from 'src/containers/NavigationBar';
import { useBackup } from './index.services';
import styles from './index.module.scss';

function EnterName() {
  const { translate, register, errors, handleSubmit, onSubmit, disabled } = useBackup();

  return (
    <form className="h-100 d-flex align-items-center justify-content-center" onSubmit={handleSubmit(onSubmit)}>
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}></div>
        <div className={styles['card__content']}>
          <div className={styles['title']}>
            <h4 className={styles['title--bold']}>{translate('enter-name-title')}</h4>
            {translate('enter-name-subtitle')}
          </div>
          <Input
            register={register}
            placeholder={translate('enter-name-form.firstname-placeholder')}
            name="firstname"
            errorMessage={errors['firstname']?.message ? errors['firstname'].message.toString() : ''}
          />
          <Input
            register={register}
            placeholder={translate('enter-name-form.lastname-placeholder')}
            name="lastname"
            errorMessage={errors['lastname']?.message ? errors['lastname'].message.toString() : ''}
          />
        </div>
        <Button variant="primary" type="submit" className={styles['button']} disabled={disabled}>
          {translate('enter-name-form.button')}
        </Button>
        <Button variant="light" className={styles['button-back']}>
          {translate('enter-name-form.button-back')}
        </Button>
        <NavigationBar />
      </Card>
    </form>
  );
}

export default EnterName;
