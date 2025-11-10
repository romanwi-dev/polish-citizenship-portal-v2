import { motion } from "framer-motion";
import euFlag from "@/assets/flags/eu-flag.png";

const EuropeanFlags = () => {
  const flagCountries = [
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "HU", name: "Hungary" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "AT", name: "Austria" },
    { code: "IT", name: "Italy" },
    { code: "BE", name: "Belgium" },
  ];

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            European Union Citizenship
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Polish citizenship grants you full access to live, work, and study across all 27 EU member states
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8">
          {flagCountries.map((country, index) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative group"
            >
              <div className="w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <motion.img
                  src={`https://flagcdn.com/w320/${country.code.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  className="w-full h-full object-cover"
                  animate={{
                    rotateY: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.2,
                    ease: "easeInOut",
                  }}
                />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                <span className="text-xs text-muted-foreground">{country.name}</span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 flex justify-center"
        >
          <div className="glass-card p-8 rounded-xl max-w-md">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="https://flagcdn.com/w320/eu.png" 
                alt="European Union flag" 
                className="w-32 h-24 object-cover rounded-lg shadow-lg"
              />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Freedom of movement across the European Union
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(10deg);
          }
        }
      `}</style>
    </section>
  );
};

export default EuropeanFlags;
