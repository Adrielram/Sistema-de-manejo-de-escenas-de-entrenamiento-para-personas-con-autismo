import React, { useEffect, useState } from "react";

interface Item {
  id: number;
  selected?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface SingleSearchSelectBoxProps {
  title: string;
  searchPlaceholder: string;
  getItemLabel: (item: Item) => string;
  selectedItemId: number | null;
  onSelectItem: (id: number | null) => void;
  apiUrl: string; // URL para la API de escenas
}

const SingleSearchSelectBox = ({
  title,
  searchPlaceholder,
  getItemLabel,
  selectedItemId,
  onSelectItem,
  apiUrl,
}: SingleSearchSelectBoxProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch items cuando searchValue cambia
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}?nombre=${encodeURIComponent(searchValue)}`);
        if (!response.ok) {
          throw new Error("Error al cargar las escenas.");
        }
        const data = await response.json();
        setItems(data.results || []);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Error al cargar las escenas.");
      } finally {
        setLoading(false);
      }
    };

    // Llamar al backend si hay un valor de búsqueda
    if (searchValue.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        fetchItems();
      }, 300); // Debounce de 300ms

      return () => clearTimeout(delayDebounceFn); // Limpiar timeout en cada cambio
    } else {
      setItems([]); // Limpiar resultados si no hay búsqueda
    }
  }, [searchValue, apiUrl]);

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">{title}</h3>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        />
      </div>

      {/* Estado de carga */}
      {loading && <p className="text-gray-500 text-center">Cargando...</p>}

      {/* Mensaje de error */}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Lista scrolleable */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {!loading && items.length === 0 && !error && (
          <div className="text-gray-500 text-center py-4">
            No hay elementos disponibles
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${
              selectedItemId === item.id ? "bg-blue-50" : ""
            }`}
            onClick={() => onSelectItem(item.id)}
          >
            <input
              type="radio"
              checked={selectedItemId === item.id}
              onChange={() => onSelectItem(item.id)}
              className="w-4 h-4 accent-[#3EA5FF] cursor-pointer"
            />
            <label
              className={`ml-3 text-gray-800 cursor-pointer ${
                selectedItemId === item.id ? "font-bold" : "font-normal"
              }`}
            >
              {getItemLabel(item)}
            </label>
          </div>
        ))}
      </div>

      {/* Escena seleccionada */}
      {selectedItemId && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-gray-800 font-medium">
              Seleccionado: {getItemLabel(items.find((item) => item.id === selectedItemId)!)}
            </p>
            <button
              onClick={() => onSelectItem(null)}
              className="text-red-500 hover:underline text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleSearchSelectBox;
