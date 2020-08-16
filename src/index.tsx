import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from './components/App';
import { ThemeProvider, createMuiTheme } from '@material-ui/core';

const MuiTheme = createMuiTheme({
  typography: {
    fontFamily: 'Patrick Hand, cursive',
  },
});
ReactDOM.render(
  <ThemeProvider theme={MuiTheme}>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </ThemeProvider>,
  document.getElementById('app')
);
