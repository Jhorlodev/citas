import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../components/lib/supabase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaMapMarkerAlt, FaPhone, FaCalendarAlt, FaClock, FaPaw, FaUser, FaHome, FaClinicMedical } from 'react-icons/fa';

function Usuario() {
    const [formData, setFormData] = useState({
        propietario: '',
        paciente: '',
        direccion: '',
        telefono: '',
        consulta: 'domicilio',
        motivo: 'ecografia',
        otroMotivo: '',
        fecha: '',
        lat: null,
        lng: null
    });
    const [dataUser, setDataUser] = useState({});
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [addressValid, setAddressValid] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setDataUser(user);
                // Establecer user_id solo aquí
                setFormData(prev => ({ ...prev, user_id: user.id }));
            } else {
                navigate('/login/Login');
            }
        };
        checkSession();
    }, [navigate]); 
    

    useEffect(() => {
        const fetchUserCitas = async () => {
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('user_id', formData.user_id);
            
            if (!error) setCitas(data || []);
        };
        fetchUserCitas();
    }, [formData.user_id]);

    // Manejadores
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const geocodeAddress = async () => {
        if (!formData.direccion) return;
        
        setLoading(true);
        try {
            // Simulación de geocodificación - reemplazar con API real en producción
            const mockGeocode = {
                lat: 19.4326 + (Math.random() * 0.1 - 0.05),
                lng: -99.1332 + (Math.random() * 0.1 - 0.05)
            };
            
            setFormData(prev => ({
                ...prev,
                lat: mockGeocode.lat,
                lng: mockGeocode.lng
            }));
            setAddressValid(true);
            
            Swal.fire({
                icon: 'success',
                title: 'Dirección validada',
                text: 'Hemos localizado la dirección en el mapa',
                showConfirmButton: false,
                timer: 1500
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No pudimos validar la dirección. Por favor verifica que sea correcta.',
            });
            setAddressValid(false);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!addressValid) {
            Swal.fire({
                icon: 'warning',
                title: 'Dirección no validada',
                text: 'Por favor verifica la dirección antes de continuar',
            });
            return;
        }

        try {
            const { error } = await supabase.from('citas').insert([{
                ...formData,
                id: uuidv4(), // Generar nuevo UUID para cada cita
                user_id: dataUser.id // Usar ID del usuario autenticado
            }]);
            
            if (error) throw error;
            
            Swal.fire({
                icon: 'success',
                title: 'Cita agendada',
                text: 'Tu cita ha sido registrada exitosamente',
                showConfirmButton: false,
                timer: 2000
            });
            
            // Reset form
            setFormData({
                ...formData,
                propietario: '',
                paciente: '',
                direccion: '',
                telefono: '',
                motivo: 'ecografia',
                otroMotivo: '',
                fecha: '',
                lat: null,
                lng: null
            });
            setAddressValid(false);
            
            // Refresh appointments list
            const { data } = await supabase
                .from('citas')
                .select('*')
                .eq('user_id', formData.user_id);
            setCitas(data || []);
            
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No pudimos agendar la cita. Por favor intenta nuevamente.',
            });
            console.error(error);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login/Login');
    };

    const cancelAppointment = async (id) => {
        const result = await Swal.fire({
            title: '¿Cancelar cita?',
            text: "Esta acción no se puede deshacer",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, cancelar',
            cancelButtonText: 'No, mantener'
        });
        
        if (result.isConfirmed) {
            try {
                const { error } = await supabase
                    .from('citas')
                    .delete()
                    .eq('id', id);
                
                if (error) throw error;
                
                setCitas(citas.filter(cita => cita.id !== id));
                Swal.fire('Cancelada', 'Tu cita ha sido cancelada', 'success');
            } catch (error) {
                Swal.fire('Error', 'No se pudo cancelar la cita', 'error');
            }   
        }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <FaPaw className="text-indigo-600 text-2xl" />
                    <h1 className="text-xl font-bold text-gray-800">VetCare</h1>
                </div>
                <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                >
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appointment Form */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Nueva Cita</h2>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Pet Owner */}
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

                            {/* Pet */}
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

                            {/* Contact */}
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

                            {/* Address with Geocoding */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                                    Dirección
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        name="direccion"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Calle, número, colonia"
                                    />
                                    <button
                                        type="button"
                                        onClick={geocodeAddress}
                                        disabled={!formData.direccion || loading}
                                        className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Validando...' : 'Validar'}
                                    </button>
                                </div>
                                {addressValid && (
                                    <p className="mt-1 text-sm text-green-600 flex items-center">
                                        <FaMapMarkerAlt className="mr-1" />
                                        Dirección verificada
                                    </p>
                                )}
                            </div>

                            {/* Appointment Type */}
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        placeholder="Describe el motivo de la consulta"
                                    />
                                </div>
                            )}

                            {/* Date */}
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
                                    disabled={!addressValid || loading}
                                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    <FaCalendarAlt className="mr-2" />
                                    {loading ? 'Agendando...' : 'Agendar Cita'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Appointments List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-indigo-600 px-6 py-4">
                        <h2 className="text-xl font-semibold text-white">Mis Citas</h2>
                    </div>
                    <div className="p-6">
                        {citas.length === 0 ? (
                            <div className="text-center py-8">
                                <FaCalendarAlt className="mx-auto text-gray-400 text-4xl mb-3" />
                                <h3 className="text-lg font-medium text-gray-700">No tienes citas agendadas</h3>
                                <p className="mt-1 text-sm text-gray-500">Agenda tu primera cita usando el formulario</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {citas.map((cita) => (
                                    <div key={cita.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                                                    <FaPaw className="mr-2 text-indigo-500" />
                                                    {cita.paciente}
                                                </h3>
                                                <p className="text-gray-600">{cita.propietario}</p>
                                            </div>
                                            <button
                                                onClick={() => cancelAppointment(cita.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                        
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FaCalendarAlt className="mr-2 text-indigo-500" />
                                                <span>{new Date(cita.fecha).toLocaleDateString('es-MX', { 
                                                    weekday: 'long', 
                                                    year: 'numeric', 
                                                    month: 'long', 
                                                    day: 'numeric' 
                                                })}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                                                <span className="truncate">{cita.direccion}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FaClinicMedical className="mr-2 text-indigo-500" />
                                                <span>{cita.consulta === 'domicilio' ? 'A domicilio' : 'En consultorio'}</span>
                                            </div>
                                            
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FaClinicMedical className="mr-2 text-indigo-500" />
                                                <span>{cita.motivo}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    </div>
);

}

export default Usuario