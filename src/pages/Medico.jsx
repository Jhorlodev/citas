import { useState, useEffect } from 'react'
import { supabase } from '../components/lib/supabase'

function Medico() {
    const [citas, setCitas] = useState([])

    useEffect(() => {
        fetchCitas()
    }, [])

    const fetchCitas = async () => {
        try {
            const { data, error } = await supabase.from('citas').select('*')
            if (error) {
                console.log(error)
            } else {
                setCitas(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('citas').delete().eq('id', id)
            if (error) {
                console.log(error)
            } else {
                fetchCitas()
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <div className="form-container">
                <p className="title">Citas Registradas</p>
                <ul>
                    {citas.map((cita) => (
                        <li key={cita.id} className="mb-4">
                            <p>Propietario: {cita.propietario}</p>
                            <p>Paciente: {cita.paciente}</p>
                            <p>Dirección: {cita.direccion}</p>
                            <p>Teléfono: {cita.telefono}</p>
                            <p>Consulta: {cita.consulta}</p>
                            <p>Motivo: {cita.motivo}</p>
                            <p>Horario: {cita.horario}</p>
                            <button className="sign mb-3" onClick={() => handleDelete(cita.id)}>Eliminar</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default Medico
