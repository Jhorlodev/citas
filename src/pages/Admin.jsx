import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, PawPrint, Search, Plus, Edit, Trash2, Menu } from 'lucide-react';
import { supabase } from '../components/lib/supabase.js';
import Swal from 'sweetalert2';

function Admin() {
    const [citas, setCitas] = useState([]);

    useEffect(() => {
        fetchCitas();
    }, []);

    const fetchCitas = async () => {
        try {
            const { data, error } = await supabase.from('citas').select('*');
            if (error) {
                console.error('Error fetching citas:', error);
            } else {
                setCitas(data);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            // Mostrar confirmación
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "¡No podrás revertir esto!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            });

            if (result.isConfirmed) {
                // Eliminar la cita
                const { error } = await supabase.from('citas').delete().eq('id', id);
                if (error) {
                    throw error;
                }
                // Actualizar la lista de citas
                await fetchCitas();
                // Mostrar mensaje de éxito
                Swal.fire('¡Eliminado!', 'La cita ha sido eliminada.', 'success');
            }
        } catch (error) {
            console.error('Error eliminando la cita:', error);
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
        }
    };

    const [doctors, setDoctors] = useState([
        {
            id: 1,
            name: "Dr. Juan Pérez",
            specialty: "Cirugía"
        },
        {
            id: 2,
            name: "Dra. Ana López",
            specialty: "Dermatología"
        }
    ]);

    const [showSidebar, setShowSidebar] = useState(false); // Controla la visibilidad del panel en móviles
    const [currentView, setCurrentView] = useState("general"); // Controla la vista actual (general o médicos)
    const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "" }); // Estado para el formulario de nuevo médico

    // Estado para las tarjetas de resumen
    const [todayAppointments, setTodayAppointments] = useState(0);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [totalConsultations, setTotalConsultations] = useState(0);

    // Función para calcular las citas de hoy, la próxima cita y el tiempo restante
    useEffect(() => {
        const today = new Date().toISOString().split("T")[0]; // Fecha de hoy en formato YYYY-MM-DD
        const todayApps = citas.filter((cita) => cita.fecha === today); // Asegúrate de que el campo sea 'fecha'
        setTodayAppointments(todayApps.length);

        // Encontrar la próxima cita
        const now = new Date();
        const upcomingApps = citas
            .filter((cita) => new Date(`${cita.fecha}T${cita.horario}`) > now)
            .sort((a, b) => new Date(`${a.fecha}T${a.horario}`) - new Date(`${b.fecha}T${b.horario}`));

        if (upcomingApps.length > 0) {
            setNextAppointment(upcomingApps[0]);
            const nextAppTime = new Date(`${upcomingApps[0].fecha}T${upcomingApps[0].horario}`);
            const diff = nextAppTime - now;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            setTimeRemaining(`${hours}h ${minutes}m`);
        } else {
            setNextAppointment(null);
            setTimeRemaining("No hay citas próximas");
        }

        // Total de consultas
        setTotalConsultations(citas.length);
    }, [citas]);

    const toggleSidebar = () => {
        setShowSidebar(!showSidebar);
    };

    const handleAddDoctor = (e) => {
        e.preventDefault();
        const doctor = {
            id: doctors.length + 1,
            name: newDoctor.name,
            specialty: newDoctor.specialty
        };
        setDoctors([...doctors, doctor]);
        setNewDoctor({ name: "", specialty: "" }); // Limpiar el formulario
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Botón para mostrar/ocultar el panel en móviles */}
            <button
                onClick={toggleSidebar}
                className="fixed lg:hidden z-50 top-4 left-4 p-2 bg-blue-600 text-white rounded-lg shadow"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Barra lateral */}
            <div
                className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform ${showSidebar ? "translate-x-0" : "-translate-x-full"
                    } lg:translate-x-0 transition-transform duration-200 ease-in-out z-40`}
            >
                <div className="flex items-center gap-2 p-6 border-b">
                    <PawPrint className="w-8 h-8 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-800">VetCare</h1>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li
                            className={`${currentView === "general" ? "bg-blue-50 text-blue-600" : "text-gray-600"
                                } p-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 cursor-pointer`}
                            onClick={() => setCurrentView("general")}
                        >
                            <Calendar className="w-5 h-5" />
                            <span>General</span>
                        </li>
                        <li
                            className={`${currentView === "doctors" ? "bg-blue-50 text-blue-600" : "text-gray-600"
                                } p-3 rounded-lg flex items-center gap-2 hover:bg-gray-50 cursor-pointer`}
                            onClick={() => setCurrentView("doctors")}
                        >
                            <Users className="w-5 h-5" />
                            <span>Médicos</span>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Contenido principal */}
            <div className="lg:ml-64 p-4 lg:p-8 h-screen bg-amber-100">
                {/* Vista General */}
                {currentView === "general" && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Panel de Citas</h2>
                            <p className="text-gray-600">Gestiona las citas veterinarias</p>
                        </div>

                        {/* Barra de acciones */}
                        <div className="flex flex-col lg:flex-row justify-between mb-6 space-y-4 lg:space-y-0">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar cita..."
                                    className="pl-10 pr-4 py-2 border rounded-lg w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
                                <Plus className="w-5 h-5" />
                                Nueva Cita
                            </button>
                        </div>

                        {/* Tabla de citas */}
                        <div className="bg-white rounded-lg shadow overflow-x-auto mb-8">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mascota</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propietario</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dirección</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {citas.map((cita) => (
                                        <tr key={cita.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <PawPrint className="w-5 h-5 text-gray-400 mr-2" />
                                                    <span className="text-sm font-medium text-gray-900">{cita.paciente}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.propietario}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.fecha}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.horario}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.direccion}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.motivo}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(cita.id)}
                                                        className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tarjetas de resumen */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Citas hoy */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full">
                                        <Calendar className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Citas Hoy</h3>
                                        <p className="text-2xl font-bold text-blue-600">{todayAppointments}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Próxima cita */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-3 rounded-full">
                                        <Clock className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Próxima Cita</h3>
                                        {nextAppointment ? (
                                            <>
                                                <p className="text-sm text-gray-600">{nextAppointment.paciente} ({nextAppointment.propietario})</p>
                                                <p className="text-sm text-green-600">{nextAppointment.horario} - {timeRemaining}</p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-green-600">No hay citas próximas</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Total de consultas */}
                            <div className="bg-white p-6 rounded-lg shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-100 p-3 rounded-full">
                                        <Users className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">Total Consultas</h3>
                                        <p className="text-2xl font-bold text-purple-600">{totalConsultations}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Vista Médicos */}
                {currentView === "doctors" && (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-800">Panel de Médicos</h2>
                            <p className="text-gray-600">Gestiona los perfiles de los médicos</p>
                        </div>

                        {/* Formulario para agregar médicos */}
                        <form onSubmit={handleAddDoctor} className="mb-6 bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Agregar Nuevo Médico</h3>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Nombre del médico"
                                    value={newDoctor.name}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Especialidad"
                                    value={newDoctor.specialty}
                                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                            >
                                <Plus className="w-5 h-5 inline-block" /> Agregar Médico
                            </button>
                        </form>

                        {/* Lista de médicos */}
                        <div className="bg-white rounded-lg shadow overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Especialidad</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {doctors.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doctor.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doctor.specialty}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-900">
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Admin;