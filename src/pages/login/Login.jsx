import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../components/lib/supabase'
import './Login.css'

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
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md sm:w-80 md:w-96 mx-auto">
                <p className="text-2xl font-bold mb-4 text-gray-800">Iniciar Sesión</p>
                
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md transition-colors"
                    >
                        Ingresar
                    </button>
                </form>

                <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-4 text-sm text-gray-500">o continúa con</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <div className="flex justify-center space-x-4 mb-6">
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                        </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-gray-100">
                        <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.377-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
                        </svg>
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