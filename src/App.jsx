import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Hospitals from './pages/Hospitals';
import VolunteerLogin from './pages/VolunteerLogin';
import VolunteerDashboard from './pages/VolunteerDashboard';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="hospitals" element={<Hospitals />} />
        <Route path="volunteer/login" element={<VolunteerLogin />} />
        <Route path="volunteer/dashboard" element={<VolunteerDashboard />} />
      </Route>
    </Routes>
  );
}
