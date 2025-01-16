import React from 'react';

interface Item {
  dni: string;
  nombre: string;
}

interface AssociatedListProps {
  title: string;
  items: Item[];
  onRemove: (id: string) => void;
  style?: React.CSSProperties;  // Añadir la propiedad 'style' de tipo React.CSSProperties
}

const AssociatedList: React.FC<AssociatedListProps> = ({ title, items, onRemove, style }) => {
  return (
    <div
      className="associated-list"
      style={{
        background: "#fff", // Fondo blanco agregado
        padding: "15px",    // Opcional: para darle un margen interno
        borderRadius: "8px", // Opcional: esquinas redondeadas
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Opcional: un toque visual
        ...style,           // Combina el estilo recibido con el fondo blanco
      }}
    >
      <h2 className="title">{title}</h2>
      <hr className="line" />
      <ul className="items-list">
        {items.map(item => {
          // Determinar si se usa 'dni' o 'id'
          const key = item.dni ? 'dni' : 'id';

          return (
            <li key={item[key]} className="list-item">
              <span>{item.nombre}</span>
              <button
                className="delete-button"
                onClick={() => onRemove(item[key])} // Usar la clave correcta para eliminar
                aria-label={`Eliminar ${item.nombre}`}
              >
                🗑️
              </button>
            </li>
          );
        })}
      </ul>
      <div className="pagination">
        <button className="pagination-button">Anterior</button>
        <button className="pagination-button">Siguiente</button>
      </div>
      <style jsx>{`
        .associated-list {
          font-family: Arial, sans-serif;
          color: black;
        }
        .title {
          font-size: 1.2rem;
          margin-bottom: 5px;
        }
        .line {
          border: none;
          height: 3px; /* Línea más robusta */
          background-color: #f6512b; /* Color naranja */
          margin-bottom: 10px;
        }
        .items-list {
          list-style: none;
          padding: 0;
          margin: 0 0 10px;
        }
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 0;
        }
        .delete-button {
          background: none;
          border: none;
          color: red;
          cursor: pointer;
          font-size: 1rem;
        }
        .pagination {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .pagination-button {
          padding: 5px 15px;
          background-color: #f6512b; /* Color naranja */
          border: none;
          border-radius: 25px; /* Botones redondeados */
          color: white;
          font-size: 0.9rem;
          font-weight: bold;
          cursor: pointer;
          transition: background-color 0.3s;
        }
        .pagination-button:hover {
          background-color: #d94421; /* Naranja más oscuro al pasar el mouse */
        }
      `}</style>
    </div>
  );
};

export default AssociatedList;
