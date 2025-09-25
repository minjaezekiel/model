import React from "react";
import Home from "./pages/Home";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>TZ INFORM Model Viewer</h1>
        <p>Tanzania District Data Visualization Platform</p>
      </header>
      <Home />
    </div>
  );
}

export default App;