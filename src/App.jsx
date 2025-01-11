import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login/Login';
import Medico from './pages/Medico';
import Usuario from './pages/Usuario';
import NewUser from './pages/NewUser';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login/Login" element={<Login />} />
                <Route path="/Medico" element={<Medico />} />
                <Route path="/Usuario" element={<Usuario />} />
                <Route path="/NewUser" element={<NewUser />} />
                <Route path="/" element={<Login />} />
            </Routes>
        </Router>
    );
}

export default App;
