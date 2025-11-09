// Interfaz para errores de validación de FastAPI/Pydantic
interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: any;
  ctx?: any;
}

/**
 * Formatea errores de la API para mostrarlos en toasts
 * Soporta tanto errores simples (string) como errores de validación (array)
 */
export function formatAPIError(error: any): string {
  // Si es un error simple de JavaScript
  if (error instanceof Error) {
    return error.message;
  }

  // Si no tiene detail, devolver mensaje genérico
  if (!error || !error.detail) {
    return "Error desconocido";
  }

  const detail = error.detail;

  // Si detail es un string, devolverlo directamente
  if (typeof detail === "string") {
    return detail;
  }

  // Si detail es un array de errores de validación
  if (Array.isArray(detail)) {
    // Formatear cada error de validación
    const formattedErrors = detail.map((err: ValidationError) => {
      // Obtener el campo que falló (último elemento de loc)
      const field = err.loc[err.loc.length - 1];
      // Formatear el campo de manera más amigable
      const fieldName = typeof field === "string" 
        ? field.charAt(0).toUpperCase() + field.slice(1) 
        : field;
      
      // Extraer mensaje limpio
      let message = err.msg;
      // Si el mensaje es "Value error, ..." extraer solo la parte después de la coma
      if (message.startsWith("Value error, ")) {
        message = message.replace("Value error, ", "");
      }
      
      return `${fieldName}: ${message}`;
    });

    // Unir todos los errores con saltos de línea
    return formattedErrors.join("\n");
  }

  return "Error en la petición";
}

/**
 * Maneja errores de respuesta de fetch y los formatea
 */
export async function handleAPIError(response: Response): Promise<string> {
  try {
    const errorData = await response.json();
    return formatAPIError(errorData);
  } catch {
    // Si no se puede parsear el JSON, devolver el status
    return `Error ${response.status}: ${response.statusText}`;
  }
}
