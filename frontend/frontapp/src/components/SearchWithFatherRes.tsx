'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from './Buscador';

interface Padre {
  dni: number;
  nombre: string;
}

interface SearchWithResultsProps {
  onPadreSeleccionado: (dni: number) => void;
}

const SearchWithFatherRes: React.FC<SearchWithResultsProps> = ({ onPadreSeleccionado }) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<Padre[]>([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (query) {
      buscarPadres(query, 1);
    } else {
      setResultados([]);
      setHasMore(true);
    }
  }, [query]);

  const buscarPadres = async (searchQuery: string, page: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/buscar_padres/?query=${searchQuery}&page=${page}`);
      if (!response.ok) {
        throw new Error('Error al obtener los datos');
      }

      const data = await response.json();

      if (page === 1) {
        setResultados(data.resultados);
      } else {
        setResultados((prev) => [...prev, ...data.resultados]);
      }

      setHasMore(data.resultados.length > 0);
    } catch (error) {
      console.error('Error al buscar padres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && hasMore && !loading) {
      const nextPage = pagina + 1;
      setPagina(nextPage);
      buscarPadres(query, nextPage);
    }
  };

  return (
    <div>
      <SearchBar onSearch={setQuery} placeholder="Buscar Padre" />
      <div
        className="max-h-52 overflow-y-auto mt-2 border border-gray-300 p-2"
        onScroll={handleScroll}
      >
        {resultados.map((padre) => (
          <div
            key={padre.dni}
            className="flex justify-between items-center mb-2"
          >
            <span className="text-black">
              {padre.nombre} - {padre.dni}
            </span>
            <input
              type="checkbox"
              className="ml-2"
              onChange={() => onPadreSeleccionado(padre.dni)}
            />
          </div>
        ))}
        {loading && <p className="text-gray-500">Cargando...</p>}
        {!hasMore && resultados.length > 0 && (
          <p className="text-gray-500">No hay más resultados</p>
        )}
      </div>
    </div>
  );
};

export default SearchWithFatherRes;
