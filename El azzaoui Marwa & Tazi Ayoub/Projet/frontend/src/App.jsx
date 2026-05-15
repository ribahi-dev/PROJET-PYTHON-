import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Coaches from "./pages/Coaches";
import Programs from "./pages/Programs";
import ProgramDetail from "./pages/ProgramDetail";
import Dashboard from "./pages/Dashboard";
import CoachDashboard from "./pages/CoachDashboard";
import Articles from "./pages/Articles";
import Coach from "./pages/Coach";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Progress from "./pages/Progress";
import Messages from "./pages/Messages";
import Appointments from "./pages/Appointments";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import CoachRoute from "./components/CoachRoute";





function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/coaches" element={<Coaches />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/programmes" element={<Programs />} />
          <Route path="/program/:id" element={<ProgramDetail />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/coach-dashboard" element={<CoachRoute><CoachDashboard /></CoachRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><Progress /></PrivateRoute>} />
          <Route path="/coach/:id" element={<Coach />} />
          <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

const styles = {
  main: {
    minHeight: "80vh",
    padding: 0,
  },
};

export default App;
