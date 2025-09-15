import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import './styles/font.css';
import './styles/custom.css';
import './index.css';
import App from './App.jsx';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3275FC',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: 'SUIT, Avenir, Helvetica, Arial, sans-serif',
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
