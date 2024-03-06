import { Link } from 'react-router-dom';
import { Alert, ListGroup } from 'react-bootstrap';
import Card from 'src/components/Card';
import Icon from 'src/components/Icon';
import { useAppContext } from 'src/store';
import { beautifyText } from 'src/utilities';
import styles from './index.module.scss';
import cn from 'classnames';

function Home() {
  const { state } = useAppContext();
  const { credentials, verification } = state || {};

  return (
    <>
      {!verification && (
        <Alert variant="warning" className={styles['alert']}>
          <Alert.Heading className="fw-bold">Verfication Required</Alert.Heading>
          <p>
            Your identity verification has either not been submitted or is still pending approval. During this period,
            your wallet will not able to accept any verifiable credit.
          </p>
          <hr />
          <p className="mb-0">
            Please check your verification status{' '}
            <Link to="/verify" className="fw-bold">
              here
            </Link>
            .
          </p>
        </Alert>
      )}
      <div className={cn(styles['home'], !verification && styles['home--alert'])}>
        <Card containerClassName={styles['card__container']}>
          <div className={styles['card__header']}>
            Credentials
            <Icon name="bell" />
          </div>
          <div className={styles['card__content']}>
            {credentials.length ? (
              <ListGroup>
                {credentials.map(credential => (
                  <ListGroup.Item key={credential.id}>
                    <ListGroup>
                      {credential.claims.map(claim =>
                        Object.keys(claim)
                          .filter(field => field !== 'id')
                          .map((field, i) => (
                            <p
                              key={`field${i}`}
                              className="text-lg fw-bold text-gray-500 lg:text-xl dark:text-gray-400"
                            >
                              {beautifyText(field)}: <span className="fw-normal">{claim[field]}</span>
                            </p>
                          )),
                      )}
                    </ListGroup>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className={styles['card__empty']}>
                <Icon name="shield-tick" className={styles['card__icon']} />
                You will see credentials here once you accept them
              </div>
            )}
          </div>
          <div className={styles['card__footer']}>
            <div className={styles['card__nav']}>
              <Icon name="shield-tick" />
              Credentials
            </div>
            <div className={styles['card__nav']}>
              <Icon name="settings" />
              Settings
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

export default Home;
