import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AddUsers from './pages/AddUsers';
import Blog from './pages/Blog';
import AddBill from './pages/AddBill';
import Customers from './pages/Customers';
import Login from './components/Login';
import Signup from './components/Signup';
import { auth } from './firebase';
import AddItems from './pages/AddItems';
import Menu from './pages/Menu';
import Bills from './pages/Bills';
import Payment from './pages/Payment';
import Home from './pages/Home';


function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up Firebase authentication listener
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route
            path="/*"
            element={
              user ? (
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/addusers" element={<AddUsers />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/bills" element={<Bills />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/additems" element={<AddItems />} />
                    <Route path="/addbill" element={<AddBill />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/home" element={<Home />}/>
                    <Route path="/*" element={<Navigate to="/" />} />
                  </Routes>
                </>
              ) : (
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/*" element={<Navigate to="/login" />} />
                </Routes>
              )
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
