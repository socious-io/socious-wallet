import NavigationBar from 'src/containers/NavigationBar';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import ConfirmModal from 'src/components/ConfirmModal';
import useSettings from './index.services';
import styles from './index.module.scss';
import cn from 'classnames';

function Settings() {
  const { settingsItems, openModal, handleCloseModal, handleRemoveWallet } = useSettings();

  return (
    <>
      <div className="h-100 d-flex align-items-center justify-content-center">
        <Card containerClassName={styles['card__container']} contentClassName="gap-0 h-100">
          <div className={styles['card__header']}>
            Settings
            {/* <Icon name="bell" /> */}
          </div>
          <div className={styles['card__content']}>
            {settingsItems.map(item => (
              <div key={item.title} className={cn(styles['item'], item.action && 'pointer')} onClick={item.action}>
                {item.title}
                {item.subtitle && <span className={styles['item__subtitle']}>{item.subtitle}</span>}
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
        header="Remove wallet"
        headerIcon={<Icon name="alert-triangle-danger" className={styles['alert--danger']} />}
        buttons={[
          { children: 'Remove', variant: 'danger', className: 'fw-semibold', onClick: handleRemoveWallet },
          { children: 'Cancel', variant: 'light', className: 'fw-semibold', onClick: handleCloseModal },
        ]}
        footerClassName="d-flex flex-column align-items-stretch"
      >
        Removing your wallet cannot be undone. You will lose all the credentials with this wallet if you did not backup.
      </ConfirmModal>
    </>
  );
}

export default Settings;
