import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  CssBaseline,
} from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupFlowPage from './pages/SignupFlowPage';
import KanbanBoardPage from './pages/KanbanBoardPage';

function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupFlowPage />} />
          <Route
            path="/app"
            element={
              <KanbanBoardPage
                isDark={isDark}
                onToggleTheme={() => setIsDark((prev) => !prev)}
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;