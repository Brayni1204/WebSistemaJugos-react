import { useParams } from 'react-router-dom';

const GenericPage = () => {
  const { slug } = useParams();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Página: {slug}</h1>
      <p>El contenido de la página dinámica irá aquí.</p>
    </div>
  );
};

export default GenericPage;
