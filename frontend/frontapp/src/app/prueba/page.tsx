"use client"

import React, { useState } from "react";
import SearchSelectBox from "../../components/SearchSelectBox";

const App = () => {
  const [searchValue, setSearchValue] = useState("");
  const [items, setItems] = useState([
    { id: 1, seleccionado: false, nombre: "Elemento 1" },
    { id: 2, seleccionado: false, nombre: "Elemento 2" },
    { id: 3, seleccionado: false, nombre: "Elemento 3" },
    { id: 4, seleccionado: false, nombre: "Elemento 4" },
    { id: 5, seleccionado: false, nombre: "Elemento 5" },
  ]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleToggleItem = (id: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
      )
    );
  };

  return (
    <div className="p-6">
      <SearchSelectBox
        title="Selecciona elementos"
        items={items.filter((item) =>
          item.nombre.toLowerCase().includes(searchValue.toLowerCase())
        )}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onToggleItem={handleToggleItem}
        searchPlaceholder="Buscar..."
        getItemLabel={(item) => String(item.nombre)}
        />
    </div>
  );
};

export default App;
