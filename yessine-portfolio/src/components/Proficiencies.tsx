import { motion } from 'framer-motion';
import './Proficiencies.css';

interface ProficienciesProps {
  skills?: string[];
  tools?: string[];
  techStack?: string[];
  languages?: string[];
}

const Proficiencies = ({
  skills = [
    "Conception Produit",
    "Architecture Frontend",
    "Logique Backend",
    "Design UI/UX"
  ],
  tools = [
    "VS Code",
    "Git",
    "Figma",
    "Notion",
    "Stripe API"
  ],
  techStack = [
    "React",
    "Next.js",
    "Vue",
    "Express",
    "JavaScript / TypeScript",
    "Python",
    "SQL"
  ],
  languages = [
    "Français",
    "Anglais"
  ]
}: ProficienciesProps) => {
  return (
    <section className="proficiencies" id="proficiencies">
      <div className="proficiencies__container">
        <div className="proficiencies__left">
          <motion.h2 
            className="proficiencies__title"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as any }}
          >
            Compétences
          </motion.h2>
        </div>

        <div className="proficiencies__right">
          <motion.div 
            className="proficiencies__item"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] as any }}
          >
            <h3 className="proficiencies__item-title">Skills</h3>
            <ul className="proficiencies__list">
              {skills.map((skill, i) => (
                <li key={i} className="proficiencies__list-item">{skill}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="proficiencies__item"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] as any }}
          >
            <h3 className="proficiencies__item-title">Outils</h3>
            <ul className="proficiencies__list">
              {tools.map((tool, i) => (
                <li key={i} className="proficiencies__list-item">{tool}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="proficiencies__item"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
          >
            <h3 className="proficiencies__item-title">Tech Stack</h3>
            <ul className="proficiencies__list">
              {techStack.map((tech, i) => (
                <li key={i} className="proficiencies__list-item">{tech}</li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            className="proficiencies__item"
            initial={{ opacity: 0.001, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] as any }}
          >
            <h3 className="proficiencies__item-title">Langues</h3>
            <ul className="proficiencies__list">
              {languages.map((language, i) => (
                <li key={i} className="proficiencies__list-item">{language}</li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Proficiencies;
