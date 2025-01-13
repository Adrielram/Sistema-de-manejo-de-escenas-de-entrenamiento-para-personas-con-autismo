import React from "react";

interface Item {
  id: number;
  selected?: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface SingleSearchSelectBoxProps {
  title: string;
  items: Item[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSelectItem: (id: number) => void;
  selectedItemId: number | null;
  searchPlaceholder: string;
  getItemLabel: (item: Item) => string;
}

const SingleSearchSelectBox = ({
  title,
  items = [],
  searchValue,
  onSearchChange,
  onSelectItem,
  selectedItemId,
  searchPlaceholder,
  getItemLabel,
}: SingleSearchSelectBoxProps) => {
  const hasItems = Array.isArray(items) && items.length > 0;

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
          className="w-full pl-4 py-2 border text-gray-800 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3EA5FF]"
        />
      </div>

      {/* Lista scrolleable */}
      <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
        {!hasItems && (
          <div className="text-gray-500 text-center py-4">
            No hay elementos disponibles
          </div>
        )}
        
        {hasItems && items.map((item) => (
          <div
            key={item.id}
            className={`flex items-center p-3 border border-gray-100 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer ${
              selectedItemId === item.id ? 'bg-blue-50' : ''
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
                selectedItemId === item.id ? 'font-bold' : 'font-normal'
              }`}
            >
              {getItemLabel(item)}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SingleSearchSelectBox;