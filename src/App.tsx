import { Routes, Route, Link } from 'react-router';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateArea from './pages/PrivateArea';
import NewAnalysis from './pages/NewAnalysis';
import AnalysisResult from './pages/AnalysisResult';
import DashboardEntry from './pages/DashboardEntry';
import { RequireAuth } from './auth/RequireAuth';
import { Page, Panel } from './styles/authStyles';

export default function App() {
  return <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/app" element={<RequireAuth><PrivateArea /></RequireAuth>} />
    <Route path="/app/dashboard" element={<RequireAuth><DashboardEntry /></RequireAuth>} />
    <Route path="/app/new" element={<RequireAuth><NewAnalysis /></RequireAuth>} />
    <Route path="/app/analyses/:id" element={<RequireAuth><AnalysisResult /></RequireAuth>} />
    <Route path="*" element={<Page><Panel><h1>Página não encontrada</h1><Link to="/">Voltar ao início</Link></Panel></Page>} />
  </Routes>;
}
