/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { getPublicCategories, type Category } from '@/api/categoryApi';
import { getPublicEmpresa, type Empresa } from '@/api/empresaApi';
import { getPublicPaginas, type Pagina } from '@/api/paginaApi';
import CategoryCard from '@/components/categories/CategoryCard';
import { Link } from 'react-router-dom';


const HomePage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [paginas, setPaginas] = useState<Pagina[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Use the dedicated API functions for clarity and consistency
        const [catResponse, empresaData, paginasData] = await Promise.all([
            getPublicCategories({ limit: 6 }), // Assuming we want a limited number for the homepage
            getPublicEmpresa(),
            getPublicPaginas()
        ]);
        
        // Correctly handle the paginated response for categories
        setCategories(catResponse.data);
        setEmpresa(empresaData.length > 0 ? empresaData[0] : null);
        setPaginas(paginasData);
        
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Cargando...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="relative w-full min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video className="w-full h-full object-cover" autoPlay loop muted>
            <source src="/storage/Empresa/videojugo.mp4" type="video/mp4" />
            Tu navegador no soporta la reproducción de videos.
          </video>
        </div>
        <div className="relative z-10 bg-white bg-opacity-90 backdrop-blur-md shadow-2xl rounded-lg p-6 sm:p-10 w-[90%] max-w-xl text-center">
            {empresa ? (
                <>
                    <p className="text-gray-500 text-sm tracking-wide">Bienvenidos</p>
                    <h1 className="text-4xl font-bold text-gray-900 leading-tight mt-2">{empresa.nombre}</h1>
                    <p className="text-gray-700 mt-4 text-lg">{empresa.descripcion}</p>
                    <Link to="/nosotros" className="mt-6 inline-block bg-linear-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg text-lg font-semibold shadow-md hover:scale-105 hover:shadow-xl transition-all">
                        Más información
                    </Link>
                </>
            ) : (
                <p>Cargando información de la empresa...</p>
            )}
        </div>
      </div>
      
      {/* Pages Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {paginas.map(pagina => (
            <div key={pagina.id} className="my-8">
                <h2 className="text-2xl font-bold text-gray-900">{pagina.titulo_paginas}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center mt-4">
                    {pagina.subtitulos.length > 0 ? (
                        pagina.subtitulos.map(subtitulo => (
                            <Link key={subtitulo.id} to={`/${pagina.titulo_paginas}/${subtitulo.id}`} className="block bg-white p-6 shadow-lg rounded-lg border border-gray-200 text-center transform hover:scale-105 transition duration-300">
                                <div className="w-16 h-16 bg-blue-500 rounded-full overflow-hidden flex items-center justify-center mb-4 mx-auto">
                                    <img src={subtitulo.image.url} alt={subtitulo.titulo_subtitulo} className="w-full h-full object-cover rounded-full" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">{subtitulo.titulo_subtitulo}</h3>
                                <p className="text-gray-600 mb-4 text-sm text-ellipsis overflow-hidden w-full" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                    {subtitulo.resumen}
                                </p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center col-span-3">No hay subtítulos disponibles.</p>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Categories Section */}
      <h1 className="text-3xl font-bold text-gray-900 text-center py-8">Categorías de Productos</h1>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.length > 0 ? (
            categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))
          ) : (
            <p>No hay categorías para mostrar.</p>
          )}
        </div>
        {/* Pagination will be added later */}
      </div>
    </div>
  );
};

export default HomePage;