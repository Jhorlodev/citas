import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../components/lib/supabase';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

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
        user_id: uuidv4(),
    });
    const [dataUser, setDataUser] = useState({});
    const [ocupados, setOcupados] = useState([]); // Para almacenar las horas ocupadas
    const [citas, setCitas] = useState([]); // Para almacenar las citas del usuario
    const navigate = useNavigate();



    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setDataUser(user);
                console.log(user);


            } else {
                navigate('/login/Login');
            }
        };
        checkSession();
    }, [navigate]);

    useEffect(() => {
        if (formData.fecha) {
            fetchCitas(); // Llama a fetchCitas cuando se selecciona una fecha
        }
    }, [formData.fecha]);



    useEffect(() => {
        const fetchAllCitas = async () => {
            let { data: citas, error } = await supabase
                .from('citas')
                .select('*');
            if (error) {
                console.log(error);
            } else {

                console.log(citas);
                setCitas(citas.map(cita => cita));

            }
        };
        fetchAllCitas();
    }, [dataUser]);





    const fetchCitas = async () => {
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('horario')
                .eq('fecha', formData.fecha); // Filtra por la fecha seleccionada

            if (error) {
                console.log(error);
            } else {
                setOcupados(data.map(cita => cita.horario)); // Almacena las horas ocupadas
            }
        } catch (error) {
            console.log(error);
        }
    };





    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { propietario, paciente, direccion, telefono, consulta, motivo, otroMotivo, horario, fecha, user_id } = formData;

        if (ocupados.includes(horario)) {
            Swal.fire({
                title: 'Cita Ocupada',
                text: 'La cita ya está ocupada para esa hora, elija otra opción por favor.',
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase.from('citas').insert([
                { propietario, user_id, paciente, direccion, telefono, consulta, motivo: motivo === 'otro' ? otroMotivo : motivo, horario, fecha, }
            ]);
            if (error) {
                console.log(error);
            } else {
                Swal.fire({
                    title: 'Cita Agendada',
                    text: 'La cita se ha agendado correctamente.',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });
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
                setOcupados([]);

            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log(error);
        }
        navigate('/login/Login');
    };






    return (
        <div className="min-h-screen bg-[#edf7f7]">
            {/* Header con navegación */}
            <header className="w-full bg-white shadow-md p-4 fixed top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">VetCare</h1>
                    <button
                        className='bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors'
                        onClick={handleSignOut}
                    >
                        Cerrar sesión
                    </button>
                </div>
            </header>

            {/* Contenido principal */}
            <main className="pt-20 px-4 pb-8">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario de registro */}
                    <div className="w-full">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Registrar Cita</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Datos personales */}
                                    <div className="space-y-4 md:col-span-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Propietario:</label>
                                            <input
                                                className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                                type="text"
                                                name="propietario"
                                                required
                                                value={formData.propietario}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Paciente:</label>
                                            <input
                                                className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                                type="text"
                                                name="paciente"
                                                required
                                                value={formData.paciente}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Contacto */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección:</label>
                                        <input
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            type="text"
                                            name="direccion"
                                            required
                                            value={formData.direccion}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono:</label>
                                        <input
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            type="text"
                                            name="telefono"
                                            required
                                            value={formData.telefono}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    {/* Detalles de la cita */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Consulta:</label>
                                        <select
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            name="consulta"
                                            value={formData.consulta}
                                            onChange={handleChange}
                                        >
                                            <option value="domicilio">Domicilio</option>
                                            <option value="consultorio">Consultorio</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo:</label>
                                        <select
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            name="motivo"
                                            value={formData.motivo}
                                            onChange={handleChange}
                                        >
                                            <option value="ecografia">Ecografía</option>
                                            <option value="rayos_x">Rayos X</option>
                                            <option value="vacunacion">Vacunación</option>
                                            <option value="desparacitacion">Desparasitación</option>
                                            <option value="otro">Otro</option>
                                        </select>
                                        {formData.motivo === 'otro' && (
                                            <input
                                                className="w-full px-3 py-2 mt-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                                type="text"
                                                placeholder="Especifique el motivo"
                                                name="otroMotivo"
                                                value={formData.otroMotivo}
                                                onChange={handleChange}
                                            />
                                        )}
                                    </div>

                                    {/* Fecha y hora */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha:</label>
                                        <input
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            type="date"
                                            name="fecha"
                                            required
                                            value={formData.fecha}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Horario:</label>
                                        <select
                                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                            name="horario"
                                            value={formData.horario}
                                            onChange={handleChange}
                                        >
                                            {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                                                <option key={time} value={time} disabled={ocupados.includes(time)}>
                                                    {time} {ocupados.includes(time) && '(Ocupado)'}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md transition-colors mt-6"
                                    type="submit"
                                >
                                    Agendar Cita
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Lista de citas */}
                    <div className="w-full">
                        <div className="bg-white p-6 rounded-lg shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Mis Citas</h2>
                            {citas.length > 0 ? (
                                <div className="space-y-4">
                                    {citas.map((cita) => (
                                        <div key={cita.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <p className="font-semibold text-gray-700">Paciente:</p>
                                                    <p className="text-gray-600">{cita.paciente}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Propietario:</p>
                                                    <p className="text-gray-600">{cita.propietario}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Fecha:</p>
                                                    <p className="text-gray-600">{cita.fecha}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Hora:</p>
                                                    <p className="text-gray-600">{cita.horario}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Consulta:</p>
                                                    <p className="text-gray-600">{cita.consulta}</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-700">Motivo:</p>
                                                    <p className="text-gray-600">{cita.motivo}</p>
                                                </div>
                                                <div className="md:col-span-2">
                                                    <p className="font-semibold text-gray-700">Dirección:</p>
                                                    <p className="text-gray-600">{cita.direccion}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-gray-500">No tienes citas registradas.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Usuario;