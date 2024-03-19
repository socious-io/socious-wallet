import CreatedCard from 'src/containers/CreatedCard';
import useCreated from './index.services';

function Created() {
  const { cardContent } = useCreated();
  return (
    <div className="h-100 d-flex align-items-center justify-content-center">
      <CreatedCard {...cardContent} />
    </div>
  );
}

export default Created;
