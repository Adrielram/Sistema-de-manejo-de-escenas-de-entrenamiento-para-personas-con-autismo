import React from "react";

interface Item {
  id: number;
  seleccionado: boolean;
  [key: string]: string | number | boolean; // Permitir id y seleccionado junto con otras claves tipo string
}


interface SearchSelectBoxProps {
  title: string;
  items: Item[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onToggleItem: (id: number) => void;
  searchPlaceholder: string;
  getItemLabel: (item: Item) => string;
}

const SearchSelectBox = ({
  title,
  items,
  searchValue,
  onSearchChange,
  onToggleItem,
  searchPlaceholder,
  getItemLabel,
}: SearchSelectBoxProps) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 text-lg">{title}</h3>
      
      {/* Buscador */}
      <div className="relative mb-4">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-4  py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        />
      </div>

      {/* Lista scrolleable */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2 ">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={item.seleccionado}
              onChange={() => onToggleItem(item.id)}
              className="w-4 h-4 text-[#3EA5FF] border-gray-300 rounded focus:ring-[#3EA5FF]"
            />
            <label className="ml-3 text-gray-800">{getItemLabel(item)}</label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSelectBox;
