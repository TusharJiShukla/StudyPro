import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StrictMode } from "react";

import { BrowserRouter } from "react-router-dom";

// Redux imports
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

// Root reducer
import rootReducer from "./reducer";

// Creating Redux Store
const store = configureStore({
  reducer: rootReducer,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    
    {/* Makes redux available everywhere */}
    <Provider store={store}>
      
      {/* Enables routing in entire app */}
      <BrowserRouter>
        <App />
      </BrowserRouter>

    </Provider>

  </StrictMode>
);