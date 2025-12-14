import { motion } from 'framer-motion';
import './Contact.css';

interface ContactProps {
  email?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

const Contact = ({
  email = "yassine.karoui@example.com",
  linkedin = "https://linkedin.com/in/yassine-karoui",
  github = "https://github.com/y-essine",
  twitter = "https://twitter.com/yassinekaroui"
}: ContactProps) => {
  return (
    <section className="contact" id="contact">
      <div className="contact__container">
        <div className="contact__left">
          <motion.h2 
            className="contact__title"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          >
            Contact
          </motion.h2>
        </div>

        <div className="contact__right">
          <motion.p 
            className="contact__description"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as any }}
          >
            Intéressé par une collaboration ? N'hésitez pas à me contacter.
          </motion.p>

          <div className="contact__links">
            <motion.a 
              href={`mailto:${email}`} 
              className="contact__link"
              initial={{ opacity: 0.001, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] as any }}
            >
              <span className="contact__link-label">Email</span>
              <span className="contact__link-value">{email}</span>
            </motion.a>

            <motion.a 
              href={linkedin} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact__link"
              initial={{ opacity: 0.001, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as any }}
            >
              <span className="contact__link-label">LinkedIn</span>
              <span className="contact__link-value">Profil →</span>
            </motion.a>

            <motion.a 
              href={github} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact__link"
              initial={{ opacity: 0.001, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] as any }}
            >
              <span className="contact__link-label">GitHub</span>
              <span className="contact__link-value">Projets →</span>
            </motion.a>

            <motion.a 
              href={twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="contact__link"
              initial={{ opacity: 0.001, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
            >
              <span className="contact__link-label">Twitter</span>
              <span className="contact__link-value">@yassinekaroui →</span>
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
