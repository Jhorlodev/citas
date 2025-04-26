import { useState, useEffect } from 'react';
import { supabase } from '../components/lib/supabase';
import { useNavigate } from 'react-router-dom';

function Medico() {
    const [citas, setCitas] = useState([]);
    const [sortedCitas, setSortedCitas] = useState([]);
    const [currentCitaIndex, setCurrentCitaIndex] = useState(0);
    const [doctorLocation, setDoctorLocation] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchCitas();
        getDoctorLocation();
    }, []);

    useEffect(() => {
        if (citas.length > 0 && doctorLocation) {
            sortCitasByDistance();
        }
    }, [citas, doctorLocation]);

    const getDoctorLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setDoctorLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLoadingLocation(false);
                },
                (error) => {
                    console.error("Error obteniendo ubicación:", error);
                    setLoadingLocation(false);
                    // Use las americas  por defecto si falla
                    setDoctorLocation({ lat: 3.513241, lng: -76.299108 }); // americas
                }
            );
        } else {
            console.log("Geolocalización no soportada");
            setLoadingLocation(false);
            setDoctorLocation({ lat: 3.513241, lng: -76.299108 }); // basilica parque bolivar
        }
    };

    const fetchCitas = async () => {
        try {
            const { data, error } = await supabase.from('citas').select('*');
            if (error) {
                console.log(error);
            } else {
                setCitas(data);
            }
        } catch (error) {
            alert(error);
        }
    };

    // Función para calcular distancia entre dos puntos en km (fórmula Haversine)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const sortCitasByDistance = () => {
        if (!doctorLocation) return;
        
        const citasConDistancia = citas.map(cita => {
            // Asumiendo que cada cita tiene latitud y longitud en su dirección
            // Necesitarías almacenar estas coordenadas cuando se crea la cita
            // O usar un servicio de geocodificación para convertir direcciones a coordenadas
            const distancia = cita.lat && cita.lng 
                ? calculateDistance(doctorLocation.lat, doctorLocation.lng, cita.lat, cita.lng)
                : Infinity; // Si no hay coordenadas, poner al final
            
            return { ...cita, distancia };
        });

        // Ordenar por distancia ascendente
        const citasOrdenadas = [...citasConDistancia].sort((a, b) => a.distancia - b.distancia);
        setSortedCitas(citasOrdenadas);
        setCurrentCitaIndex(0); // empiezo con la más cercana
    };

    const handleNextCita = () => {
        if (currentCitaIndex < sortedCitas.length - 1) {
            setCurrentCitaIndex(currentCitaIndex + 1);
        }
    };

    const handlePrevCita = () => {
        if (currentCitaIndex > 0) {
            setCurrentCitaIndex(currentCitaIndex - 1);
        }
    };

    const handleDelete = async (id) => {
        try {
            const { error } = await supabase.from('citas').delete().eq('id', id);
            if (error) {
                console.log(error);
            } else {
                fetchCitas();
                // Ajustar el índice si estamos eliminando la cita actual
                if (currentCitaIndex >= sortedCitas.length - 1) {
                    setCurrentCitaIndex(Math.max(0, sortedCitas.length - 2));
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.log(error, 'se ha cerrado sesión');
        }
        navigate('/login/Login');
    };

    if (loadingLocation) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-[#edf7f7]'>
                <div className="flex flex-col bg-white w-full max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
                    <p className="text-black text-xl font-extrabold mb-12 mt-10 text-center">
                        Obteniendo tu ubicación...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-center min-h-screen bg-[#edf7f7]'>
            <div className="flex flex-col bg-white w-full max-w-4xl mx-auto p-6 rounded-lg shadow-lg">
                <p className="title text-black text-xl font-extrabold mb-12 mt-10 text-center">
                    <strong>Citas Agendadas</strong>
                </p>
                
                {sortedCitas.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        <div className="mb-4 p-5 flex flex-col gap-2 bg-gray-800 rounded-md">
                            <p className="text-white text-lg">
                                <strong>Propietario:</strong> {sortedCitas[currentCitaIndex]?.propietario}
                            </p>
                            <p className="text-white">
                                <strong>Paciente:</strong> {sortedCitas[currentCitaIndex]?.paciente}
                            </p>
                            <p className="text-white">
                                <strong>Dirección:</strong> {sortedCitas[currentCitaIndex]?.direccion}
                            </p>
                            <p className="text-white">
                                <strong>Distancia:</strong> {sortedCitas[currentCitaIndex]?.distancia?.toFixed(2)} km
                            </p>
                            <p className="text-white">
                                <strong>Teléfono:</strong> {sortedCitas[currentCitaIndex]?.telefono}
                            </p>
                            <p className="text-white">
                                <strong>Consulta:</strong> {sortedCitas[currentCitaIndex]?.consulta}
                            </p>
                            <p className="text-white">
                                <strong>Motivo:</strong> {sortedCitas[currentCitaIndex]?.motivo}
                            </p>
                            <p className="text-white">
                                <strong>Horario:</strong> {sortedCitas[currentCitaIndex]?.horario}
                            </p>
                            <p className="text-white">
                                <strong>Fecha:</strong> {sortedCitas[currentCitaIndex]?.fecha}
                            </p>
                            
                            <div className="flex justify-between mt-4">
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    onClick={handlePrevCita}
                                    disabled={currentCitaIndex === 0}
                                >
                                    Anterior
                                </button>
                                
                                <button
                                    className="bg-[#db1f32] hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    onClick={() => handleDelete(sortedCitas[currentCitaIndex]?.id)}
                                >
                                    Eliminar
                                </button>
                                
                                <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                                    onClick={handleNextCita}
                                    disabled={currentCitaIndex === sortedCitas.length - 1}
                                >
                                    Siguiente
                                </button>
                            </div>
                        </div>
                        
                        <div className="text-center text-gray-600">
                            Cita {currentCitaIndex + 1} de {sortedCitas.length}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-600">No hay citas agendadas</p>
                )}
                
                <button
                    onClick={handleSignOut}
                    className="mt-4 bg-[#db1f32] hover:bg-red-700 text-white font-bold py-2 px-4 rounded self-center"
                >
                    Cerrar sesión
                </button>
            </div>
        </div>
    );
}

export default Medico;