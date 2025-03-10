// HowItWorksTimeline.jsx
import React from 'react';
import './how.css';
import { UserPlus, Briefcase, UsersRound, MessageSquareShare, ChevronRight } from 'lucide-react';
import signup from "./dignup.png"
import wspaced from "./wspace.png"
import collab from "./collab.jpg"


const HowItWorksTimeline = () => {
  const steps = [
    {
      number: "1️⃣",
      title: "Sign Up",
      description: "Getting started is quick and easy. Create your account in seconds with just your email and password. No credit card required for our free tier, allowing you to explore our platform's features before committing. Our streamlined onboarding process ensures you'll be up and running in no time.",
      icon: <UserPlus size={36} />,
      emoji: "📝",
      imagePath: signup, // Replace with your actual image path
      backgroundColor: "#f8f9fa",
      accentColor: "#212529"
    },
    {
      number: "2️⃣",
      title: "Create a Workspace",
      description: "Design your team's digital home base. Customize your workspace with your brand colors and logo. Organize projects with intuitive folder structures, set important milestones, and choose from various templates to kickstart your workflow. Your workspace adapts to your team's unique needs.",
      icon: <Briefcase size={36} />,
      emoji: "🏢",
      imagePath: wspaced, // Replace with your actual image path
      backgroundColor: "#212529",
      accentColor: "#f8f9fa"
    },
   
    {
      number: "3️⃣",
      title: "Start Collaborating",
      description: "Experience seamless collaboration like never before. Communicate through integrated chat, video calls, and comments. Share files with powerful version control. Track progress with visual dashboards and reports. Real-time updates ensure everyone stays on the same page, no matter where they're working from.",
      icon: <MessageSquareShare size={36} />,
      emoji: "🚀",
      imagePath: collab, // Replace with your actual image path
      backgroundColor: "#212529",
      accentColor: "#f8f9fa"
    }
  ];

  return (
    <div className="how-it-works-container">
      <div className="section-header">
        <div className="header-shape"></div>
        <h2>How It Works</h2>
        <div className="header-shape"></div>
      </div>
      
      <div className="timeline-wrapper">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className="timeline-step" // Removed conditional odd/even class
            style={{ 
              '--accent-color': step.accentColor,
              '--bg-color': step.backgroundColor 
            }}
          >
            <div className="step-connector">
              <div className="connector-circle">
                <span>{index + 1}</span>
              </div>
              {index < steps.length - 1 && (
                <div className="connector-line"></div>
              )}
            </div>
            
            <div className="step-card">
              <div className="step-header">
                <div className="step-emoji">{step.emoji}</div>
                <div className="step-number">{step.number}</div>
                <h3 className="step-title">{step.title}</h3>
              </div>
              
              <div className="step-content">
                <div className="step-image-container">
                  <div className="shape-decorator top-left"></div>
                  <div className="shape-decorator top-right"></div>
                  <img 
                    src={step.imagePath} 
                    alt={`Step ${index + 1}: ${step.title}`} 
                    className="step-image"
                  />
                  <div className="shape-decorator bottom-left"></div>
                  <div className="shape-decorator bottom-right"></div>
                </div>
                
                <div className="step-info">
                  <div className="step-icon-container">
                    {step.icon}
                  </div>
                  <p className="step-description">{step.description}</p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="step-next">
                  <ChevronRight size={24} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="cta-section">
        <div className="cta-blob"></div>
        <button className="cta-button">Get Started Today</button>
        <div className="cta-blob"></div>
      </div>
    </div>
  );
};

export default HowItWorksTimeline;