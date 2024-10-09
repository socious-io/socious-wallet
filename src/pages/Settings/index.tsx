import NavigationBar from 'src/containers/NavigationBar';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import ConfirmModal from 'src/components/ConfirmModal';
import PopupModal from 'src/components/PopupModal';
import useSettings from './index.services';
import styles from './index.module.scss';
import cn from 'classnames';

function Settings() {
  const {
    translate,
    settingsItems,
    languages,
    isSystemLanguage,
    onChangeLanguage,
    openModal,
    handleCloseModal,
    handleRemoveWallet,
  } = useSettings();

  return (
    <>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
          <div className={styles['card__header']}>
            {translate('settings-card-header')}
            {/* <Icon name="bell" /> */}
          </div>
          <div className={styles['card__content']}>
            {settingsItems.map(item => (
              <div key={item.title} className={cn(styles['settings'], item.action && 'pointer')} onClick={item.action}>
                <div className={styles['item']}>
                  {item.title}
                  {item.subtitle && <span className={styles['item__subtitle']}>{item.subtitle}</span>}
                </div>
                {item.value && (
                  <div className={styles['value']}>
                    {item.value}
                    <Icon name="chevron-right" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <NavigationBar />
        </Card>
      </div>
      <ConfirmModal
        open={openModal.name === 'remove' && openModal.open}
        onClose={handleCloseModal}
        closeButton={false}
        headerClassName="pb-1 d-flex flex-column gap-3 align-items-start font-size-lg"
        contentClassName="py-0 text-gray font-size-md"
        header={translate('settings-confirm.header')}
        headerIcon={<Icon name="alert-triangle-danger" className={styles['alert--danger']} />}
        buttons={[
          {
            children: translate('settings-confirm.remove-button'),
            variant: 'danger',
            className: 'fw-semibold',
            onClick: handleRemoveWallet,
          },
          {
            children: translate('settings-confirm.cancel-button'),
            variant: 'light',
            className: 'fw-semibold',
            onClick: handleCloseModal,
          },
        ]}
        footerClassName="d-flex flex-column align-items-stretch"
      >
        {translate('settings-confirm.title')}
      </ConfirmModal>
      <PopupModal
        open={openModal.name === 'language' && openModal.open}
        onClose={handleCloseModal}
        header="Select language"
      >
        <div className="d-flex flex-column">
          {languages.map(lang => (
            <div key={lang.value} className={styles['lang']} onClick={() => onChangeLanguage(lang.value)}>
              {lang.label}{' '}
              <span className={styles['lang--lighter']}>
                {isSystemLanguage(lang.system) ? '(system)' : lang.original}
              </span>
            </div>
          ))}
        </div>
      </PopupModal>
    </>
  );
}

export default Settings;
