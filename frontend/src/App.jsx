
//import React, { useState, useEffect } from "react";
import './App.css';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';
import NavigationBar from './components/NavigationBar';
import LandingPage from './components/LandingPage';
import Studio from './components/Studio';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import { UserProvider } from './components/UserContext'; // Import provider
import ProtectedRoute from './components/ProtectedRoute';
import { useUser } from './components/UserContext'; // Import User Context
import { Navigate } from 'react-router-dom';
import SignUpPage from './components/SignUpPage';
import BpmnProfile from './components/BpmnProfile';
import Studio2 from './components/BpmnError/Studio2';
import Studio3 from './components/practice/Studio3';
import ImageToBPMN from './components/ImageToBPMN';
import BpmnVersions from "./components/BpmnVersions.jsx";
import BpmnTemplate from './components/BpmnTemplate';
function App() {
  const { user } = useUser();
  return (

    <Router>
      <Routes>
        {/* Landing page route
          <Route path="/" element={<LandingPage />} /> */}

        {/* Redirect '/' to '/homepage' if the user is logged in */}

        {/* <Route path="/bpmn-error1" element={<BpmnErrorDetection />} />
          <Route path="/bpmn-error2" element={<BpmnEditor />} /> */}
        <Route
          path="/"
          element={

            user ? (
              <Navigate to="/homepage" replace /> // Redirect logged-in users
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/login"
          element={

            user ? (
              <Navigate to="/homepage" replace /> // Redirect logged-in users
            ) : (
              <LoginPage />
            )
          }
        />

        <Route
          path="/signup"
          element={

            user ? (
              <Navigate to="/homepage" replace /> // Redirect logged-in users
            ) : (
              <SignUpPage />
            )
          }
        />

        {/* Login page route
          <Route path="/login" element={<LoginPage />} /> */}

        {/* Signup page route
          <Route path="/signup" element={<SignupPage />} /> */}

        {/* Home page route */}
        <Route path="/homepage" element={
          <ProtectedRoute>
            <BpmnProfile />
          </ProtectedRoute>
        }
        />

        {/* Navbar route */}
        <Route
          path="/navigationBar"
          element={
            <ProtectedRoute>
              <NavigationBar />
            </ProtectedRoute>
          }
        />


        <Route
          path="/homepage/bpmn/:encryptedID"
          element={
            <ProtectedRoute>
              <Studio />
            </ProtectedRoute>
          }
        />

        <Route
          path="/image-to-bpmn"
          element={
            <ImageToBPMN />
          }
        />


        <Route
          path="/homepage/templates/"
          element={
            <ProtectedRoute>
              <BpmnTemplate />
            </ProtectedRoute>
          }
        />

        <Route
          path="/error/:encryptedID"
          element={
            <ProtectedRoute>
              <Studio2 />
            </ProtectedRoute>
          }
        />
            <Route
                path="/bpmn-versions/:encryptedID"
                element={
                    <BpmnVersions />
                }
            />

        <Route 
          path="/practice/:encryptedID" 
          element={
            <ProtectedRoute>
              <Studio3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bpmn"
          element={

            user ? (
              <ProtectedRoute>
                <BpmnProfile />
              </ProtectedRoute>
            ) : (
              <LandingPage />
            )
          }
        />
      </Routes>
    </Router>

  );
}


export default App;
