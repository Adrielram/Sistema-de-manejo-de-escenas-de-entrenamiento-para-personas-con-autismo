import React, { useEffect, useState } from "react";

interface Item {
  id: number;
  [key: string]: string | number | boolean | undefined;
}

interface MultiSearchSelectBoxProps {
  title: string;
  searchPlaceholder: string;
  getItemLabel: (item: Item) => string;
  selectedItems: Item[];
  onSelectItems: (items: Item[]) => void;
  apiUrl: string; // URL para la API de búsqueda
  resetTrigger?: boolean; // Nuevo prop para indicar cuándo resetear el componente

}

const SearchSelectBox = ({
  title,
  searchPlaceholder,
  getItemLabel,
  selectedItems,
  onSelectItems,
  apiUrl,
  resetTrigger, // Nuevo prop

}: MultiSearchSelectBoxProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Efecto para resetear el componente cuando se activa resetTrigger
  useEffect(() => {
    if (resetTrigger) {
      setSearchValue(""); // Limpia el valor del campo de búsqueda
      setItems([]); // Limpia los ítems cargados
    }
  }, [resetTrigger]);

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

    if (searchValue.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        fetchItems();
      }, 300); // Debounce de 300ms

      return () => clearTimeout(delayDebounceFn);
    } else {
      setItems([]);
    }
  }, [searchValue, apiUrl]);

  // Maneja la selección o deselección de un ítem
  const handleSelectItem = (item: Item) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    if (isSelected) {
      // Deseleccionar
      onSelectItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      // Seleccionar
      onSelectItems([...selectedItems, item]);
    }
  };

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

        {items.map((item) => {
          const isSelected = selectedItems.some((selected) => selected.id === item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${
                isSelected ? "bg-blue-50" : ""
              }`}
              onClick={() => handleSelectItem(item)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectItem(item)}
                className="w-4 h-4 accent-[#3EA5FF] cursor-pointer"
              />
              <label
                className={`ml-3 text-gray-800 cursor-pointer ${
                  isSelected ? "font-bold" : "font-normal"
                }`}
              >
                {getItemLabel(item)}
              </label>
            </div>
          );
        })}
      </div>

      {/* Escenas seleccionadas */}
      {selectedItems.length > 0 && (
      <div className="mt-4">    
        <h4 className="font-semibold text-gray-700 mb-2">Escenas seleccionadas:</h4>      
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <div
              key={item.id}
              className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-100 flex items-center gap-2"
            >
              {getItemLabel(item)}
              <button
                onClick={() => handleSelectItem(item)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default SearchSelectBox;
