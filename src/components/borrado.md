<div className="social-icons flex justify-center space-x-4">
                   /* <button aria-label="Log in with Google" className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 fill-current text-gray-700">
                            <path d="M16.318 13.714v5.484h9.078c-0.37 2.354-2.745 6.901-9.078 6.901-5.458 0-9.917-4.521-9.917-10.099s4.458-10.099 9.917-10.099c3.109 0 5.193 1.318 6.38 2.464l4.339-4.182c-2.786-2.599-6.396-4.182-10.719-4.182-8.844 0-16 7.151-16 16s7.156 16 16 16c9.234 0 15.365-6.49 15.365-15.635 0-1.052-0.115-1.854-0.255-2.651z"></path>
                        </svg>
                    </button>
                    <button aria-label="Log in with Twitter" className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 fill-current text-gray-700">
                            <path d="M31.937 6.093c-1.177 0.516-2.437 0.871-3.765 1.032 1.355-0.813 2.391-2.099 2.885-3.631-1.271 0.74-2.677 1.276-4.172 1.579-1.192-1.276-2.896-2.079-4.787-2.079-3.625 0-6.563 2.937-6.563 6.557 0 0.521 0.063 1.021 0.172 1.495-5.453-0.255-10.287-2.875-13.52-6.833-0.568 0.964-0.891 2.084-0.891 3.303 0 2.281 1.161 4.281 2.916 5.457-1.073-0.031-2.083-0.328-2.968-0.817v0.079c0 3.181 2.26 5.833 5.26 6.437-0.547 0.145-1.131 0.229-1.724 0.229-0.421 0-0.823-0.041-1.224-0.115 0.844 2.604 3.26 4.5 6.14 4.557-2.239 1.755-5.077 2.801-8.135 2.801-0.521 0-1.041-0.025-1.563-0.088 2.917 1.86 6.36 2.948 10.079 2.948 12.067 0 18.661-9.995 18.661-18.651 0-0.276 0-0.557-0.021-0.839 1.287-0.917 2.401-2.079 3.281-3.396z"></path>
                        </svg>
                    </button>
                    <button aria-label="Log in with GitHub" className="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="w-6 h-6 fill-current text-gray-700">
                            <path d="M16 0.396c-8.839 0-16 7.167-16 16 0 7.073 4.584 13.068 10.937 15.183 0.803 0.151 1.093-0.344 1.093-0.772 0-0.38-0.009-1.385-0.015-2.719-4.453 0.964-5.391-2.151-5.391-2.151-0.729-1.844-1.781-2.339-1.781-2.339-1.448-0.989 0.115-0.968 0.115-0.968 1.604 0.109 2.448 1.645 2.448 1.645 1.427 2.448 3.744 1.74 4.661 1.328 0.14-1.031 0.557-1.74 1.011-2.135-3.552-0.401-7.287-1.776-7.287-7.907 0-1.751 0.62-3.177 1.645-4.297-0.177-0.401-0.719-2.031 0.141-4.235 0 0 1.339-0.427 4.4 1.641 1.281-0.355 2.641-0.532 4-0.541 1.36 0.009 2.719 0.187 4 0.541 3.043-2.068 4.381-1.641 4.381-1.641 0.859 2.204 0.317 3.833 0.161 4.235 1.015 1.12 1.635 2.547 1.635 4.297 0 6.145-3.74 7.5-7.296 7.891 0.556 0.479 1.077 1.464 1.077 2.959 0 2.14-0.020 3.864-0.020 4.385 0 0.416 0.28 0.916 1.104 0.755 6.4-2.093 10.979-8.093 10.979-15.156 0-8.833-7.161-16-16-16z"></path>
                        </svg>
                    </button>
                </div>*/

posible vista de usuario
import { useState, useEffect } from 'react';
import { supabase } from '../components/lib/supabase';
import { useNavigate } from 'react-router-dom';

