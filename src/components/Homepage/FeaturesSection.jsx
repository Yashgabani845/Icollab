import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "../../CSS/Homepage/features.css";
import logo from "../../Images/logo.jpg";
import channel from "../../Images/channel.jpg";
import github from "../../Images/github.jpg";
import security from "../../Images/security.jpg";
import chats from "../../Images/chats.jpg";
import custom from "../../Images/custom.jpg";
import analytica from "../../Images/analy.jpg"
const FeaturesSection = () => {
  const features = [
    { title: "Channels", description: "Organize conversations by topics, projects, or teams.", logo:channel },
    { title: "Messaging", description: "Real-time messaging for instant collaboration and communication.",logo:chats },
    { title: "Integrations", description: "Connect your favorite tools like GitHub and Google Drive." ,logo:github},
    { title: "Analytics", description: "Gain insights with advanced analytics and reporting tools." ,logo:analytica},
    { title: "Security", description: "Keep your data safe with end-to-end encryption.",logo:security}, 
    { title: "Customization", description: "Personalize your workspace and channels to fit your needs.",logo:custom}, 
  ];

  return (
    <section className="features" id="features">
      <div className="container">
        <h2>Features</h2>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30} // Space between slides
          slidesPerView={3} // Display 3 cards at a time
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000 }}
          loop
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 10 },
            768: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
        >
          {features.map((feature, index) => (
            <SwiperSlide key={index}>
              <div className="feature-card">
                <img src={feature.logo} alt={feature.title} />
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturesSection;
