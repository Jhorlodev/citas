import { useState, useEffect } from 'react';
import { supabase } from '../components/lib/supabase';
import { useNavigate } from 'react-router-dom';

function Medico() {
    const [citas, setCitas] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCitas();
    }, []);

    const fetchCitas = async () => {
        try {
            const { data, error } = await supabase.from('citas').select('*');
            if (error) {
                console.log(error);
            } else {
                setCitas(data);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('citas').delete().eq('id', id);
            if (error) {
                console.log(error);
            } else {
                fetchCitas();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log(error, 'se ha cerrado sesión');
        }
        navigate('/login/Login');
    };

    return (
        <div className='flex items-center justify-center min-h-screen bg-[#111827]'>
            <div className="flex flex-col bg-[#111827] w-full max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
                <p className="title text-white text-xl font-bold mb-4 text-center">Citas  Agendadas</p>
                <ul className="flex flex-col gap-4">
                    {citas.map((cita) => (
                        <li key={cita.id} className="mb-4 p-5 flex flex-col gap-2 bg-gray-800 rounded-md">
                            <p className="text-white text-lg"><strong>Propietario:</strong> {cita.propietario}</p>
                            <p className="text-white"><strong>Paciente:</strong> {cita.paciente}</p>
                            <p className="text-white"><strong>Dirección:</strong> {cita.direccion}</p>
                            <p className="text-white"><strong>Teléfono:</strong> {cita.telefono}</p>
                            <p className="text-white"><strong>Consulta:</strong> {cita.consulta}</p>
                            <p className="text-white"><strong>Motivo:</strong> {cita.motivo}</p>
                            <p className="text-white"><strong>Horario:</strong> {cita.horario}</p>
                            <p className="text-white"><strong>Fecha:</strong> {cita.fecha}</p>
                            <button
                                className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleDelete(cita.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
                <button
                    onClick={handleSignOut}
                    className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded self-center"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}

export default Medico;
