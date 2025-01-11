import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Medico from './pages/Medico';
import Usuario from './pages/Usuario';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login/Login" element={<Login />} />
                <Route path="/Medico" element={<Medico />} />
                <Route path="/Usuario" element={<Usuario />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
