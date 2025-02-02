import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
        user_id: uuidv4(),
    });
    const [ocupados, setOcupados] = useState([]); // Para almacenar las horas ocupadas
    const [citas, setCitas] = useState([]); // Para almacenar las citas del usuario
    const navigate = useNavigate();

    useEffect(() => {
        const checkSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await fetchUserCitas(user.id);
                console.log(user.id);
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

    const fetchUserCitas = async (id) => {
        try {
            const { data, error } = await supabase
                .from('citas')
                .select('*')
                .eq('user_id', id); // Filtra por el ID del usuario (metadata)

            if (error) {
                console.log(error);
            } else {
                setCitas(data); // Almacena las citas del usuario
            }
        } catch (error) {
            console.log(error);
        }
    };

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
            alert('La cita ya está ocupada para esa hora. Por favor, elija otra opción.');
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
                alert('Cita registrada con éxito');
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
                fetchUserCitas(user.id); // Actualiza las citas del usuario
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
        <div className='flex flex-col mx-auto items-center justify-center  lg:max-w-full md:max-w-full  min-h-screen bg-[#edf7f7]'>
            <button
                className='m-5 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors'
                onClick={handleSignOut}
            >
                Cerrar sesión
            </button>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Registrar Cita</h1>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="propietario">Propietario:</label>
                        <input
                            className="w-full px-3 py-2 border bg-[#D3D6E2] text-black text-bold  border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            type="text"
                            name="propietario"
                            required
                            value={formData.propietario}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="paciente">Paciente:</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold  rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            type="text"
                            name="paciente"
                            required
                            value={formData.paciente}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="direccion">Dirección:</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            type="text"
                            name="direccion"
                            required
                            value={formData.direccion}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="telefono">Teléfono:</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            type="text"
                            name="telefono"
                            required
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="consulta">Consulta:</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1] bg-white"
                            name="consulta"
                            value={formData.consulta}
                            onChange={handleChange}
                        >
                            <option value="domicilio">Domicilio</option>
                            <option value="consultorio">Consultorio</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="motivo">Motivo:</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1] bg-white"
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
                                className="w-full px-3 py-2 mt-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                                type="text"
                                placeholder="Especifique el motivo"
                                name="otroMotivo"
                                value={formData.otroMotivo}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="horario">Horario:</label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1] bg-white"
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

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="fecha">Fecha:</label>
                        <input
                            className="w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            type="date"
                            name="fecha"
                            required
                            value={formData.fecha}
                            onChange={(e) => {
                                handleChange(e);
                                fetchCitas();
                            }}
                        />
                    </div>

                    <button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        type="submit"
                    >
                        Agendar Cita
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md mt-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800 text-center">Mis Citas</h2>
                {citas.length > 0 ? (
                    <ul className="space-y-2">
                        {citas.map((cita) => (
                            <li key={cita.id} className="border p-4 rounded-md">
                                <p><strong>Paciente:</strong> {cita.paciente}</p>
                                <p><strong>Dirección:</strong> {cita.direccion}</p>
                                <p><strong>Teléfono:</strong> {cita.telefono}</p>
                                <p><strong>Consulta:</strong> {cita.consulta}</p>
                                <p><strong>Motivo:</strong> {cita.motivo}</p>
                                <p><strong>Horario:</strong> {cita.horario}</p>
                                <p><strong>Fecha:</strong> {cita.fecha}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-gray-500">No tienes citas registradas.</p>
                )}
            </div>
        </div>
    );
}

export default Usuario;