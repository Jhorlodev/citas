import { useState, useEffect } from 'react';
import { supabase } from "../components/lib/supabase.js";
import { FaUser, FaCalendarAlt, FaMapMarkerAlt, FaClinicMedical, FaSpinner } from 'react-icons/fa';

function CitasUser() {
  const [user, setUser] = useState(null);
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        if (!user) throw new Error('No hay usuario autenticado');
        
        setUser(user);

        const { data: citasData, error: citasError } = await supabase
          .from('citas')
          .select('*')
          .eq('user_id', user.id)
          .order('fecha', { ascending: true });

        if (citasError) throw citasError;
        
        setCitas(citasData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCancelCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro de cancelar esta cita?')) return;
    
    try {
      const { error } = await supabase
        .from('citas')
        .delete()
        .eq('id', citaId);
      
      if (error) throw error;
      
      setCitas(citas.filter(cita => cita.id !== citaId));
    } catch (err) {
      alert(`Error al cancelar cita: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <FaSpinner className="animate-spin text-2xl text-blue-500" />
    </div>
  );

  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!user) return <div className="p-4">Por favor inicia sesión para ver tus citas</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <FaUser className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Información del Usuario</h2>
        </div>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>ID:</strong> {user.id}</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <FaCalendarAlt className="text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold">Tus Citas</h2>
        </div>

        {citas.length === 0 ? (
          <p>No tienes citas agendadas</p>
        ) : (
          <div className="space-y-4">
            {citas.map((cita) => (
              <div key={cita.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{cita.paciente}</h3>
                    <p className="flex items-center text-gray-600 mt-1">
                      <FaCalendarAlt className="mr-2 text-blue-400" />
                      {new Date(cita.fecha).toLocaleDateString('es-ES', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    <p className="flex items-center text-gray-600 mt-1">
                      <FaClinicMedical className="mr-2 text-blue-400" />
                      {cita.motivo}
                    </p>
                    {cita.tipo_consulta === 'domicilio' && (
                      <p className="flex items-center text-gray-600 mt-1">
                        <FaMapMarkerAlt className="mr-2 text-blue-400" />
                        {cita.direccion}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleCancelCita(cita.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CitasUser;