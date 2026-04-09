import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ToastProvider from './contexts/ToastContext';
import Navbar from './components/Navbar';
import SessionManager from './components/SessionManager';
import Home from './pages/Home';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SessionManager />
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route
                path="/create-event"
                element={
                  <PrivateRoute allowedRoles={['organizer', 'admin']}>
                    <CreateEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/edit-event/:id"
                element={
                  <PrivateRoute allowedRoles={['organizer', 'admin']}>
                    <EditEvent />
                  </PrivateRoute>
                }
              />
              <Route
                path="/favorites"
                element={
                  <PrivateRoute>
                    <Favorites />
                  </PrivateRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <PrivateRoute allowedRoles={['admin']}>
                    <AdminPanel />
                  </PrivateRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;