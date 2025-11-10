import { motion } from "framer-motion";

const EuropeanFlags = () => {
  const flagCountries = [
    { code: "PL", name: "Poland", color: "#DC143C" },
    { code: "CZ", name: "Czech Republic", color: "#11457E" },
    { code: "HU", name: "Hungary", color: "#436F4D" },
    { code: "DE", name: "Germany", color: "#000000" },
    { code: "FR", name: "France", color: "#002395" },
    { code: "AT", name: "Austria", color: "#ED2939" },
    { code: "IT", name: "Italy", color: "#009246" },
    { code: "BE", name: "Belgium", color: "#FDDA24" },
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {flagCountries.map((country, index) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-card p-6 rounded-xl hover:scale-105 transition-transform duration-300 group"
            >
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: country.color }}
                >
                  {country.code}
                </div>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {country.name}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <div className="glass-card p-8 rounded-xl max-w-md text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-yellow-400 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                <div className="text-yellow-400 text-4xl">⭐</div>
              </div>
            </div>
            <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Freedom of Movement
            </h3>
            <p className="text-sm text-muted-foreground">
              Live, work, and study anywhere across the European Union
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EuropeanFlags;
