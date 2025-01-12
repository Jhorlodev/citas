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
            <div className="bg-[#111827] w-full sm:w-80 md:w-96 mx-auto p-6 rounded-lg shadow-lg">
                <p className="title text-white text-xl font-bold mb-4">Citas Registradas</p>
                <ul>
                    {citas.map((cita) => (
                        <li key={cita.id} className="mb-4 p-5 flex flex-col gap-2 bg-gray-800 rounded-md">
                            <p className="text-white text-xl"><strong className='font-bold'>Propietario:</strong> {cita.propietario}</p>
                            <p className="text-white"><strong className='font-extrabold'>Paciente:</strong> {cita.paciente}</p>
                            <p className="text-white"> <strong className='font-extrabold'>Dirección:</strong> {cita.direccion}</p>
                            <p className="text-white"> <strong className='font-extrabold'>Teléfono:</strong> {cita.telefono}</p>
                            <p className="text-white"> <strong className='font-extrabold'>Consulta:</strong> {cita.consulta}</p>
                            <p className="text-white"> <strong className='font-extrabold'>Motivo:</strong> {cita.motivo}</p>
                            <p className="text-white"> <strong className='font-extrabold'>Horario:</strong> {cita.horario}</p>
                            <button
                                className="mt-4 sign mb-3 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => handleDelete(cita.id)}
                            >
                                Eliminar
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>

    )
}

export default Medico
