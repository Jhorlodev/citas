import { useState, useEffect } from 'react';
import { 
  FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaPaw, 
  FaUser, FaHome, FaClinicMedical, FaCheck,
  FaSpinner, FaTimes, FaInfoCircle, FaSync
} from 'react-icons/fa';
import { supabase } from '../components/lib/supabase.js';

// Componente para mostrar las citas del usuario con actualización en tiempo real
function CitasUsuario() {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let subscription;

    const fetchCitas = async () => {
      try {
        // 1. Obtener usuario actual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Usuario no autenticado');

        // 2. Obtener citas iniciales
        const { data: initialData, error: fetchError } = await supabase
          .from('citas')
          .select('*')
          .eq('user_id', user.id)
          .order('fecha', { ascending: true });

        if (fetchError) throw fetchError;
        setCitas(initialData || []);

        // 3. Suscribirse a cambios en tiempo real
        subscription = supabase
          .channel('citas_changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'citas',
              filter: `user_id=eq.${user.id}`
            },
            (payload) => {
              // Manejar diferentes tipos de eventos
              switch (payload.eventType) {
                case 'INSERT':
                  setCitas(prev => [...prev, payload.new]);
                  break;
                case 'UPDATE':
                  setCitas(prev => prev.map(c => 
                    c.id === payload.new.id ? payload.new : c
                  ));
                  break;
                case 'DELETE':
                  setCitas(prev => prev.filter(c => c.id !== payload.old.id));
                  break;
                default:
                  break;
              }
            }
          )
          .subscribe();

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();

    // Limpieza al desmontar el componente
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('citas')
        .select('*')
        .eq('user_id', user.id)
        .order('fecha', { ascending: true });

      if (error) throw error;
      setCitas(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelCita = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      alert('Error al cancelar cita: ' + err.message);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-40">
      <FaSpinner className="animate-spin text-2xl text-indigo-500" />
    </div>
  );

  if (error) return (
    <div className="text-red-500 p-4 text-center">
      Error: {error}
      <button 
        onClick={handleRefresh}
        className="ml-2 text-indigo-600 hover:text-indigo-800"
      >
        <FaSync />
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-lg text-indigo-600">Tus citas agendadas</h3>
        <button 
          onClick={handleRefresh}
          className="text-indigo-600 hover:text-indigo-800 p-1"
          title="Actualizar lista"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {citas.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No tienes citas agendadas</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {citas.map(cita => (
            <div key={cita.id} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <div className="flex justify-between">
                <div>
                  <h4 className="font-semibold text-indigo-700">{cita.paciente}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    <FaCalendarAlt className="inline mr-2 text-indigo-500" />
                    {new Date(cita.fecha).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <FaClinicMedical className="inline mr-2 text-indigo-500" />
                    {cita.motivo}
                  </p>
                  {cita.tipo_consulta === 'domicilio' && (
                    <p className="text-sm text-gray-600 mt-1">
                      <FaMapMarkerAlt className="inline mr-2 text-indigo-500" />
                      {cita.direccion}
                    </p>
                  )}
                </div>
                <button 
                  onClick={() => handleCancelCita(cita.id)}
                  className="text-red-500 hover:text-red-700 self-start"
                  title="Cancelar cita"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="mt-2 text-xs text-indigo-400">
                Estado: <span className="capitalize">{cita.estado}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente principal para agendar citas
function Usuario() {
  const [formData, setFormData] = useState({
    propietario: '',
    paciente: '',
    direccion: '',
    telefono: '',
    consulta: 'domicilio',
    motivo: 'ecografia',
    otroMotivo: '',
    fecha: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);

    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('Usuario no autenticado');

      // Preparar datos para enviar
      const citaData = {
        ...formData,
        user_id: user.id,
        motivo: formData.motivo === 'otro' ? formData.otroMotivo : formData.motivo,
        estado: 'pendiente',
        creado_en: new Date().toISOString()
      };

      // Insertar en Supabase
      const { error } = await supabase
        .from('citas')
        .insert([citaData]);

      if (error) throw error;

      // Resetear formulario
      setFormData({
        propietario: '',
        paciente: '',
        direccion: '',
        telefono: '',
        consulta: 'domicilio',
        motivo: 'ecografia',
        otroMotivo: '',
        fecha: ''
      });
      setSuccess(true);
      
    } catch (error) {
      alert(`Error al agendar cita: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario de Cita */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Nueva Cita</h2>
            </div>
            <div className="p-6">
              {success && (
                <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                  <FaCheck className="mr-2" />
                  ¡Cita agendada con éxito!
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaUser className="mr-2 text-indigo-500" />
                    Propietario
                  </label>
                  <input
                    type="text"
                    name="propietario"
                    value={formData.propietario}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaPaw className="mr-2 text-indigo-500" />
                    Paciente
                  </label>
                  <input
                    type="text"
                    name="paciente"
                    value={formData.paciente}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Nombre de la mascota"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaPhone className="mr-2 text-indigo-500" />
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Número de contacto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                    Dirección
                  </label>
                  <input
                    type="text"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required={formData.consulta === 'domicilio'}
                    disabled={formData.consulta !== 'domicilio'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-gray-100"
                    placeholder="Calle, número, colonia"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaHome className="mr-2 text-indigo-500" />
                      Tipo de consulta
                    </label>
                    <select
                      name="consulta"
                      value={formData.consulta}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                      <option value="domicilio">A domicilio</option>
                      <option value="consultorio">En consultorio</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <FaClinicMedical className="mr-2 text-indigo-500" />
                      Motivo
                    </label>
                    <select
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                      <option value="ecografia">Ecografía</option>
                      <option value="rayos_x">Rayos X</option>
                      <option value="vacunacion">Vacunación</option>
                      <option value="desparacitacion">Desparasitación</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                </div>

                {formData.motivo === 'otro' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Especificar motivo
                    </label>
                    <input
                      type="text"
                      name="otroMotivo"
                      value={formData.otroMotivo}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      placeholder="Describe el motivo de la consulta"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 text-indigo-500" />
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-colors flex justify-center items-center ${
                      isSubmitting 
                        ? 'bg-indigo-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Agendando...
                      </>
                    ) : (
                      'Agendar Cita'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Panel de información y citas existentes */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-indigo-600 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Tus Citas</h2>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-indigo-600 mb-3">Información importante</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <FaInfoCircle className="text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Las citas a domicilio tienen un costo adicional según la zona</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Por favor asegúrese de proporcionar datos correctos</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-indigo-400 mt-1 mr-2 flex-shrink-0" />
                    <span>Recibirá una confirmación vía telefónica</span>
                  </li>
                </ul>
              </div>

              <div className="border-t pt-4">
                <CitasUsuario />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Usuario;