// MapaComponent.jsx actualizado
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglar los íconos de Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar icono por defecto (necesario para que aparezca el marcador)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
});

// Componente para manejar eventos del mapa
function MapEvents({ onMapClick, onMarkerDrag }) {
    useMapEvents({
        click: (e) => {
            onMapClick(e.latlng);
        },
    });
    return null;
}

// Componente para manejar draggable marker
function DraggableMarker({ position, onDragEnd }) {
    const markerRef = useRef(null);

    // Se ejecuta cuando el marcador termina de ser arrastrado
    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const newPosition = marker.getLatLng();
                onDragEnd(newPosition);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

const MapaComponent = ({ direccion, coordenadas, setCoordenadas, setDireccion, setMensaje }) => {
    const [map, setMap] = useState(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [localDireccion, setLocalDireccion] = useState(direccion || '');

    // Coordenadas por defecto (San Luis, Argentina como punto central si no hay coordenadas)
    const defaultPosition = [-33.3022, -66.3376];
    const position = coordenadas?.lat && coordenadas?.lng
        ? [coordenadas.lat, coordenadas.lng]
        : defaultPosition;

    useEffect(() => {
        // Actualizar dirección local cuando cambia desde el componente padre
        if (direccion !== localDireccion) {
            setLocalDireccion(direccion);
        }
    }, [direccion]);

    // Cuando cambian las coordenadas y el mapa está listo, centrar el mapa en ellas
    useEffect(() => {
        if (map && coordenadas?.lat && coordenadas?.lng) {
            map.setView([coordenadas.lat, coordenadas.lng], 16);
        }
    }, [map, coordenadas]);

    // Cuando el componente se monta, marcar que el mapa está listo
    useEffect(() => {
        setIsMapReady(true);
    }, []);

    // Manejar click en el mapa
    const handleMapClick = (latlng) => {
        setCoordenadas({
            lat: latlng.lat,
            lng: latlng.lng
        });

        // Intentar obtener la dirección desde las coordenadas (geocodificación inversa)
        buscarDireccionDesdeCoordenadas(latlng.lat, latlng.lng);

        setMensaje({
            texto: 'Ubicación actualizada. Puedes arrastrar el marcador para ajustar.',
            tipo: 'exito'
        });

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            setMensaje({ texto: '', tipo: '' });
        }, 3000);
    };

    // Manejar drag del marcador
    const handleMarkerDrag = (latlng) => {
        setCoordenadas({
            lat: latlng.lat,
            lng: latlng.lng
        });

        // Intentar obtener la dirección desde las coordenadas (geocodificación inversa)
        buscarDireccionDesdeCoordenadas(latlng.lat, latlng.lng);
    };

    // Buscar dirección a partir de coordenadas (geocodificación inversa)
    const buscarDireccionDesdeCoordenadas = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await response.json();

            if (data && data.display_name) {
                const nuevaDireccion = data.display_name;
                setLocalDireccion(nuevaDireccion);
                if (setDireccion) {
                    setDireccion(nuevaDireccion);
                }
            }
        } catch (error) {
            console.error("Error al obtener dirección desde coordenadas:", error);
        }
    };

    // Función para buscar una dirección
    const buscarDireccion = async () => {
        if (!localDireccion.trim()) {
            setMensaje({
                texto: 'Por favor ingresa una dirección para buscar',
                tipo: 'error'
            });
            return;
        }

        try {
            setMensaje({
                texto: 'Buscando dirección...',
                tipo: 'info'
            });

            const direccionCodificada = encodeURIComponent(localDireccion);
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${direccionCodificada}&limit=1`);
            const data = await response.json();

            if (data.length > 0) {
                const resultado = data[0];
                const nuevasCoordenadas = {
                    lat: parseFloat(resultado.lat),
                    lng: parseFloat(resultado.lon)
                };

                setCoordenadas(nuevasCoordenadas);

                // Si el mapa está disponible, centrarlo en las nuevas coordenadas
                if (map) {
                    map.setView([nuevasCoordenadas.lat, nuevasCoordenadas.lng], 16);
                }

                setMensaje({
                    texto: 'Ubicación encontrada. Puedes arrastrar el marcador para ajustar.',
                    tipo: 'exito'
                });
            } else {
                setMensaje({
                    texto: 'No se encontró la dirección. Intenta ser más específico.',
                    tipo: 'error'
                });
            }
        } catch (error) {
            console.error("Error al buscar dirección:", error);
            setMensaje({
                texto: 'Error al buscar la dirección. Verifica tu conexión a internet.',
                tipo: 'error'
            });
        }

        // Limpiar mensaje de error después de 5 segundos (los éxitos ya se limpian en el propio servicio)
        setTimeout(() => {
            setMensaje((prevMensaje) =>
                prevMensaje.tipo === 'error' ? { texto: '', tipo: '' } : prevMensaje
            );
        }, 5000);
    };

    // Manejar cambios en el campo de dirección
    const handleDireccionChange = (e) => {
        const nuevaDireccion = e.target.value;
        setLocalDireccion(nuevaDireccion);
        if (setDireccion) {
            setDireccion(nuevaDireccion);
        }
    };

    return (
        <div className="mapa-ubicacion">
            <div className="campo">
                <label htmlFor="direccion">Dirección *</label>
                <div className="input-con-boton">
                    <input
                        type="text"
                        id="direccion"
                        name="direccion"
                        value={localDireccion}
                        onChange={handleDireccionChange}
                        placeholder="Ej: Pedernera 411, San Luis"
                        required
                    />
                    <button
                        type="button"
                        className="btn-buscar"
                        onClick={buscarDireccion}
                    >
                        Buscar
                    </button>
                </div>
                <p className="help-text">
                    Busca la dirección o haz clic en el mapa para seleccionar la ubicación. Puedes arrastrar el marcador para ajustar.
                </p>
            </div>

            <div className="mapa-container">
                {isMapReady && (
                    <MapContainer
                        center={position}
                        zoom={15}
                        style={{ height: "400px", width: "100%", borderRadius: "8px" }}
                        whenCreated={setMap}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {coordenadas?.lat && coordenadas?.lng && (
                            <DraggableMarker
                                position={[coordenadas.lat, coordenadas.lng]}
                                onDragEnd={handleMarkerDrag}
                            />
                        )}

                        <MapEvents onMapClick={handleMapClick} />
                    </MapContainer>
                )}
            </div>

            {coordenadas?.lat && coordenadas?.lng && (
                <div className="coordenadas-display">
                    Lat: {coordenadas.lat.toFixed(6)}, Lng: {coordenadas.lng.toFixed(6)}
                </div>
            )}
        </div>
    );
};

export default MapaComponent;