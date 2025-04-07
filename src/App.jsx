// App.jsx - Corregido para problemas de inputs controlados
import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Clock, User, DollarSign, Image, Send, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import './App.css';
import MapaComponent from './MapaComponent';
import ApiService, { TokenManager } from './services/apiService';
import logoImage from './assets/logo.png';

// Token predefinido para usuario ID 1
const USER_ID_1_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTYxNjI4MDAsImV4cCI6MTYxNjE3MDAwMCwibmJmIjoxNjE2MTYyODAwLCJkYXRhIjp7ImlkIjoxLCJmaXJzdG5hbWUiOiJBZG1pbiIsImxhc3RuYW1lIjoiVXNlciIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20ifX0.lGJbvI9HaUxg98F9qW2SvFf5E5cijy8_pIsOeYRTW-0";

function App() {
  // Referencia para el input de imagen
  const fileInputRef = useRef(null);

  // Estado para almacenar los datos del formulario - Inicializar todos los valores
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    // Fecha y horario
    tipoFecha: 'unica',
    fecha: '',
    fechaFin: '',
    repeticion: 'semanal',
    dias: {
      lunes: false,
      martes: false,
      miercoles: false,
      jueves: false,
      viernes: false,
      sabado: false,
      domingo: false
    },
    hora: '',
    horaFin: '',
    // Ubicación
    ubicacion: '',
    direccion: '',
    coordenadas: { lat: 0, lng: 0 }, // Inicializar con valores por defecto en lugar de null
    // Detalles
    descripcion: '',
    organizador: '',
    // Precio
    esGratis: false,
    precio: '',
    // Contacto
    nombreContacto: '',
    emailContacto: '',
    telefonoContacto: '',
    sitioWeb: '',
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: ''
    },
    // Configuración
    isPublico: true,
    // Imagen
    flyerImage: null,
    flyerPreview: null
  });

  // Estado para mostrar mensajes
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Estado para seguimiento del paso actual
  const [pasoActual, setPasoActual] = useState(1);
  const totalPasos = 5;

  // Estado para verificar autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('crear');

  // Autenticar automáticamente con ID 1
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Almacenar token de usuario 1 forzado
        TokenManager.setToken(USER_ID_1_TOKEN);

        // Simular validación correcta
        const userData = {
          id: 1,
          firstname: "Usuario",
          lastname: "Predeterminado",
          email: "usuario@ejemplo.com"
        };

        setIsAuthenticated(true);
        setUserData(userData);

        // Cargar eventos
        await fetchEvents();
      } catch (error) {
        console.error("Error en auto-login:", error);
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  // Cargar eventos
  const fetchEvents = async () => {
    try {
      const result = await ApiService.getEvents();
      if (result.ok) {
        setEvents(result.data || []);
      } else {
        // Si la API falla, cargar datos de ejemplo
        setEvents([
          {
            id: 1,
            nombre: 'Festival de Música Electrónica',
            tipo: 'festival',
            fecha: '2025-04-15',
            hora: '22:00',
            horaFin: '06:00',
            ubicacion: 'Club Mandarine',
            direccion: 'Av. del Libertador 14000, Buenos Aires',
            organizador: 'Producciones XYZ',
            esGratis: false,
            precio: '$5000',
            descripcion: 'El festival más esperado del año con los mejores DJs internacionales.',
            isPublico: true,
            imgUrl: 'https://picsum.photos/seed/evento1/800/500'
          },
          {
            id: 2,
            nombre: 'Exposición de Arte Contemporáneo',
            tipo: 'exposicion',
            fecha: '2025-05-10',
            hora: '10:00',
            horaFin: '20:00',
            ubicacion: 'Galería Nacional',
            direccion: 'Calle Rivadavia 1400, Buenos Aires',
            organizador: 'Ministerio de Cultura',
            esGratis: true,
            descripcion: 'Exhibición de los mejores artistas latinoamericanos emergentes.',
            isPublico: true,
            imgUrl: 'https://picsum.photos/seed/evento2/800/500'
          }
        ]);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
      // Cargar datos de ejemplo en caso de error
      setEvents([
        {
          id: 1,
          nombre: 'Festival de Música Electrónica',
          tipo: 'festival',
          fecha: '2025-04-15',
          hora: '22:00',
          ubicacion: 'Club Mandarine',
          esGratis: false,
          precio: '$5000',
          descripcion: 'El festival más esperado del año con los mejores DJs internacionales.'
        }
      ]);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      if (name === 'esGratis') {
        setFormData({
          ...formData,
          esGratis: checked,
          precio: checked ? '' : formData.precio
        });
      } else {
        setFormData({
          ...formData,
          [name]: checked
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Manejar cambios en campos anidados
  const handleNestedChange = (group, field, value) => {
    setFormData({
      ...formData,
      [group]: {
        ...formData[group],
        [field]: value
      }
    });
  };

  // Manejar selección de día de la semana
  const handleDiaChange = (dia) => {
    setFormData({
      ...formData,
      dias: {
        ...formData.dias,
        [dia]: !formData.dias[dia]
      }
    });
  };

  // Manejar cambios en campos tipo radio
  const handleRadioChange = (e) => {
    const { name, value } = e.target;

    if (name === 'tipoFecha') {
      // Reset valores relacionados a fechas
      let nuevosDatos = {
        ...formData,
        tipoFecha: value,
      };

      if (value === 'unica') {
        nuevosDatos = {
          ...nuevosDatos,
          fechaFin: '',
          repeticion: 'semanal',
          dias: {
            lunes: false,
            martes: false,
            miercoles: false,
            jueves: false,
            viernes: false,
            sabado: false,
            domingo: false
          }
        };
      }

      setFormData(nuevosDatos);
    } else if (name === 'isPublico') {
      setFormData({
        ...formData,
        [name]: value === 'true'
      });
    }
  };

  // Manejar carga de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const fileTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!fileTypes.includes(file.type)) {
        setMensaje({
          texto: 'Por favor sube una imagen en formato JPG, PNG o GIF',
          tipo: 'error'
        });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMensaje({
          texto: 'La imagen no debe superar los 5MB',
          tipo: 'error'
        });
        return;
      }

      // Crear URL para previsualización
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          flyerImage: file,
          flyerPreview: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Actualizar coordenadas (usado por el componente de mapa)
  const handleCoordenadas = (nuevasCoordenadas) => {
    setFormData({
      ...formData,
      coordenadas: nuevasCoordenadas
    });
  };

  // Actualizar dirección (desde el componente mapa)
  const handleDireccion = (nuevaDireccion) => {
    setFormData({
      ...formData,
      direccion: nuevaDireccion
    });
  };

  // Navegar a otro paso
  const irAPaso = (paso) => {
    if (paso >= 1 && paso <= totalPasos) {
      // Validación básica antes de avanzar
      if (pasoActual === 1 && paso > pasoActual) {
        if (!formData.nombre || !formData.tipo) {
          setMensaje({
            texto: 'Por favor completa los campos obligatorios',
            tipo: 'error'
          });
          return;
        }
      }

      setPasoActual(paso);
      window.scrollTo(0, 0);
      setMensaje({ texto: '', tipo: '' });
    }
  };

  // Enviar el formulario a la API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.nombre || !formData.tipo) {
      setMensaje({
        texto: 'Por favor completa los campos obligatorios',
        tipo: 'error'
      });
      setPasoActual(1);
      return;
    }

    if (formData.tipoFecha === 'unica' && !formData.fecha) {
      setMensaje({
        texto: 'Por favor selecciona una fecha para el evento',
        tipo: 'error'
      });
      setPasoActual(2);
      return;
    }

    // Mostrar mensaje de carga
    setMensaje({
      texto: 'Enviando evento, por favor espera...',
      tipo: 'info'
    });

    try {
      // Enviar a la API (usando directamente ID 1)
      const result = await ApiService.createEvent(formData);

      if (result.ok) {
        setMensaje({
          texto: 'Evento registrado con éxito. Un administrador lo revisará pronto.',
          tipo: 'exito'
        });

        // Refrescar lista de eventos
        await fetchEvents();

        // Cambiar a pestaña de eventos
        setActiveTab('eventos');

        // Reiniciar formulario
        setFormData({
          nombre: '',
          tipo: '',
          tipoFecha: 'unica',
          fecha: '',
          fechaFin: '',
          repeticion: 'semanal',
          dias: {
            lunes: false,
            martes: false,
            miercoles: false,
            jueves: false,
            viernes: false,
            sabado: false,
            domingo: false
          },
          hora: '',
          horaFin: '',
          ubicacion: '',
          direccion: '',
          coordenadas: { lat: 0, lng: 0 },
          descripcion: '',
          organizador: '',
          esGratis: false,
          precio: '',
          nombreContacto: '',
          emailContacto: '',
          telefonoContacto: '',
          sitioWeb: '',
          socialMedia: {
            instagram: '',
            facebook: '',
            twitter: ''
          },
          isPublico: true,
          flyerImage: null,
          flyerPreview: null
        });

        // Volver al primer paso
        setPasoActual(1);
      } else {
        setMensaje({
          texto: `Error: ${result.msg || 'Ocurrió un error al registrar el evento'}`,
          tipo: 'error'
        });

        // Si hay errores específicos, mostrarlos
        if (result.errores && result.errores.length > 0) {
          console.error('Errores:', result.errores);
        }
      }
    } catch (error) {
      console.error("Error al enviar el evento:", error);
      setMensaje({
        texto: 'Error de conexión al enviar el evento. Por favor intenta de nuevo.',
        tipo: 'error'
      });
    }

    // Scroll al inicio para ver el mensaje
    window.scrollTo(0, 0);
  };

  // Renderizar indicadores de progreso
  const renderProgreso = () => {
    return (
      <div className="progreso-container">
        {[...Array(totalPasos)].map((_, i) => (
          <div
            key={i}
            className={`paso ${pasoActual >= i + 1 ? 'activo' : ''} ${pasoActual === i + 1 ? 'actual' : ''}`}
            onClick={() => irAPaso(i + 1)}
          >
            <div className="paso-numero">{i + 1}</div>
            <div className="paso-texto">
              {i === 0 && "Información"}
              {i === 1 && "Fecha y Hora"}
              {i === 2 && "Ubicación"}
              {i === 3 && "Detalles"}
              {i === 4 && "Contacto"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar formulario según paso actual
  const renderFormularioPorPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <div className="paso-contenido">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">Información Básica</h2>

            <div className="card-container">
              <div className="form-card">
                <div className="card-header">
                  <User className="h-6 w-6" />
                  <h3>Datos Principales</h3>
                </div>

                <div className="campo-con-icono">
                  <label htmlFor="nombre">Nombre del evento *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    placeholder="Ej: Festival de Verano 2025"
                    className="input-custom"
                    required
                  />
                </div>

                <div className="campo">
                  <label htmlFor="tipo">Tipo de evento *</label>
                  <select
                    id="tipo"
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    className="input-custom"
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option value="festival">Festival</option>
                    <option value="fiesta">Fiesta</option>
                    <option value="concierto">Concierto</option>
                    <option value="conferencia">Conferencia</option>
                    <option value="exposicion">Exposición</option>
                    <option value="deportivo">Evento deportivo</option>
                    <option value="gastronomico">Evento gastronómico</option>
                    <option value="cultural">Evento cultural</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <div className="campo">
                  <label htmlFor="organizador">Organizador *</label>
                  <input
                    type="text"
                    id="organizador"
                    name="organizador"
                    value={formData.organizador}
                    onChange={handleInputChange}
                    placeholder="Ej: Productora XYZ"
                    className="input-custom"
                    required
                  />
                </div>
              </div>

              <div className="form-card">
                <div className="card-header">
                  <Image className="h-6 w-6" />
                  <h3>Imagen y Descripción</h3>
                </div>

                <div className="campo">
                  <label>Flyer o imagen del evento</label>
                  <div className="upload-container">
                    <button
                      type="button"
                      className="upload-btn"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Seleccionar imagen
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/jpeg, image/png, image/gif"
                      style={{ display: 'none' }}
                    />
                    <span className="file-info">
                      {formData.flyerImage ? formData.flyerImage.name : 'Ningún archivo seleccionado'}
                    </span>
                  </div>

                  {formData.flyerPreview && (
                    <div className="image-preview">
                      <img src={formData.flyerPreview} alt="Previsualización del flyer" />
                    </div>
                  )}
                  <p className="help-text">Formatos: JPG, PNG o GIF. Máximo 5MB.</p>
                </div>

                <div className="campo">
                  <label htmlFor="descripcion">Descripción del evento *</label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    placeholder="Describe tu evento: actividades, artistas, programación, etc."
                    className="input-custom"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="paso-contenido">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">Fecha y Hora</h2>

            <div className="card-container">
              <div className="form-card">
                <div className="card-header">
                  <Calendar className="h-6 w-6" />
                  <h3>Tipo de Fecha</h3>
                </div>

                <div className="campo">
                  <label>¿Cómo se realizará el evento?</label>
                  <div className="opciones-tipo-fecha">
                    <div className="radio-opcion">
                      <input
                        type="radio"
                        id="fecha-unica"
                        name="tipoFecha"
                        value="unica"
                        checked={formData.tipoFecha === 'unica'}
                        onChange={handleRadioChange}
                      />
                      <label htmlFor="fecha-unica">Fecha única</label>
                    </div>

                    <div className="radio-opcion">
                      <input
                        type="radio"
                        id="fecha-repetitiva"
                        name="tipoFecha"
                        value="repetitiva"
                        checked={formData.tipoFecha === 'repetitiva'}
                        onChange={handleRadioChange}
                      />
                      <label htmlFor="fecha-repetitiva">Se repite semanalmente</label>
                    </div>

                    <div className="radio-opcion">
                      <input
                        type="radio"
                        id="fecha-periodo"
                        name="tipoFecha"
                        value="periodo"
                        checked={formData.tipoFecha === 'periodo'}
                        onChange={handleRadioChange}
                      />
                      <label htmlFor="fecha-periodo">Periodo (desde-hasta)</label>
                    </div>
                  </div>
                </div>

                {formData.tipoFecha === 'unica' && (
                  <div className="campo">
                    <label htmlFor="fecha">Fecha *</label>
                    <input
                      type="date"
                      id="fecha"
                      name="fecha"
                      value={formData.fecha}
                      onChange={handleInputChange}
                      className="input-custom"
                      required
                    />
                  </div>
                )}

                {formData.tipoFecha === 'periodo' && (
                  <div className="grupo-campos">
                    <div className="campo">
                      <label htmlFor="fecha">Fecha inicio *</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        className="input-custom"
                        required
                      />
                    </div>

                    <div className="campo">
                      <label htmlFor="fechaFin">Fecha fin *</label>
                      <input
                        type="date"
                        id="fechaFin"
                        name="fechaFin"
                        value={formData.fechaFin}
                        onChange={handleInputChange}
                        min={formData.fecha}
                        className="input-custom"
                        required
                      />
                    </div>
                  </div>
                )}

                {formData.tipoFecha === 'repetitiva' && (
                  <>
                    <div className="campo">
                      <label htmlFor="fecha">Fecha inicio *</label>
                      <input
                        type="date"
                        id="fecha"
                        name="fecha"
                        value={formData.fecha}
                        onChange={handleInputChange}
                        className="input-custom"
                        required
                      />
                    </div>

                    <div className="campo">
                      <label>Días de repetición</label>
                      <div className="dias-semana">
                        {Object.keys(formData.dias).map((dia) => (
                          <div
                            key={dia}
                            className={`dia-semana ${formData.dias[dia] ? 'seleccionado' : ''}`}
                            onClick={() => handleDiaChange(dia)}
                          >
                            {dia.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>
                      <p className="help-text">Selecciona los días en que se repetirá el evento</p>
                    </div>

                    <div className="campo">
                      <label htmlFor="repeticion">Frecuencia</label>
                      <select
                        id="repeticion"
                        name="repeticion"
                        value={formData.repeticion}
                        onChange={handleInputChange}
                        className="input-custom"
                      >
                        <option value="semanal">Semanal</option>
                        <option value="quincenal">Quincenal</option>
                        <option value="mensual">Mensual</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="form-card">
                <div className="card-header">
                  <Clock className="h-6 w-6" />
                  <h3>Horario</h3>
                </div>

                <div className="grupo-campos">
                  <div className="campo">
                    <label htmlFor="hora">Hora inicio *</label>
                    <input
                      type="time"
                      id="hora"
                      name="hora"
                      value={formData.hora}
                      onChange={handleInputChange}
                      className="input-custom"
                      required
                    />
                  </div>

                  <div className="campo">
                    <label htmlFor="horaFin">Hora fin</label>
                    <input
                      type="time"
                      id="horaFin"
                      name="horaFin"
                      value={formData.horaFin}
                      onChange={handleInputChange}
                      min={formData.hora}
                      className="input-custom"
                    />
                  </div>
                </div>

                <div className="campo">
                  <label>Información adicional</label>
                  <p className="help-text">
                    El horario especificado aparecerá en la página del evento. Te recomendamos incluir detalles adicionales
                    en la descripción, como horarios de acceso, comienzo de actividades específicas, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="paso-contenido">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">Ubicación</h2>

            <div className="form-card">
              <div className="card-header">
                <MapPin className="h-6 w-6" />
                <h3>Datos del Lugar</h3>
              </div>

              <div className="campo">
                <label htmlFor="ubicacion">Nombre del lugar *</label>
                <input
                  type="text"
                  id="ubicacion"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  placeholder="Ej: Teatro Municipal"
                  className="input-custom"
                  required
                />
              </div>

              <MapaComponent
                direccion={formData.direccion}
                coordenadas={formData.coordenadas}
                setCoordenadas={handleCoordenadas}
                setDireccion={handleDireccion}
                setMensaje={setMensaje}
              />

              <p className="help-text mt-4">
                Puedes buscar una dirección o hacer clic directamente en el mapa para marcar la ubicación de tu evento.
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="paso-contenido">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">Detalles y Precios</h2>

            <div className="card-container">
              <div className="form-card">
                <div className="card-header">
                  <DollarSign className="h-6 w-6" />
                  <h3>Información de Precio</h3>
                </div>

                <div className="precio-toggle">
                  <div className="campo checkbox">
                    <input
                      type="checkbox"
                      id="esGratis"
                      name="esGratis"
                      checked={formData.esGratis}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="esGratis">Evento gratuito</label>
                  </div>

                  <div className={`precio-badge ${formData.esGratis ? 'active' : ''}`}>
                    {formData.esGratis ? 'GRATIS' : 'DE PAGO'}
                  </div>
                </div>

                {!formData.esGratis && (
                  <div className="campo">
                    <label htmlFor="precio">Precio</label>
                    <input
                      type="text"
                      id="precio"
                      name="precio"
                      value={formData.precio}
                      onChange={handleInputChange}
                      placeholder="Ej: $10.000 o Desde $5.000"
                      className="input-custom"
                      disabled={formData.esGratis}
                    />
                    <p className="help-text">
                      Puedes especificar un precio único o un rango de precios.
                    </p>
                  </div>
                )}
              </div>

              <div className="form-card">
                <div className="card-header">
                  <User className="h-6 w-6" />
                  <h3>Visibilidad</h3>
                </div>

                <div className="campo-group-label">Tipo de evento</div>

                <div className="toggle-buttons">
                  <button
                    type="button"
                    className={`toggle-btn ${formData.isPublico ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, isPublico: true })}
                  >
                    <User className="h-4 w-4" />
                    Público
                  </button>

                  <button
                    type="button"
                    className={`toggle-btn ${!formData.isPublico ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, isPublico: false })}
                  >
                    <Check className="h-4 w-4" />
                    Privado
                  </button>
                </div>

                <p className="help-text mt-2">
                  {formData.isPublico
                    ? 'Los eventos públicos aparecen en las búsquedas y pueden ser descubiertos por cualquier persona.'
                    : 'Los eventos privados solo son visibles para personas con el enlace directo.'}
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="paso-contenido">
            <h2 className="text-3xl font-bold text-primary-600 mb-8">Información de Contacto</h2>

            <div className="card-container">
              <div className="form-card">
                <div className="card-header">
                  <User className="h-6 w-6" />
                  <h3>Contacto Principal</h3>
                </div>

                <div className="campo">
                  <label htmlFor="nombreContacto">Nombre de contacto *</label>
                  <input
                    type="text"
                    id="nombreContacto"
                    name="nombreContacto"
                    value={formData.nombreContacto}
                    onChange={handleInputChange}
                    placeholder="Ej: Juan Pérez"
                    className="input-custom"
                    required
                  />
                </div>

                <div className="grupo-campos">
                  <div className="campo">
                    <label htmlFor="emailContacto">Email de contacto *</label>
                    <input
                      type="email"
                      id="emailContacto"
                      name="emailContacto"
                      value={formData.emailContacto}
                      onChange={handleInputChange}
                      placeholder="Ej: contacto@email.com"
                      className="input-custom"
                      required
                    />
                  </div>

                  <div className="campo">
                    <label htmlFor="telefonoContacto">Teléfono de contacto</label>
                    <input
                      type="tel"
                      id="telefonoContacto"
                      name="telefonoContacto"
                      value={formData.telefonoContacto}
                      onChange={handleInputChange}
                      placeholder="Ej: +54 9 123 4567890"
                      className="input-custom"
                    />
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="sitioWeb">Sitio web</label>
                  <input
                    type="url"
                    id="sitioWeb"
                    name="sitioWeb"
                    value={formData.sitioWeb}
                    onChange={handleInputChange}
                    placeholder="Ej: https://mievento.com"
                    className="input-custom"
                  />
                </div>
              </div>

              <div className="form-card">
                <div className="card-header">
                  <User className="h-6 w-6" />
                  <h3>Redes Sociales</h3>
                </div>

                <div className="campo">
                  <label htmlFor="instagram">Instagram</label>
                  <div className="social-input">
                    <span className="social-prefix">instagram.com/</span>
                    <input
                      type="text"
                      id="instagram"
                      value={formData.socialMedia.instagram}
                      onChange={(e) => handleNestedChange('socialMedia', 'instagram', e.target.value)}
                      placeholder="usuario"
                      className="input-custom"
                    />
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="facebook">Facebook</label>
                  <div className="social-input">
                    <span className="social-prefix">facebook.com/</span>
                    <input
                      type="text"
                      id="facebook"
                      value={formData.socialMedia.facebook}
                      onChange={(e) => handleNestedChange('socialMedia', 'facebook', e.target.value)}
                      placeholder="pagina"
                      className="input-custom"
                    />
                  </div>
                </div>

                <div className="campo">
                  <label htmlFor="twitter">Twitter</label>
                  <div className="social-input">
                    <span className="social-prefix">twitter.com/</span>
                    <input
                      type="text"
                      id="twitter"
                      value={formData.socialMedia.twitter}
                      onChange={(e) => handleNestedChange('socialMedia', 'twitter', e.target.value)}
                      placeholder="usuario"
                      className="input-custom"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="resumen-form">
              <h3>Todo listo para crear tu evento</h3>
              <p>Revisa tus datos antes de enviar. Una vez que envíes el evento, quedará pendiente de aprobación.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Botones de navegación
  const renderBotonesNavegacion = () => {
    return (
      <div className="botones-navegacion">
        {pasoActual > 1 && (
          <button
            type="button"
            className="boton-anterior"
            onClick={() => irAPaso(pasoActual - 1)}
          >
            Anterior
          </button>
        )}

        {pasoActual < totalPasos ? (
          <button
            type="button"
            className="boton-siguiente"
            onClick={() => irAPaso(pasoActual + 1)}
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="boton-submit"
          >
            Enviar Evento
          </button>
        )}
      </div>
    );
  };

  // Render cards de eventos
  const renderEventCards = () => {
    if (events.length === 0) {
      return (
        <div className="sin-eventos">
          <p>No hay eventos registrados todavía.</p>
          <button
            type="button"
            className="boton-primario"
            onClick={() => setActiveTab('crear')}
          >
            Crear un evento
          </button>
        </div>
      );
    }

    return (
      <div className="eventos-grid">
        {events.map(evento => (
          <div key={evento.id} className="evento-card">
            <div className="evento-card-imagen" style={{
              backgroundImage: `url(${evento.imgUrl || 'https://picsum.photos/800/400?random=' + evento.id})`
            }}>
              <div className="evento-tag">{evento.tipo}</div>
            </div>
            <div className="evento-card-contenido">
              <h3>{evento.nombre}</h3>
              <div className="evento-detalles">
                <div className="evento-detalle">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(evento.fecha).toLocaleDateString()}</span>
                </div>
                <div className="evento-detalle">
                  <MapPin className="h-4 w-4" />
                  <span>{evento.ubicacion}</span>
                </div>
                {!evento.esGratis && evento.precio && (
                  <div className="evento-detalle">
                    <DollarSign className="h-4 w-4" />
                    <span>{evento.precio}</span>
                  </div>
                )}
              </div>
              <p className="evento-descripcion">{evento.descripcion.substring(0, 100)}...</p>
              <div className="evento-estado">
                {evento.is_approved ? (
                  <span className="estado aprobado">Aprobado</span>
                ) : (
                  <span className="estado pendiente">Pendiente de aprobación</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="main-container">
      <header className="app-header">
        <div className="logo-container">
          <img src={logoImage} alt="Eventos App" className="logo" />
          <h1>Sheep Shit</h1>
        </div>

        <div className="user-info">
          <span className="username">Usuario ID: 1</span>
          <span className="badge">Autenticación automática</span>
        </div>
      </header>

      {/* Tabs de navegación */}
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'crear' ? 'active' : ''}`}
          onClick={() => setActiveTab('crear')}
        >
          Crear Evento
        </button>
        <button
          className={`tab-button ${activeTab === 'eventos' ? 'active' : ''}`}
          onClick={() => setActiveTab('eventos')}
        >
          Mis Eventos
        </button>
      </div>

      {/* Mensajes de notificación */}
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      {activeTab === 'crear' ? (
        <>
          {/* Indicador de progreso */}
          {renderProgreso()}

          <form onSubmit={handleSubmit} className="form-evento">
            {renderFormularioPorPaso()}

            {renderBotonesNavegacion()}

            <p className="nota">
              Todos los eventos creados serán registrados con el ID de usuario 1 automáticamente.
              No se requiere inicio de sesión para crear eventos en esta versión.
            </p>
          </form>
        </>
      ) : (
        <div className="eventos-container">
          <h2>Mis Eventos</h2>
          {renderEventCards()}
        </div>
      )}
    </div>
  );
}

export default App;