import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../components/lib/supabase'
import './Login.css'
import './Google.css'
function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) {
                alert(error.message)
                setEmail('')
                setPassword('')
                return
            }
            if (data?.user?.user_metadata?.role === 'medico') {
                navigate('/Medico')
            } else {
                navigate('/Usuario')
            }
        } catch (error) {
            alert(error.message)
        }
    }

    return (
        <div className='flex flex-col items-center justify-center h-screen bg-[#edf7f7]'>
            <div className="bg-white p-6 rounded-lg shadow-lg   sm:w-80 md:w-[500px] md:h-[650px] justify-center mx-auto">
                <p className="  text-center text-3xl font-extrabold mb-9  text-gray-800 ">Iniciar Sesión</p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Correo:
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Usuario@ejemplo.com"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Contraseña:
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="•••••••"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-[#D3D6E2] text-black text-bold rounded-md shadow-sm  focus:outline-none focus:ring-2 focus:ring-[#a5d3f1]"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full mx-auto text-center  bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        Ingresar
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">o continúa con</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="flex justify-center  ">
                    <button className="button">
                        <svg xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" viewBox="0 0 256 262">
                            <path fill="#4285F4" d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"></path>
                            <path fill="#34A853" d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"></path>
                            <path fill="#FBBC05" d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"></path>
                            <path fill="#EB4335" d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"></path>
                        </svg>
                        Continue with Google
                    </button>

                </div>

                <p className="text-center text-sm text-gray-500">
                    ¿No tienes cuenta? {' '}
                    <Link
                        to="/NewUser"
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Regístrate aquí
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login