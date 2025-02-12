import React from 'react';
import Home from './components/Home.jsx'
import SidePanel from './components/SidePanel.jsx';
import CertificateList from './components/CertificateList.jsx';
import LandingPage from './components/LandingPage.jsx';
import './App.css';

function App() {
  return (
    <div className="App" >
      <div className="content-div"  >
      {/* <TextForm/> */}
       {/* <Home/>  */}
        <LandingPage/>
      </div>
      
     
    </div>
  );
}
export default App;
