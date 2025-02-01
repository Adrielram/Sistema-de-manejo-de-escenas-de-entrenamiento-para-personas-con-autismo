import React from "react";

interface Item {
  id: number;
  [key: string]: string | number | boolean | undefined;
}

interface VisualListProps {
  selectedItems: Item[];
  unselectedItems: Item[];
  getItemLabel: (item: Item) => string;
  item_type: string;
  label_selected: string;
  label_unselected: string;
}

const VisualList = ({
  selectedItems,
  unselectedItems,
  getItemLabel,
  item_type,
  label_selected,
  label_unselected,
}: VisualListProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h3 className="font-semibold text-gray-700 mb-6 text-lg">{item_type}</h3>

      {/* Lista combinada */}
      <div className="space-y-4">
        {selectedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 border border-blue-100 bg-blue-50 rounded-lg shadow-sm"
          >
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-3"></div>
            <span className="text-blue-700 font-medium">
                {getItemLabel(item)}{/* (Seleccionado) */}
            </span>
          </div>
        ))}

        {unselectedItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 border border-gray-200 bg-gray-50 rounded-lg shadow-sm"
          >
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-3"></div>
            <span className="text-gray-700 font-medium">
                {getItemLabel(item)}{/* (No seleccionado) */}
            </span>
          </div>
        ))}
      </div>

      {/* Contadores */}
      <div className="mt-6 flex justify-between text-sm text-gray-500">
        <div>
          <span className="font-semibold">{label_selected}:</span> {selectedItems.length}
        </div>
        <div>
          <span className="font-semibold">{label_unselected}:</span> {unselectedItems.length}
        </div>
      </div>
    </div>
  );
};

export default VisualList;
