import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "../components/Signup";
import Login from "../components/Login";
import Home from "../components/Home";
import Layout from "../components/Layout";
import Dashboard from "../components/Dashboard";
import ProposalsVoting from "../components/ProposalsVoting";
import Members from "../components/Members";
import Portfolio from "../components/Portfolio";
import News from "../components/News";
import HowItWorks from "../components/HowItWorks";
import FeaturedClubs from "../components/FeaturedClubs";
import ClubDashboard from "../components/ClubDashboard";
import Clubs from "../components/Clubs";
import ClubDetails from "../components/ClubDetails";
import About from "../components/About";
import SubscribeForm from "../components/SubscribeForm";


export default function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/how-it-works" element={<Layout><HowItWorks /></Layout>} />
        <Route path="/featured-clubs" element={<Layout><FeaturedClubs /></Layout>} />
        <Route path="/proposals" element={<Layout><ProposalsVoting /></Layout>} />
        <Route path="/members/:clubId" element={<Layout><Members /></Layout>} />
        <Route path="/portfolio" element={<Layout><Portfolio /></Layout>} />
        <Route path="/news" element={<Layout><News /></Layout>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/club/:clubId" element={<Layout><ClubDashboard /></Layout>} />
        <Route path="/club/:clubId/members" element={<Layout><Members /></Layout>} />
        <Route path="/club/:clubId/portfolio" element={<Layout><Portfolio /></Layout>} />
        <Route path="/club/:clubId/proposals" element={<Layout><ProposalsVoting /></Layout>} />
        <Route path="clubs/" element={<Layout><Clubs /></Layout>} />
        <Route path="clubs/:clubId" element={<Layout><ClubDetails /></Layout>} />
        <Route path="clubs/:clubId/Subscribe" element={<Layout><SubscribeForm /></Layout>} />
        <Route path="about" element={<Layout><About /></Layout>} />
      </Routes>
    </Router>
  );
}