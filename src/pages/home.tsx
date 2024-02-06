import { ListGroup } from 'react-bootstrap';
import { useAppState } from 'src/store';

function Home() {
  const state = useAppState();

  return (
    <ListGroup>
      {state.credentials.map((c) => (
        <ListGroup.Item key={c.id}>{c.subject}</ListGroup.Item>
      ))}
    </ListGroup>
  );
}

export default Home;
