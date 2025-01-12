import { useState } from 'react'
import { supabase } from '../components/lib/supabase'

function Usuario() {
    const [formData, setFormData] = useState({
        propietario: '',
        paciente: '',
        direccion: '',
        telefono: '',
        consulta: 'domicilio',
        motivo: 'ecografia',
        otroMotivo: '',
        horario: ''
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const { propietario, paciente, direccion, telefono, consulta, motivo, otroMotivo, horario } = formData

        try {
            const { error } = await supabase.from('citas').insert([
                { propietario, paciente, direccion, telefono, consulta, motivo: motivo === 'otro' ? otroMotivo : motivo, horario }
            ])
            if (error) {
                console.log(error)
            } else {
                console.log('Cita registrada con éxito')
                setFormData({
                    propietario: '',
                    paciente: '',
                    direccion: '',
                    telefono: '',
                    consulta: 'domicilio',
                    motivo: 'ecografia',
                    otroMotivo: '',
                    horario: ''
                })
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <div className="form-container ">
                <p className="title">Registrar Cita</p>
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="propietario">Propietario:</label>
                        <input
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
                            name="horario"
                            id="horario"
                            value={formData.horario}
                            onChange={handleChange}
                        >
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((time) => (
                                <option key={time} value={time}>{time}</option>
                            ))}
                        </select>
                    </div>
                    <button className="sign mb-3">Registrar</button>
                </form>
            </div>
        </div>
    )
}

export default Usuario
