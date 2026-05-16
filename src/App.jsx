import { HashRouter, Routes, Route } from "react-router-dom";

import {
  About,
  Contact,
  Hero,
  Navbar,
  StarsCanvas,
} from "./components";

import BlogList from "./blog/BlogList";
import BlogPost from "./blog/BlogPost";

const Home = () => (
  <div className="relative z-0 bg-primary">
    <div className="bg-hero-pattern bg-cover bg-no-repeat bg-center">
      <Navbar />
      <Hero />
    </div>
    <About />
    {/* <Experience />
    <Tech />
    <Works />
    <Feedbacks /> */}
    <div className="relative z-0">
      <Contact />
      <StarsCanvas />
    </div>
  </div>
);

const App = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
