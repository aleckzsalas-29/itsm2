import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Extrae el mensaje de error de una respuesta de API
 * Maneja tanto errores simples como arrays de errores de validación de Pydantic
 */
export const getErrorMessage = (error, defaultMessage = 'Ha ocurrido un error') => {
  if (!error.response?.data?.detail) {
    return defaultMessage;
  }

  const detail = error.response.data.detail;

  // Si es un string, retornarlo directamente
  if (typeof detail === 'string') {
    return detail;
  }

  // Si es un array de errores de validación de Pydantic
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const field = err.loc ? err.loc.join('.') : 'campo';
      return `${field}: ${err.msg}`;
    }).join(', ');
  }

  // Si es un objeto, intentar stringificarlo
  if (typeof detail === 'object') {
    return JSON.stringify(detail);
  }

  return defaultMessage;
};
