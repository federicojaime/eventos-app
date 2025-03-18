// MapaComponent.jsx modernizado
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

// Componente de mapa para seleccionar ubicación
const MapaComponent = ({ direccion, coordenadas, setCoordenadas, setDireccion, setMensaje }) => {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const inputRef = useRef(null);

  // Inicializar el mapa cuando el componente se monta
  useEffect(() => {
    // Cargar leaflet script dinámicamente
    const loadLeaflet = async () => {
      if (!window.L) {
        // Cargar CSS
        const linkElement = document.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
        document.head.appendChild(linkElement);
        
        // Cargar JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
        script.async = true;
        
        await new Promise((resolve) => {
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      
      return window.L;
    };
    
    const initMap = async () => {
      try {
        const L = await loadLeaflet();
        
        // Crear el mapa
        const mapInstance = L.map(mapRef.current).setView([-33.4489, -70.6693], 13);
        
        // Añadir capa de mapa (OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);
        
        // Guardar la referencia
        setMap(mapInstance);
        
        // Agregar evento de clic para ubicar el marcador
        mapInstance.on('click', (e) => {
          setMarkerPosition(e.latlng, mapInstance);
          getAddressFromCoordinates(e.latlng.lat, e.latlng.lng);
        });
        
        // Si ya hay coordenadas, mostrar el marcador
        if (coordenadas && coordenadas.lat && coordenadas.lng) {
          setMarkerPosition({ lat: coordenadas.lat, lng: coordenadas.lng }, mapInstance);
          mapInstance.setView([coordenadas.lat, coordenadas.lng], 15);
        }
      } catch (error) {
        console.error("Error al inicializar el mapa:", error);
        setMensaje({
          texto: "Error al cargar el mapa. Por favor, intenta recargar la página.",
          tipo: "error"
        });
      }
    };
    
    initMap();
    
    // Cleanup
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, []);
  
  // Actualizar marcador cuando cambien las coordenadas desde fuera
  useEffect(() => {
    if (map && coordenadas && coordenadas.lat && coordenadas.lng) {
      setMarkerPosition({ lat: coordenadas.lat, lng: coordenadas.lng }, map);
      map.setView([coordenadas.lat, coordenadas.lng], 15);
    }
  }, [coordenadas, map]);
  
  // Función para establecer la posición del marcador
  const setMarkerPosition = (latlng, mapInstance) => {
    // Remover marcador anterior si existe
    if (marker) {
      mapInstance.removeLayer(marker);
    }
    
    // Crear nuevo marcador
    const L = window.L;
    const newMarker = L.marker([latlng.lat, latlng.lng], {
      draggable: true,
      autoPan: true
    }).addTo(mapInstance);
    
    // Evento al arrastrar el marcador
    newMarker.on('dragend', (e) => {
      const pos = e.target.getLatLng();
      setCoordenadas({ lat: pos.lat, lng: pos.lng });
      getAddressFromCoordinates(pos.lat, pos.lng);
    });
    
    // Establecer coordenadas
    setCoordenadas({ lat: latlng.lat, lng: latlng.lng });
    
    // Guardar referencia
    setMarker(newMarker);
  };
  
  // Obtener coordenadas a partir de una dirección
  const searchLocation = async () => {
    if (!direccion) {
      setMensaje({
        texto: "Por favor ingresa una dirección para buscar",
        tipo: "error"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Usar Nominatim de OpenStreetMap para geocodificación
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Actualizar mapa
        if (map) {
          setMarkerPosition({ lat, lng }, map);
          map.setView([lat, lng], 15);
        }
        
        // Actualizar dirección formateada
        setDireccion(result.display_name);
        
        setMensaje({
          texto: "Ubicación encontrada",
          tipo: "exito"
        });
      } else {
        setMensaje({
          texto: "No se pudo encontrar la dirección. Intenta con otra o marca en el mapa.",
          tipo: "error"
        });
      }
    } catch (error) {
      console.error("Error al buscar dirección:", error);
      setMensaje({
        texto: "Error al buscar dirección. Verifica tu conexión a internet.",
        tipo: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Obtener dirección a partir de coordenadas (geocodificación inversa)
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      
      if (data && data.display_name) {
        setDireccion(data.display_name);
      }
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
    }
  };
  
  // Usar la ubicación actual del usuario
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Actualizar mapa
          if (map) {
            setMarkerPosition({ lat, lng }, map);
            map.setView([lat, lng], 15);
          }
          
          // Obtener dirección
          getAddressFromCoordinates(lat, lng);
          
          setIsLoading(false);
          
          setMensaje({
            texto: "Usando tu ubicación actual",
            tipo: "info"
          });
        },
        (error) => {
          setIsLoading(false);
          
          let errorMsg = "Error al obtener tu ubicación";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMsg = "Permiso de ubicación denegado. Habilita la ubicación en tu navegador.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMsg = "Información de ubicación no disponible.";
              break;
            case error.TIMEOUT:
              errorMsg = "Tiempo de espera agotado para obtener la ubicación.";
              break;
            default:
              errorMsg = "Error desconocido al obtener ubicación.";
          }
          
          setMensaje({
            texto: errorMsg,
            tipo: "error"
          });
        }
      );
    } else {
      setMensaje({
        texto: "Geolocalización no soportada por tu navegador",
        tipo: "error"
      });
    }
  };
  
  // Presionar enter para buscar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };
  
  return (
    <div className="mapa-ubicacion">
      <div className="campo campo-con-icono">
        <MapPin className="campo-icono" size={18} />
        <label htmlFor="direccion">Dirección</label>
        <div className="input-con-boton">
          <input
            type="text"
            id="direccion"
            name="direccion"
            value={direccion || ''}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ingresa una dirección para buscar"
            onKeyPress={handleKeyPress}
            ref={inputRef}
          />
          <button 
            type="button" 
            className="btn-buscar"
            onClick={searchLocation}
            disabled={isLoading}
          >
            {isLoading ? <div className="mini-spinner"></div> : <Search size={18} />}
          </button>
        </div>
      </div>
      
      <div className="mapa-opciones">
        <button 
          type="button" 
          className="mapa-btn-ubicacion"
          onClick={useCurrentLocation}
          disabled={isLoading}
        >
          <Navigation size={16} /> Usar mi ubicación
        </button>
      </div>
      
      <div className="mapa-container">
        <div ref={mapRef} style={{ height: '300px', width: '100%' }}></div>
      </div>
      
      {coordenadas && coordenadas.lat && coordenadas.lng && (
        <div className="coordenadas-display">
          {coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default MapaComponent;