import { useState, useEffect } from "react";

/**
 * Custom Hook para sincronizar el estado de React con localStorage.
 *
 * @param key La clave para almacenar en localStorage.
 * @param initialValue El valor inicial si no hay datos en localStorage.
 * @returns [value, setValue]
 */
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // 1. Obtener el valor inicial desde localStorage o usar el valor por defecto
  const [value, setValue] = useState<T>(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        return JSON.parse(storedValue);
      }
      return initialValue;
    } catch (error) {
      console.error(`Error al leer localStorage para la clave "${key}":`, error);
      return initialValue;
    }
  });

  // 2. Usar useEffect para sincronizar el estado con localStorage cada vez que 'value' cambia
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error al escribir en localStorage para la clave "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;