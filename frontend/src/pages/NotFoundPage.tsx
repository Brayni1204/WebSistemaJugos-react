import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="container mx-auto p-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl">Página no encontrada</p>
      <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFoundPage;