function Usuario() {
const [formData, setFormData] = useState({
propietario: '',
paciente: '',
direccion: '',
telefono: '',
consulta: 'domicilio',
motivo: 'ecografia',
otroMotivo: '',
horario: '',
fecha: '',
});
const [ocupados, setOcupados] = useState([]);
const [userCitas, setUserCitas] = useState([]);
const navigate = useNavigate();

    // Obtener citas del usuario al cargar
    useEffect(() => {
        const fetchData = async () => {
            const user = supabase.auth.user();
            if (user) {
                await fetchUserCitas(user.id);
            }
        };
        fetchData();
    }, []);

    // Obtener horas ocupadas cuando cambia la fecha
    useEffect(() => {
        if (formData.fecha) {
            fetchCitasOcupadas();
        }
    }, [formData.fecha]);

    const fetchUserCitas = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('user_id', userId)
                .order('fecha', { ascending: true })
                .order('horario', { ascending: true });

            if (error) throw error;
            setUserCitas(data);
        } catch (error) {
            console.error('Error fetching citas:', error);
        }
    };

    const fetchCitasOcupadas = async () => {
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('horario')
                .eq('fecha', formData.fecha);

            if (error) throw error;
            setOcupados(data.map(cita => cita.horario));
        } catch (error) {
            console.error('Error fetching ocupados:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = supabase.auth.user();

        if (!user) {
            alert('Debes iniciar sesión para agendar citas');
            return;
        }

        if (ocupados.includes(formData.horario)) {
            alert('Horario no disponible. Seleccione otra hora.');
            return;
        }

        try {
            const { error } = await supabase.from('citas').insert([{
                ...formData,
                motivo: formData.motivo === 'otro' ? formData.otroMotivo : formData.motivo,
                user_id: user.id
            }]);

            if (error) throw error;

            alert('Cita registrada exitosamente!');
            setFormData({
                propietario: '',
                paciente: '',
                direccion: '',
                telefono: '',
                consulta: 'domicilio',
                motivo: 'ecografia',
                otroMotivo: '',
                horario: '',
                fecha: '',
            });
            await fetchUserCitas(user.id);

        } catch (error) {
            console.error('Error al guardar cita:', error);
            alert('Error al registrar la cita');
        }
    };

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            navigate('/login/Login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[#edf7f7] p-4">
            <div className="max-w-2xl mx-auto">
                {/* Encabezado */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-800">VetMobile - Agenda de Citas</h1>
                    <button
                        onClick={handleSignOut}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Cerrar Sesión
                    </button>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Nueva Cita</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campos del formulario */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Propietario</label>
                                <input
                                    type="text"
                                    name="propietario"
                                    value={formData.propietario}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Paciente</label>
                                <input
                                    type="text"
                                    name="paciente"
                                    value={formData.paciente}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Tipo de Consulta</label>
                                <select
                                    name="consulta"
                                    value={formData.consulta}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="domicilio">Domicilio</option>
                                    <option value="consultorio">Consultorio</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <input
                                    type="date"
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Motivo</label>
                                <select
                                    name="motivo"
                                    value={formData.motivo}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="ecografia">Ecografía</option>
                                    <option value="rayos_x">Rayos X</option>
                                    <option value="vacunacion">Vacunación</option>
                                    <option value="desparacitacion">Desparasitación</option>
                                    <option value="otro">Otro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Horario</label>
                                <select
                                    name="horario"
                                    value={formData.horario}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                >
                                    <option value="">Seleccione hora</option>
                                    {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                                        <option
                                            key={time}
                                            value={time}
                                            disabled={ocupados.includes(time)}
                                        >
                                            {time} {ocupados.includes(time) && '(Ocupado)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {formData.motivo === 'otro' && (
                            <div>
                                <label className="block text-sm font-medium mb-1">Especificar motivo</label>
                                <input
                                    type="text"
                                    name="otroMotivo"
                                    value={formData.otroMotivo}
                                    onChange={handleChange}
                                    className="w-full p-2 border rounded-md"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                        >
                            Agendar Cita
                        </button>
                    </form>
                </div>

                {/* Listado de Citas */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Mis Citas Programadas</h2>
                    {userCitas.length === 0 ? (
                        <p className="text-gray-500 text-center">No tienes citas programadas</p>
                    ) : (
                        <div className="space-y-4">
                            {userCitas.map(cita => (
                                <div
                                    key={cita.id}
                                    className="border-l-4 border-blue-500 p-4 bg-gray-50 rounded-md"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-medium">{cita.paciente}</h3>
                                            <p className="text-sm text-gray-600">{cita.propietario}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-sm rounded-full ${cita.consulta === 'domicilio'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-purple-100 text-purple-800'
                                            }`}>
                                            {cita.consulta}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 text-sm">
                                        <p className="text-gray-600">
                                            📅 {cita.fecha} - 🕒 {cita.horario}
                                        </p>
                                        <p className="text-gray-600">📍 {cita.direccion}</p>
                                        <p className="text-gray-600">📞 {cita.telefono}</p>
                                        <p className="text-gray-600">📝 Motivo: {cita.motivo}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

}

export default Usuario;
