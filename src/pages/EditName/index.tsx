import { Button } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import Input from 'src/components/Input';
import NavigationBar from 'src/containers/NavigationBar';
import { useEditName } from './index.services';
import styles from './index.module.scss';

function EditName() {
  const { translate, register, errors, handleSubmit, onSubmit, disabled, goBack } = useEditName();

  return (
    <form className="h-100 d-flex align-items-center justify-content-center" onSubmit={handleSubmit(onSubmit)}>
      <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
        <div className={styles['card__header']}>
          <div className={styles['back']} onClick={goBack}>
            <Icon name="chevron-left" />
            {translate('edit-name-back-link')}
          </div>
        </div>
        <div className={styles['card__content']}>
          <div className={styles['title']}>
            <h4 className={styles['title--bold']}>{translate('edit-name-title')}</h4>
            {translate('edit-name-subtitle')}
          </div>
          <Input
            register={register}
            placeholder={translate('edit-name-form.firstname-placeholder')}
            name="firstname"
            errorMessage={errors['firstname']?.message ? errors['firstname'].message.toString() : ''}
          />
          <Input
            register={register}
            placeholder={translate('edit-name-form.lastname-placeholder')}
            name="lastname"
            errorMessage={errors['lastname']?.message ? errors['lastname'].message.toString() : ''}
          />
        </div>
        <Button variant="primary" type="submit" className={styles['button']} disabled={disabled}>
          {translate('edit-name-form.button')}
        </Button>
        <NavigationBar />
      </Card>
    </form>
  );
}

export default EditName;
