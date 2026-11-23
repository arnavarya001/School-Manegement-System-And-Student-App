import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Fees from './pages/Fees';
import Attendance from './pages/Attendance';
import Inventory from './pages/Inventory';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';
import PaymentStatus from './pages/PaymentStatus';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeStudent, setActiveStudent] = useState(JSON.parse(localStorage.getItem('activeStudent')));

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setUser(userData);

    // If parent, we'll need to fetch their students and set the first one as active
    // This will be handled in the Login or Dashboard component
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setActiveStudent(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        <Route element={user ? <AppLayout user={user} activeStudent={activeStudent} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard user={user} activeStudent={activeStudent} setActiveStudent={setActiveStudent} />} />
          <Route path="/fees" element={<Fees activeStudent={activeStudent} />} />
          <Route path="/attendance" element={<Attendance activeStudent={activeStudent} />} />
          <Route path="/inventory" element={<Inventory activeStudent={activeStudent} />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/profile" element={<Profile user={user} activeStudent={activeStudent} onLogout={handleLogout} />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
