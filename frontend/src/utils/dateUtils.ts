import { format, parseISO, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import { es } from 'date-fns/locale';

// Zona horaria de San Miguel de Allende (México)
export const TIMEZONE = 'America/Mexico_City';

// Formatear fecha completa para mostrar
export const formatEventDate = (dateString: string): string => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = parseISO(dateString);
    const zonedDate = utcToZonedTime(date, TIMEZONE);
    return format(zonedDate, "EEEE d 'de' MMMM 'de' yyyy 'a las' h:mm a", { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

// Formatear solo fecha (sin hora)
export const formatEventDateOnly = (dateString: string): string => {
  if (!dateString) return 'Fecha no disponible';
  try {
    const date = parseISO(dateString);
    const zonedDate = utcToZonedTime(date, TIMEZONE);
    return format(zonedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Fecha inválida';
  }
};

// Formatear solo hora
export const formatEventTime = (dateString: string): string => {
  if (!dateString) return 'Hora no disponible';
  try {
    const date = parseISO(dateString);
    const zonedDate = utcToZonedTime(date, TIMEZONE);
    return format(zonedDate, "h:mm a", { locale: es });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Hora inválida';
  }
};

// Convertir fecha local a UTC para guardar en base de datos
export const localToUTC = (localDate: Date): Date => {
  return zonedTimeToUtc(localDate, TIMEZONE);
};

// Obtener fecha actual en zona horaria local
export const getCurrentLocalDate = (): Date => {
  return utcToZonedTime(new Date(), TIMEZONE);
};

// Formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = parseISO(dateString);
    const zonedDate = utcToZonedTime(date, TIMEZONE);
    return format(zonedDate, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    return '';
  }
};