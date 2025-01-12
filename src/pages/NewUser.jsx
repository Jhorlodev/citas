import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../components/lib/supabase'

function NewUser() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('usuario') // Default role
    const navigate = useNavigate()

    const handleSignUp = async (e) => {
        e.preventDefault()

        try {
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ role: role, username: username })
            console.log(insertError)

            // Sign up the user
            const { user, error } = await supabase.auth.signUp({
                email,
                password // Use the password from the input field
            })

            if (error) {
                console.log(error)
                return
            }

            // Update user metadata
            const { error: updateError } = await supabase.auth.update({
                data: { username, role }
            })

            if (updateError) {
                console.log(updateError)
                return
            }

            // Redirect based on user role
            if (user && user.user_metadata.role === 'medico') {
                navigate('/medico')
            } else if (user && user.user_metadata.role === 'usuario') {
                navigate('/usuario')
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen'>
            <div className="form-container">
                <p className="title">Sign Up</p>
                <form className="form" onSubmit={handleSignUp}>
                    <div className="input-group">
                        <label htmlFor="email">Correo:</label>
                        <input
                            type="text"
                            name="email"
                            id="email"
                            placeholder="Usuario@ejemplo.com"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="username">Usuario:</label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            placeholder="Nombre de usuario"
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="password">Contraseña:</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="Contraseña"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="input-group">
                        <label htmlFor="role">Rol:</label>
                        <select
                            name="role"
                            id="role"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="usuario">Usuario</option>
                            <option value="medico">Medico</option>
                        </select>
                    </div>
                    <button className="sign mb-3">Sign Up</button>
                </form>
            </div>
        </div>
    )
}

export default NewUser