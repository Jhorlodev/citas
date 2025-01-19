import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../components/lib/supabase'
import { useEffect } from 'react'

function NewUser() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('usuario') // Default role
    const navigate = useNavigate()

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log('hay usuario')
                console.log(session.user.user_metadata.role)
            }
        }
        fetchSession()
    }, [])

    const handleSignUp = async (e) => {
        e.preventDefault()

        try {
            const { user, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        username,
                        role
                    }
                }
            })

            if (signUpError) {
                console.log(signUpError)
                alert(signUpError.message)
                return
            }

            // Insert user profile into the profiles table
            const { error: insertError } = await supabase
                .from('profiles')
                .insert({ role, email, username, password })

            if (insertError) {
                console.log(insertError)
                alert('Error al registrar el perfil')
                return
            }

            console.log(user)

            // Wait for the session to be established
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                if (session.user.user_metadata.role === 'medico') {
                    navigate('/Medico')
                } else {
                    navigate('/Usuario')
                }
            } else {
                navigate('/login/Login')
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
                    <p>volver a  <Link to="/login/Login">login</Link></p>
                </form>
            </div>
        </div>
    )
}

export default NewUser