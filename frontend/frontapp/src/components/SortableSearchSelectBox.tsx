import React, { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SceneWithOrder } from "../types" // Tipo actualizado para incluir "order"

interface DraggableSearchSelectBoxProps {
  title: string;
  searchPlaceholder: string;
  getItemLabel: (item: SceneWithOrder) => string;
  selectedItems: SceneWithOrder[];
  onSelectItems: (items: SceneWithOrder[]) => void;
  apiUrl: string;
  resetTrigger?: boolean;
}

// Componente para cada item sortable
const SortableItem = ({
  item,
  getItemLabel,
  onRemove,
}: {
  item: SceneWithOrder;
  getItemLabel: (item: SceneWithOrder) => string;
  onRemove: (item: SceneWithOrder) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      className="bg-blue-50 text-blue-700 rounded-lg border border-blue-100 flex items-center justify-between mb-2"
      style={style}
    >
      <div 
        ref={setNodeRef}
        className="p-3 flex-1 cursor-move" // Aquí se aplica el padding
        {...attributes}
        {...listeners}
      >
        <span>{getItemLabel(item)}</span>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(item);
        }}
        className="text-red-500 hover:text-red-700 ml-2 pr-3"
      >
        ✕
      </button>
    </div>
  );
};

// Item regular para items no ordenables
const NonOrderableItem = ({
  item,
  getItemLabel,
  onRemove,
}: {
  item: SceneWithOrder;
  getItemLabel: (item: SceneWithOrder) => string;
  onRemove: (item: SceneWithOrder) => void;
}) => (
  <div className="bg-gray-50 text-gray-700 p-3 rounded-lg border border-gray-100 flex items-center justify-between mb-2">
    <span>{getItemLabel(item)}</span>
    <button
      onClick={() => onRemove(item)}
      className="text-red-500 hover:text-red-700 ml-2"
    >
      ✕
    </button>
  </div>
);

const DraggableSearchSelectBox = ({
  title,
  searchPlaceholder,
  getItemLabel,
  selectedItems,
  onSelectItems,
  apiUrl,
  resetTrigger,
}: DraggableSearchSelectBoxProps) => {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState<SceneWithOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Separar items ordenables y no ordenables
  const orderableItems = selectedItems.filter(item => item.order !== null)
    .sort((a, b) => a.order - b.order);
  const nonOrderableItems = selectedItems.filter(item => item.order === null);

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

  const handleSelectItem = (item: SceneWithOrder, isOrderable: boolean) => {
    const isSelected = selectedItems.some((selected) => selected.id === item.id);
    
    if (isSelected) {
      onSelectItems(selectedItems.filter((selected) => selected.id !== item.id));
    } else {
      const newItem = {
        ...item,
        order: isOrderable ? orderableItems.length : null
      };

      if (isOrderable) {
        onSelectItems([...orderableItems, newItem, ...nonOrderableItems]);
      } else {
        onSelectItems([...orderableItems, ...nonOrderableItems, newItem]);
      }
    }
  };

  const handleRemoveItem = (removedItem: SceneWithOrder) => {
    const remainingItems = selectedItems
      .filter(item => item.id !== removedItem.id)
      .map(item => {
        if (item.order === null) return item;
        return {
          ...item,
          order: item.order > (removedItem.order || 0) ? item.order - 1 : item.order
        };
      });

    onSelectItems(remainingItems);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = orderableItems.findIndex(item => item.id === active.id);
    const newIndex = orderableItems.findIndex(item => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedItems = arrayMove(orderableItems, oldIndex, newIndex)
      .map((item, index) => ({
        ...item,
        order: index
      }));

    onSelectItems([...reorderedItems, ...nonOrderableItems]);
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

      {!loading && items.length != 0 && !error && (
          <div className="text-gray-500 pb-4">Selecciona los items ordenables y no ordenables</div>
      )}

      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {!loading && items.length === 0 && !error && (
          <div className="text-gray-500 text-center py-4">Busca Algo! 🚀</div>
        )}

        {items.map((item) => {
          const isSelected = selectedItems.some((selected) => selected.id === item.id);
          return (
            <div
              key={item.id}
              className={`flex items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors ${
                isSelected ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex-1">
                {getItemLabel(item)}
              </div>
              {!isSelected && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSelectItem(item, true)}
                    className="bg-blue-200 hover:bg-blue-300 text-blue-700 py-1 px-2 rounded-full shadow-sm transition-all duration-200"
                  >
                    <span className="mr-1">📋</span> Ord.
                  </button>
                  <button
                    onClick={() => handleSelectItem(item, false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 py-1 px-2 rounded-full shadow-sm transition-all duration-200"
                  >
                    <span className="mr-1">✖️</span> No Ord.
                  </button>
              </div>
              )}
            </div>
          );
        })}
      </div>

      {(orderableItems.length > 0 || nonOrderableItems.length > 0) && (
        <div className="mt-6 space-y-4">
          {orderableItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Items Ordenables:</h4>
              <p className="text-gray-500 pb-4">Arrastra los items para ordenarlos ascendentemente hacia abajo</p>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={orderableItems.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {orderableItems.map((item) => (
                    <SortableItem
                      key={item.id}
                      item={item}
                      getItemLabel={getItemLabel}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          )}

          {nonOrderableItems.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">Items No Ordenables:</h4>
              {nonOrderableItems.map((item) => (
                <NonOrderableItem
                  key={item.id}
                  item={item}
                  getItemLabel={getItemLabel}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DraggableSearchSelectBox;
