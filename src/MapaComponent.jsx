// MapaComponent.jsx - Versión mínima para solucionar el problema de actualizaciones infinitas
import { useState, useEffect, useRef } from 'react';
import { MapPin, Search, Navigation } from 'lucide-react';

const MapaComponent = ({ direccion, coordenadas, setCoordenadas, setDireccion, setMensaje }) => {
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const isMapInitializedRef = useRef(false);

  // Inicializar el mapa una sola vez
  useEffect(() => {
    let cleanup = false;

    async function initMap() {
      if (isMapInitializedRef.current || cleanup) return;

      // Cargar Leaflet si no está cargado
      if (!window.L) {
        try {
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
        } catch (error) {
          console.error("Error cargando Leaflet:", error);
          return;
        }
      }

      // Crear mapa
      try {
        if (!mapRef.current || cleanup) return;
        
        const L = window.L;
        const map = L.map(mapRef.current).setView([-34.6037, -58.3816], 13);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);
        
        // Guardar referencia
        mapInstanceRef.current = map;
        isMapInitializedRef.current = true;
        
        // Configurar evento de clic
        map.on('click', (e) => {
          if (cleanup) return;
          handleMapClick(e.latlng);
        });
        
        // Si ya hay coordenadas, mostrar marcador
        if (coordenadas && coordenadas.lat && coordenadas.lng) {
          updateMarker(coordenadas);
        }
      } catch (error) {
        console.error("Error inicializando mapa:", error);
      }
    }
    
    initMap();
    
    return () => {
      cleanup = true;
      
      // Limpiar mapa
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        isMapInitializedRef.current = false;
      }
    };
  }, []);

  // Función para manejar clic en el mapa
  function handleMapClick(latlng) {
    updateMarker(latlng);
    fetchAddressFromCoords(latlng.lat, latlng.lng);
  }
  
  // Función para actualizar el marcador
  function updateMarker(position) {
    if (!isMapInitializedRef.current || !mapInstanceRef.current) return;
    
    try {
      const L = window.L;
      const map = mapInstanceRef.current;
      
      // Eliminar marcador anterior
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Crear nuevo marcador
      const marker = L.marker([position.lat, position.lng], {
        draggable: true
      }).addTo(map);
      
      // Configurar evento drag
      marker.on('dragend', function() {
        const newPos = marker.getLatLng();
        setCoordenadas({ lat: newPos.lat, lng: newPos.lng });
        fetchAddressFromCoords(newPos.lat, newPos.lng);
      });
      
      // Guardar referencia y actualizar coordenadas
      markerRef.current = marker;
      setCoordenadas({ lat: position.lat, lng: position.lng });
    } catch (error) {
      console.error("Error actualizando marcador:", error);
    }
  }
  
  // Buscar dirección por coordenadas
  async function fetchAddressFromCoords(lat, lng) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      if (data && data.display_name) {
        setDireccion(data.display_name);
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
    }
  }
  
  // Buscar coordenadas por dirección
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
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Actualizar mapa y marcador
        if (mapInstanceRef.current) {
          updateMarker({ lat, lng });
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        
        setDireccion(result.display_name);
        
        setMensaje({
          texto: "Ubicación encontrada",
          tipo: "exito"
        });
      } else {
        setMensaje({
          texto: "No se pudo encontrar la dirección.",
          tipo: "error"
        });
      }
    } catch (error) {
      console.error("Error buscando dirección:", error);
      setMensaje({
        texto: "Error al buscar dirección.",
        tipo: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Usar ubicación actual
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMensaje({
        texto: "Geolocalización no soportada en tu navegador",
        tipo: "error"
      });
      return;
    }
    
    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapInstanceRef.current) {
          updateMarker({ lat, lng });
          mapInstanceRef.current.setView([lat, lng], 15);
        }
        
        fetchAddressFromCoords(lat, lng);
        
        setIsLoading(false);
        
        setMensaje({
          texto: "Usando tu ubicación actual",
          tipo: "info"
        });
      },
      (error) => {
        setIsLoading(false);
        
        let errorMsg = "Error al obtener tu ubicación";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Permiso de ubicación denegado.";
        }
        
        setMensaje({
          texto: errorMsg,
          tipo: "error"
        });
      }
    );
  };
  
  // Manejar tecla Enter para buscar
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      searchLocation();
    }
  };
  
  return (
    <div className="mapa-contenedor">
      <div className="campo">
        <label>Buscar ubicación</label>
        <div className="input-con-boton">
          <input
            type="text"
            value={direccion || ''}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ingresa una dirección para buscar"
            onKeyPress={handleKeyPress}
            className="input-custom"
          />
          <button 
            type="button" 
            className="boton-buscar"
            onClick={searchLocation}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="mini-spinner"></div>
            ) : (
              <Search size={18} />
            )}
          </button>
        </div>
      </div>
      
      <div className="mapa-acciones">
        <button 
          type="button" 
          className="boton-ubicacion"
          onClick={useCurrentLocation}
          disabled={isLoading}
        >
          <Navigation size={16} />
          Usar mi ubicación actual
        </button>
        
        <p className="help-text">
          Puedes hacer clic directamente en el mapa para seleccionar la ubicación exacta
        </p>
      </div>
      
      <div className="mapa-container">
        <div ref={mapRef} className="mapa-leaflet"></div>
      </div>
      
      {coordenadas && coordenadas.lat && coordenadas.lng && (
        <div className="coordenadas-info">
          <MapPin size={16} />
          <span>Coordenadas:</span>
          <code>{coordenadas.lat.toFixed(6)}, {coordenadas.lng.toFixed(6)}</code>
        </div>
      )}
    </div>
  );
};

export default MapaComponent;