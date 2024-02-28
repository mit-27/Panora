import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import "@panora/embedded-card-react/dist/index.css";

import PanoraProviderCard from "@panora/embedded-card-react";


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>

        <PanoraProviderCard 
    name={"hubspot"} // name of the provider  
    projectId={"c9a1b1f8-466d-442d-a95e-11cdd00baf49"} // the project id tied to your organization
    returnUrl={"https://acme.inc"} // the url you want to redirect users to after the connection flow is successful
    linkedUserId={"b860d6c1-28f9-485c-86cd-fb09e60f10a2"}  // the linked id of the user if already created in Panora system or user's info in your system
    />
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
