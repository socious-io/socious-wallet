import { ListGroup, Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAppState } from 'src/store';

function Home() {
  const { credentials, verification } = useAppState();

  return (
    <>
      {!verification && (
        <Alert variant="warning">
          <Alert.Heading>Verfication needed</Alert.Heading>
          <p>
            Your identity verification has either not been submitted or is still pending approval. During this period,
            your wallet will be unable to accept any verifiable credentials.
          </p>
          <hr />
          <p className="mb-0">
            please check your verification status <Link to="/verify"> here </Link>
          </p>
        </Alert>
      )}
      <h1>Credentials</h1>
      <ListGroup>
        {credentials.map((c) => (
          <ListGroup.Item key={c.id}>
            <ListGroup>
              {c.claims.map((claim, claimIndex) =>
                Object.keys(claim)
                  .filter((field) => field !== 'id')
                  .map((field, i) => (
                    <p key={`field${i}`} className="text-lg font-normal text-gray-500 lg:text-xl  dark:text-gray-400">
                      {field.replaceAll('_', ' ')} : <span>{claim[field]}</span>
                    </p>
                  )),
              )}
            </ListGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
}

export default Home;
