import type { Category } from '@/api/categoryApi';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const defaultImage = 'https://placehold.co/600x400?text=Imagen+no+disponible';
  const imageUrl = category.imageUrl || defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 flex flex-col h-full">
      <img
        src={imageUrl}
        alt={category.nombre_categoria}
        className="w-full h-48 object-cover p-1 rounded-2xl"
      />
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {category.nombre_categoria}
        </h2>
        <p className="text-gray-600 mb-4 line-clamp-3">
          {category.descripcion || 'Sin descripción.'}
        </p>
        <div className="mt-auto flex justify-center">
          <a
            href={`/productos?categoria=${category.id}`}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 hover:scale-105 transition duration-300 shadow-md"
          >
            Ver Productos
          </a>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
