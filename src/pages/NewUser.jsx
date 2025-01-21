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
            <div className="form-container bg-white p-6 rounded-lg shadow-md w-full max-w-md sm:w-80 md:w-96 mx-auto">
                <p className="title">Iniciar Sesion</p>
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
                            className="mb-5 p-2 px-4 rounded-md shadow-md shadow-[#A78BFA] bg-[#111827] text-white'"
                            name="role"
                            id="role"
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="usuario">Usuario</option>
                            <option value="medico">Medico</option>
                        </select>
                    </div>
                    <button className="sign mb-3">Crear Cuenta</button>
                    <p className="signup mt-4 text-sm text-gray-500"  >volver a  <Link to="/login/Login"
                    className="ml-3 text-indigo-600 hover:text-indigo-700">Iniciar Sesion</Link></p>
                </form>
            </div>
        </div>
    )
}

export default NewUser