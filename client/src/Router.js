import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Homepage from './components/Homepage';
import Demo from './components/Demo';

function AppRouter() {
    return (
        <Router>
            <Route path="/" exact component={Homepage} />
            <Route path="/demo" component={Demo} />
        </Router>
    )
}

export default AppRouter
