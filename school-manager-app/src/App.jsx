import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './pages/Login';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Admission from './pages/Admission';
import Fees from './pages/Fees';
import Receipts from './pages/Receipts';
import BillGenerator from './pages/BillGenerator';
import Bills from './pages/Bills';
import Inventory from './pages/Inventory';
import StockPurchases from './pages/StockPurchases';
import ProductSales from './pages/ProductSales';
import Suppliers from './pages/Suppliers';
import Staff from './pages/Staff';
import Attendance from './pages/Attendance';
import Expenses from './pages/Expenses';
import Rooms from './pages/Rooms';
import Electricity from './pages/Electricity';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import ActivityLogs from './pages/ActivityLogs';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        <Route element={user ? <DashboardLayout user={user} onLogout={handleLogout} /> : <Navigate to="/login" />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/admission" element={<Admission />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/staff" element={<Staff />} />
          
          <Route path="/fees" element={<Fees />} />
          <Route path="/receipts" element={<Receipts />} />
          <Route path="/bill-generator" element={<BillGenerator />} />
          <Route path="/bills" element={<Bills />} />
          
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/stock-purchases" element={<StockPurchases />} />
          <Route path="/product-sales" element={<ProductSales />} />
          <Route path="/suppliers" element={<Suppliers />} />
          
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/electricity" element={<Electricity />} />
          
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity-logs" element={<ActivityLogs />} />
          
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
