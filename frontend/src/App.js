import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Face from './Face';
import Audio from './Audio';
import SignUp from './SignUp';
import FaceSignUp from './FaceSignUp';
import AudioSignUp from './AudioSignUp';
import ThreatDetection from './ThreatDetection';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login/>} />
        <Route path="/face" element={<Face/>}/>
        <Route path="/audio" element={<Audio/>}/>
        <Route path="/signup" element={<SignUp/>}/>
        <Route path="/face_signup" element={<FaceSignUp/>}/>
        <Route path="/audio_signup" element={<AudioSignUp/>}/>
        <Route path="/threat_detection" element={<ThreatDetection/>}/>
      </Routes>
    </Router>
  );
}

export default App;