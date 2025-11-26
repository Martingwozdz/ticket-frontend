import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TicketForm from './components/TicketForm';
import OmakaseForm from './components/OmakaseForm';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TicketForm />} />
        <Route path="/omakase" element={<OmakaseForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;