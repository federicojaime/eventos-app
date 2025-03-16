// App.jsx
import { useState, useRef } from 'react';
import './App.css';
import MapaComponent from './MapaComponent';
import logoImage from './assets/logo.png'; // Asegúrate de tener una imagen de logo en esta ruta

function App() {
  // Referencia para el input de imagen
  const fileInputRef = useRef(null);
  
  // Estado para almacenar los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: '',
    // Fecha y horario
    tipoFecha: 'unica', // unica, repetitiva, periodo
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
    coordenadas: { lat: null, lng: null },
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
    } else {
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

  // Enviar el formulario
  const handleSubmit = (e) => {
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
    
    // Validar que haya coordenadas si hay dirección
    if (formData.direccion && (!formData.coordenadas.lat || !formData.coordenadas.lng)) {
      setMensaje({
        texto: 'Por favor busca la dirección en el mapa o marca una ubicación',
        tipo: 'error'
      });
      setPasoActual(3);
      return;
    }
    
    // Preparar datos para enviar
    // En una aplicación real, aquí prepararías los datos para enviar a tu API
    const eventData = {
      ...formData,
      moderado: false,
      fechaCreacion: new Date().toISOString()
    };
    
    // Simulación de envío
    console.log('Evento enviado:', eventData);
    
    // Mostrar mensaje de éxito
    setMensaje({
      texto: 'Evento registrado con éxito. Un administrador lo revisará pronto.',
      tipo: 'exito'
    });
    
    // En una aplicación real, aquí enviarías el formulario a tu API
    // Incluyendo la imagen como FormData si es necesario
    
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
          <>
            <h2>Información Básica</h2>
            
            <div className="campo">
              <label htmlFor="nombre">Nombre del evento *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Festival de Verano 2025"
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
                rows={4}
                required
              />
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
                required
              />
            </div>
          </>
        );
        
      case 2:
        return (
          <>
            <h2>Fecha y Hora</h2>
            
            <div className="campo">
              <label>Tipo de fecha</label>
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
                </div>
                
                <div className="campo">
                  <label htmlFor="repeticion">Frecuencia</label>
                  <select
                    id="repeticion"
                    name="repeticion"
                    value={formData.repeticion}
                    onChange={handleInputChange}
                  >
                    <option value="semanal">Semanal</option>
                    <option value="quincenal">Quincenal</option>
                    <option value="mensual">Mensual</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="grupo-campos">
              <div className="campo">
                <label htmlFor="hora">Hora inicio *</label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  value={formData.hora}
                  onChange={handleInputChange}
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
                />
              </div>
            </div>
          </>
        );
        
      case 3:
        return (
          <>
            <h2>Ubicación</h2>
            
            <div className="campo">
              <label htmlFor="ubicacion">Nombre del lugar *</label>
              <input
                type="text"
                id="ubicacion"
                name="ubicacion"
                value={formData.ubicacion}
                onChange={handleInputChange}
                placeholder="Ej: Teatro Municipal"
                required
              />
            </div>
            
            <MapaComponent 
              direccion={formData.direccion}
              coordenadas={formData.coordenadas}
              setCoordenadas={handleCoordenadas}
              setMensaje={setMensaje}
            />
          </>
        );
        
      case 4:
        return (
          <>
            <h2>Detalles y Precios</h2>
            
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
                  disabled={formData.esGratis}
                />
              </div>
            )}
            
            <div className="campo">
              <label>Tipo de evento</label>
              <div className="radio-grupo">
                <div className="radio-opcion">
                  <input
                    type="radio"
                    id="publico"
                    name="isPublico"
                    value="true"
                    checked={formData.isPublico === true}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="publico">Público</label>
                </div>
                <div className="radio-opcion">
                  <input
                    type="radio"
                    id="privado"
                    name="isPublico"
                    value="false"
                    checked={formData.isPublico === false}
                    onChange={handleRadioChange}
                  />
                  <label htmlFor="privado">Privado</label>
                </div>
              </div>
            </div>
          </>
        );
        
      case 5:
        return (
          <>
            <h2>Información de Contacto</h2>
            
            <div className="campo">
              <label htmlFor="nombreContacto">Nombre de contacto *</label>
              <input
                type="text"
                id="nombreContacto"
                name="nombreContacto"
                value={formData.nombreContacto}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
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
                  placeholder="Ej: +56 9 1234 5678"
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
              />
            </div>
            
            <h3>Redes sociales</h3>
            
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
                />
              </div>
            </div>
          </>
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
            Enviar Evento para Aprobación
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <header className="header">
        <img src={logoImage} alt="Logo de Eventos App" className="logo" />
        <h1>Registro de Eventos</h1>
      </header>
      
      {/* Mensaje de estado */}
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}
      
      {/* Indicador de progreso */}
      {renderProgreso()}
      
      <form onSubmit={handleSubmit}>
        <div className="form-container">
          {renderFormularioPorPaso()}
        </div>
        
        {renderBotonesNavegacion()}
        
        <p className="nota">
          Todos los eventos deben ser aprobados por un administrador antes de ser publicados.
        </p>
      </form>
    </div>
  );
}

export default App;