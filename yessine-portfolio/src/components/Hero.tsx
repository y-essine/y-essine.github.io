import { motion } from 'framer-motion';
import './Hero.css';

interface HeroProps {
  name?: string;
  title?: string;
  role?: string;
  experience?: string;
  status?: string;
  bio?: string;
  headshotUrl?: string;
}

const Hero = ({
  name = "Yassine Karoui",
  title = "Product Engineer",
  role = "Développeur Fullstack",
  experience = "3+ Ans d'éxperience",
  status = "Ouvert Au Travail",
  bio = "Quand je ne suis pas en train de coder, vous me trouverez en train de composer des beats, de jouer à des jeux vidéo ou de partager un bon repas avec des amis.",
  headshotUrl = "https://framerusercontent.com/images/7vt6ucUZmrRbF63sin0tbmqGwU.jpeg"
}: HeroProps) => {
  const fadeInUp = {
    initial: { opacity: 0.001, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }
  };

  const gridVertical = {
    initial: { opacity: 0.001, y: -150 },
    animate: { opacity: 0.1, y: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  };

  const gridHorizontal = {
    initial: { opacity: 0.001, x: -150 },
    animate: { opacity: 0.1, x: 0 },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as any }
  };

  const headshotAnimation = {
    initial: { opacity: 0.001, y: 20, rotate: -5 },
    animate: { opacity: 1, y: 0, rotate: -5 },
    transition: { duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as any }
  };

  const bioAnimation = {
    initial: { opacity: 0.001, x: 24 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as any }
  };

  return (
    <section className="hero" id="hero" aria-label="Hero">
      <div className="hero__container">
        <div className="hero__left">
          <motion.h1 
            className="hero__name"
            {...fadeInUp}
          >
            {name.split(' ').map((part, i) => (
              <span key={i}>
                {part}
                {i < name.split(' ').length - 1 && <br />}
              </span>
            ))}
          </motion.h1>
        </div>

        <div className="hero__right">
          <div className="hero__headshot-wrapper">
            <div className="hero__grid-bg">
              <motion.div 
                className="hero__grid-vertical"
                {...gridVertical}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="hero__grid-line" />
                ))}
              </motion.div>
              <motion.div 
                className="hero__grid-horizontal"
                {...gridHorizontal}
              >
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="hero__grid-line" />
                ))}
              </motion.div>
            </div>
            <motion.figure 
              className="hero__headshot"
              {...headshotAnimation}
            >
              <img src={headshotUrl} alt="Headshot" />
            </motion.figure>
          </div>

          <div className="hero__note">
            <motion.h3 
              className="hero__note-title"
              initial={{ opacity: 0.001, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as any }}
            >
              À propos
            </motion.h3>
            <ul className="hero__note-list">
              <li className="hero__note-item hero__note-item--primary">{title}</li>
              <li className="hero__note-item">{role}</li>
              <li className="hero__note-item">{experience}</li>
              <li className="hero__note-item">{status}</li>
            </ul>
          </div>

          <motion.p 
            className="hero__bio"
            {...bioAnimation}
          >
            {bio}
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
