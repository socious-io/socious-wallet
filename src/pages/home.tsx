import { ListGroup } from 'react-bootstrap';
import { useAppState } from 'src/store';

function Home() {
  const { credentials } = useAppState();

  return (
    <>
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
