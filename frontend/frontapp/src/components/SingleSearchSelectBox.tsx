import React, { useEffect, useState, useCallback } from "react";

interface Item {
  id: number;
  selected?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface SingleSearchSelectBoxProps {
  title: string;
  searchPlaceholder: string;
  getItemLabel: (item: Item) => string;
  selectedItemId: number | unknown[] | null;
  onSelectItem: (id: number | null) => void;
  apiUrl: string;
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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(async (resetResults = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}?nombre=${encodeURIComponent(searchValue)}&page=${page}&limit=4`
      );
      if (!response.ok) {
        throw new Error("Error al cargar las escenas.");
      }
      const data = await response.json();
      
      // Update items based on whether we're resetting or loading more
      setItems(prevItems => 
        resetResults ? data.results : [...prevItems, ...data.results]
      );
      
      // Check if there are more results
      setHasMore(data.next !== null);
    } catch (err) {
      console.error("Error fetching items:", err);
      setError("Error al cargar las escenas.");
    } finally {
      setLoading(false);
    }
  }, [searchValue, apiUrl, page]);

  // Effect to fetch items when search value changes
  useEffect(() => {
    // Reset page and fetch fresh results
    setPage(1);
    setHasMore(true);
    
    if (searchValue.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        fetchItems(true);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setItems([]); // Clear results if no search
    }
  }, [searchValue, fetchItems]);

  // Handle infinite scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    
    if (scrollHeight - scrollTop === clientHeight && hasMore && !loading) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">{title}</h3>

      {/* Search input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        />
      </div>

      {/* Scrollable list with infinite scroll */}
      <div 
        className="space-y-3 max-h-64 overflow-y-auto pr-2"
        onScroll={handleScroll}
      >
        {!loading && items.length === 0 && !error && (
          <div className="text-gray-500 text-center py-4">
            Busca Escenas! 🚀
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

        {/* Loading indicator for more results */}
        {loading && (
          <div className="text-center text-gray-500 py-2">
            Cargando más...
          </div>
        )}

        {/* No more results indicator */}
        {!hasMore && items.length > 0 && (
          <div className="text-center text-gray-500 py-2">
            No hay más resultados
          </div>
        )}
      </div>

      {/* Selected item section */}
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