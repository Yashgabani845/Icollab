import React from "react";
import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import Footer from "./Footer";
import Pricing from "../Auth/Pricing";
import HowItWorksTimeline from "./HowItWorksTimeline";
const HomePage = () => {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksTimeline/>
      <Footer />
    </div>
  );
};

export default HomePage;
