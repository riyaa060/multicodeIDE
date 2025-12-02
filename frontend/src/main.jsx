import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import React from 'react'; // Import React to handle JSX
import ReactDOM from 'react-dom/client'; // If you're using React 18
import { ToastContainer } from "react-toastify";

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <ToastContainer /> {/* The ToastContainer goes here */}

  </StrictMode>,
)
