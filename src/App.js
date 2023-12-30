// Import necessary libraries and components
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddUsers from './pages/AddUsers';
import Blog from './pages/Blog';
import AddMenu from './pages/AddItems';
import AddBill from './pages/AddBill';
import History from './pages/History';
import Customers from './pages/Customers';
import Login from './components/Login';
import Signup from './components/Signup';
import { auth } from './firebase';
import AddItems from './pages/AddItems';
import Menu from './pages/Menu';
import Bills from './pages/Bills';
import TodayBills from './pages/TodayBills';
import Payment from './pages/Payment';
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up Firebase authentication listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      <Router>
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {user ? (
            <>
              <Route path="/addusers" element={<AddUsers />} />
              <Route path="/payment" element={<Payment />} />

              <Route path="/bills" element={<Bills />} />
              <Route path="/todaybills" element={<TodayBills />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/additems" element={<AddItems />} />
              <Route path="/addbill" element={<AddBill />} />
              <Route path="/history" element={<History />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/customers" element={<Customers />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/home" />} />
          )}
        </Routes>
      </Router>
    </div>
  );
}

export default App;
