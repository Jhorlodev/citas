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
    const [ocupados, setOcupados] = useState([]); // Para almacenar las horas ocupadas
    const navigate = useNavigate();

    useEffect(() => {
        if (formData.fecha) {
            fetchCitas(); // Llama a fetchCitas cuando se selecciona una fecha
        }
    }, [formData.fecha]);

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
        const { propietario, paciente, direccion, telefono, consulta, motivo, otroMotivo, horario, fecha } = formData;

        if (ocupados.includes(horario)) {
            alert('La cita ya está ocupada para esa hora. Por favor, elija otra opción.');
            return;
        }

        try {
            const { error } = await supabase.from('citas').insert([
                { propietario, paciente, direccion, telefono, consulta, motivo: motivo === 'otro' ? otroMotivo : motivo, horario, fecha }
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
        <div className='flex flex-col  mx-auto items-center justify-center  md:max-w-2xl'>
            <button 
            className='m-5 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded' 
            onClick={handleSignOut}>cerrar sesión </button>
            <div className="  bg-[#17202a] md:max-w-md sm:bg-white p-6 rounded-lg shadow-lg">
                <p className="title">Registrar Cita</p>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="propietario">Propietario:</label>
                        <input
                            className="text-white"
                            type="text"
                            name="propietario"
                            id="propietario"
                            value={formData.propietario}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="paciente">Paciente:</label>
                        <input
                            type="text"
                            name="paciente"
                            id="paciente"
                            value={formData.paciente}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="direccion">Dirección:</label>
                        <input
                            type="text"
                            name="direccion"
                            id="direccion"
                            value={formData.direccion}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="telefono">Teléfono:</label>
                        <input
                            type="text"
                            name="telefono"
                            id="telefono"
                            value={formData.telefono}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="consulta">Consulta:</label>
                        <select
                            className='mb-2 p-2 px-4 rounded-md shadow-md shadow-[#A78BFA] focus:border-1 focus:border-[#A78BFA] bg-[#111827] text-white'
                            name="consulta"
                            id="consulta"
                            value={formData.consulta}
                            onChange={handleChange}
                        >
                            <option value="domicilio">Domicilio</option>
                            <option value="consultorio">Consultorio</option>
                        </select>
                    </div>
                    <div className="input-group">
                        <label htmlFor="motivo">Motivo de la consulta:</label>
                        <select
                            className='mb-2 p-2 px-4 rounded-md shadow-md shadow-[#A78BFA] bg-[#111827] text-white'
                            name="motivo"
                            id="motivo"
                            value={formData.motivo}
                            onChange={handleChange}
                        >
                            <option value="ecografia">Ecografía</option>
                            <option value="rayos_x">Rayos X</option>
                            <option value="vacunacion">Vacunación</option>
                            <option value="desparacitacion">Desparacitación</option>
                            <option value="otro">Otro</option>
                        </select>
                        {formData.motivo === 'otro' && (
                            <input
                                type="text"
                                name="otroMotivo"
                                id="otroMotivo"
                                placeholder="Especifique el motivo"
                                value={formData.otroMotivo}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                    <div className="input-group">
                        <label htmlFor="horario">Horario:</label>
                        <select
                            className='mb-2 p-2 px-4 rounded-md shadow-md shadow-[#A78BFA] bg-[#111827] text-white'
                            name="horario"
                            id="horario"
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
                    <div className="input-group">
                        <label htmlFor="fecha">Fecha:</label>
                        <input
                            className='mb-4'
                            type="date"
                            name="fecha"
                            id="fecha"
                            value={formData.fecha}
                            onChange={(e) => {
                                handleChange(e);
                                fetchCitas();
                            }}
                        />
                    </div>
                    <button className="sign mb-3">Agende su cita</button>
                </form>
            </div>
        </div>
    );
}

export default Usuario;
