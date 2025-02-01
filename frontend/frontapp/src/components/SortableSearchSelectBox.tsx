import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
  apiUrl: string;
  resetTrigger?: boolean;
}

// Componente para cada item sorteable
const SortableItem = ({ item, getItemLabel, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-blue-50 text-blue-700 p-3 rounded-lg border border-blue-100 flex items-center justify-between mb-2 cursor-move"
      {...attributes}
      {...listeners}
    >
      <span className="flex-1">{getItemLabel(item)}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
        className="text-red-500 hover:text-red-700 ml-2"
      >
        ✕
      </button>
    </div>
  );
};

const DraggableSearchSelectBox = ({
  title,
  searchPlaceholder,
  getItemLabel,
  selectedItems,
  onSelectItems,
  apiUrl,
  resetTrigger,
}: MultiSearchSelectBoxProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (resetTrigger) {
      setSearchValue("");
      setItems([]);
    }
  }, [resetTrigger]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}?nombre=${encodeURIComponent(searchValue)}`);
        if (!response.ok) {
          throw new Error("Error al cargar los items.");
        }
        const data = await response.json();
        setItems(data.results || []);
      } catch (err) {
        console.error("Error fetching items:", err);
        setError("Error al cargar los items.");
      } finally {
        setLoading(false);
      }
    };

    if (searchValue.trim() !== "") {
      const delayDebounceFn = setTimeout(() => {
        fetchItems();
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setItems([]);
    }
  }, [searchValue, apiUrl]);

  const handleSelectItem = (item: Item) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    if (isSelected) {
      onSelectItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      onSelectItems([...selectedItems, item]);
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = selectedItems.findIndex((item) => item.id === active.id);
      const newIndex = selectedItems.findIndex((item) => item.id === over.id);
      
      onSelectItems(arrayMove(selectedItems, oldIndex, newIndex));
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">{title}</h3>

      <div className="mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        />
      </div>

      {loading && <p className="text-gray-500 text-center">Cargando...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {!loading && items.length === 0 && !error && (
          <div className="text-gray-500 text-center py-4">
            Busca Algo! 🚀
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

      {selectedItems.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-700 mb-2">Items seleccionados:</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={selectedItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {selectedItems.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  getItemLabel={getItemLabel}
                  onRemove={handleSelectItem}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default DraggableSearchSelectBox;