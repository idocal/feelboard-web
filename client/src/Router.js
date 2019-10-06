import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Homepage from './components/Homepage';
import Demo from './components/Demo';
import CameraError from "./components/CameraError";

function AppRouter() {
    return (
        <Router>
            <Route path="/" exact component={Homepage} />
            <Route path="/demo" component={Demo} />
            <Route path="/no-camera-access" component={CameraError} />
        </Router>
    )
}

export default AppRouter
