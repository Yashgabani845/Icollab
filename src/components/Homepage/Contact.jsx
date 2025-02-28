import React from "react";
import "../../CSS/Homepage/contact.css";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  return (
    <div className="contact-page">
      {/* Hero Section */}
      <div className="hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Feel free to reach out to us.</p>
      </div>

      {/* Contact Form Section */}
      <div className="contact-container">
        <div className="contact-form">
          <h2>Get in Touch</h2>
          <p>Fill out the form below and we'll get back to you as soon as possible.</p>
          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="5" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            {/* Footer Branding */}
            <div className="footer-brand">
              <h2>Icollab</h2>
              <p>Your one-stop collaboration platform for teams and organizations.</p>
            </div>

            {/* Quick Links */}
            <div className="footer-links">
              <h3>Quick Links</h3>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="footer-contact">
              <h3>Contact Us</h3>
              <p><FaMapMarkerAlt /> 123 Collaboration St, Suite 100, New York, NY</p>
              <p><FaPhone /> +1 800 123 4567</p>
              <p><FaEnvelope /> support@icollab.com</p>
            </div>

            {/* Newsletter Subscription */}
            <div className="footer-newsletter">
              <h3>Newsletter</h3>
              <p>Subscribe to our newsletter to stay updated.</p>
              <form>
                <input type="email" placeholder="Enter your email" />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            {/* Social Media Links */}
            <div className="footer-social">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                  <FaFacebook size={30} />
                </a>
                <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                  <FaTwitter size={30} />
                </a>
                <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                  <FaLinkedin size={30} />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                  <FaInstagram size={30} />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="footer-bottom">
            <p>&copy; 2024 Icollab. All rights reserved. | Terms & Conditions | Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
