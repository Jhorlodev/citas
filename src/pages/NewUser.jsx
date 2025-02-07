import { useState, useEffect } from 'react'
import { v4 as uuid } from 'uuid'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../components/lib/supabase'
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa6";
import { RiLockPasswordFill } from "react-icons/ri";


function NewUser() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('usuario')
    const navigate = useNavigate()

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                console.log('Usuario autenticado:', session.user.user_metadata.role)
            }
        }
        fetchSession()
    }, [])

    const handleSignUp = async (e) => {
        e.preventDefault()

        try {

            const { error: signUpError } = await supabase.auth.signUp({
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
                console.log(signUpError.message)
                alert(signUpError.message)
                return
            }

            // Registro en tabla profiles
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    role,
                    email,
                    username,
                    password,
                    usuario_id: uuid()
                })

            if (profileError) {
                alert('Error al crear el perfil')
                console.log(profileError.message)
                return
            }

            // Redirección según rol
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user?.user_metadata?.role === 'medico') {
                navigate('/Medico')
            } else {
                navigate('/Usuario')
            }

        } catch (error) {
            console.error('Error en registro:', error)
            alert('Error en el proceso de registro')
        }
    }

    return (
        <div className='flex flex-col items-center justify-center min-h-screen bg-[#edf7f7] p-4'>
            <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Crear Nueva Cuenta
                </h1>

                <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <div className='flex gap-2 items-center'>
                                Correo electrónico: <MdEmail className='w-5 h-5 mb-2' />
                            </div>
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ejemplo@correo.com"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            required
                        />
                    </div>

                    {/* Username */}
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <div className='flex gap-2 items-center'>
                                Nombre de usuario: <FaUser className='w-5 h-5 mb-2' />
                            </div>
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Tu nombre de usuario"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <div className='flex gap-2 items-center'>
                                Contraseña: <RiLockPasswordFill className='w-5 h-5 mb-2' />
                            </div>

                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            required
                        />
                    </div>


                    <div>
                        <label
                            htmlFor="role"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            <div className='flex gap-2 items-center'>
                                Tipo de cuenta: <FaUser className='w-5 h-5 mb-2' />
                            </div>

                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                        >
                            <option value="usuario">Usuario</option>
                            <option value="medico">Médico</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                    >
                        Registrar Cuenta
                    </button>

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-600 mt-4">
                        ¿Ya tienes cuenta?{' '}
                        <Link
                            to="/login/Login"
                            className="text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                            Iniciar Sesión
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default NewUser