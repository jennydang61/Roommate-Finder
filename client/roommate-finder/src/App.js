import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './landing/landingPage';
import CreateAccount from './register/createAccount';
import SignIn from './signin/signIn';
import Home from './home/Home';
import HeaderLayout from './header/headerLayout';
import Requests from './requests/Requests';
import Messages from './messages/Messages';
import Account from './account/Account';
import Admin from './admin/admin';
import CreateProfile from './register/createProfile';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/createAccount" element={<CreateAccount />} />
                <Route path="/createProfile" element={<CreateProfile />} />
                <Route path="/signIn" element={<SignIn />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/Home" element={<HeaderLayout><Home /></HeaderLayout>} />
                <Route path="/Requests" element={<HeaderLayout><Requests /></HeaderLayout>} />
                <Route path="/Messages" element={<HeaderLayout><Messages /></HeaderLayout>} />
                <Route path="/Account" element={<HeaderLayout><Account /></HeaderLayout>} />
            </Routes>
        </Router>
    );
}

export default App;
