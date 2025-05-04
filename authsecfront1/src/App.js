import React, {useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import Logout from './components/Logout';
import Home from './pages/Home';
import MainLayout from './layout/MainLayout';
import Favorites from './pages/Favorites'; 
import HomeCompany from './components/HomeCompany';
import CompanyProfile from './components/CompanyProfile';
import OffersManagement from './components/OffersManagement';
import StudentProfileCreate from "./pages/StudentProfileCreate";
import StudentProfileEdit from "./pages/StudentProfileEdit";
import StudentProfileView from "./pages/StudentProfileView";
import axios from 'axios';
import Chat from './components/messagerie/chat';
import SearchProfiles from './components/SearchProfiles';
import NvprofileStudent from './components/NvprofileStudent';
import NvprofileCompany from './components/NvprofileCompany';

import ChatPage from './components/ChatPage';
function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/change-password" element={<ChangePassword token={token} />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />
          <Route path="/homecompany" element={<HomeCompany />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/offers" element={<OffersManagement />} />
          <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/favorites" element={<MainLayout><Favorites /></MainLayout>} /> {/* Ajouter la route pour les favoris */}
        
          <Route path="/student" element={<Home token={token} />} />
        
          <Route path="/profile/create" element={<StudentProfileCreate />} />
        <Route path="/profile/edit/:id" element={<StudentProfileEdit />} />
        <Route path="/profile/view" element={<StudentProfileView />} />
        <Route path="/search" element={<SearchProfiles />} />
        <Route path="/profilestudent/:userId" element={<NvprofileStudent />} />
        <Route path="/profilecompany/:userId" element={<NvprofileCompany />} />
        <Route path="/ChatPage" element={<ChatPage/>} />
        
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
