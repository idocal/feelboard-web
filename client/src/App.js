import React from 'react';
import FlexView from 'react-flexview';
import 'semantic-ui-css/semantic.min.css';
import './App.css';
import AppRouter from "./Router";


function App() {
  return (
    <FlexView className="app">
        <AppRouter />
    </FlexView>
  );
}

export default App;
