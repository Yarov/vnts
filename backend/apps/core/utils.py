"""
Utilidades comunes para todas las apps
"""
from datetime import datetime, time
from django.conf import settings
import pytz


def parse_date_filter(date_string):
    """
    Parsea una fecha del query param y retorna un rango de inicio/fin del día
    en la zona horaria configurada.
    
    Args:
        date_string: String de fecha en formato YYYY-MM-DD o ISO
        
    Returns:
        tuple: (start_of_day, end_of_day) como datetime timezone-aware
        None si hay error en el parseo
    """
    if not date_string:
        return None
        
    try:
        # Si viene en formato YYYY-MM-DD, parsearlo directamente
        if len(date_string) == 10 and '-' in date_string:
            year, month, day = date_string.split('-')
            filter_date = datetime(int(year), int(month), int(day))
        else:
            # Parsear fecha ISO con hora
            filter_date = datetime.fromisoformat(date_string.replace('Z', '+00:00'))
        
        # Convertir a timezone aware y filtrar por fecha en la zona horaria configurada
        tz = pytz.timezone(settings.TIME_ZONE)
        
        # Crear inicio y fin del día en la zona horaria local
        start_of_day = tz.localize(datetime.combine(filter_date.date(), time.min))
        end_of_day = tz.localize(datetime.combine(filter_date.date(), time.max))
        
        return start_of_day, end_of_day
    except (ValueError, Exception) as e:
        print(f"Error parsing date: {e}")
        return None
