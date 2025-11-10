import { motion } from "framer-motion";
import celebration1 from "@/assets/eu-celebration/celebration-1.png";
import celebration2 from "@/assets/eu-celebration/celebration-2.png";
import celebration3 from "@/assets/eu-celebration/celebration-3.png";
import celebration4 from "@/assets/eu-celebration/celebration-4.png";
import celebration5 from "@/assets/eu-celebration/celebration-5.png";
import celebration6 from "@/assets/eu-celebration/celebration-6.png";
import celebration7 from "@/assets/eu-celebration/celebration-7.png";
import celebration8 from "@/assets/eu-celebration/celebration-8.png";
import celebration9 from "@/assets/eu-celebration/celebration-9.png";
import celebration10 from "@/assets/eu-celebration/celebration-10.png";
import celebration11 from "@/assets/eu-celebration/celebration-11.png";
import celebration12 from "@/assets/eu-celebration/celebration-12.png";
import celebration13 from "@/assets/eu-celebration/celebration-13.png";
import celebration14 from "@/assets/eu-celebration/celebration-14.png";
import celebration15 from "@/assets/eu-celebration/celebration-15.png";

const EUCelebrationDemo = () => {
  const images = [
    { src: celebration1, title: "Unity Celebration", description: "Massive crowd celebrating with EU flags and fireworks" },
    { src: celebration2, title: "Parliament Night", description: "European parliament building lit with celebration lights" },
    { src: celebration3, title: "Street Festival", description: "People from different nations celebrating together" },
    { src: celebration4, title: "Landmark Unity", description: "European landmarks illuminated with EU colors" },
    { src: celebration5, title: "Concert Festival", description: "Music festival celebrating European culture" },
    { src: celebration6, title: "Sunset Gathering", description: "City square celebration at golden hour" },
    { src: celebration7, title: "Children's Unity", description: "Children from different countries celebrating together" },
    { src: celebration8, title: "Palace Fireworks", description: "Grand palace illuminated with EU colors and fireworks" },
    { src: celebration9, title: "Cultural Festival", description: "Traditional costumes and folk dancing celebration" },
    { src: celebration10, title: "Riverfront Night", description: "Illuminated bridges and fireworks celebration" },
    { src: celebration11, title: "Unity Day", description: "People forming EU star circle, aerial view" },
    { src: celebration12, title: "Heritage Night", description: "Historic monuments illuminated with EU colors" },
    { src: celebration13, title: "Youth Festival", description: "Young people celebrating with colorful smoke" },
    { src: celebration14, title: "Sports Unity", description: "Olympic-style event with EU nations athletes" },
    { src: celebration15, title: "Food Festival", description: "Outdoor market with cuisine from all EU countries" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            European Celebration Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the spirit of unity and celebration across Europe through these stunning images showcasing cultural festivals, historic moments, and joyful gatherings.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {images.map((image, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <img
                src={image.src}
                alt={image.title}
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-white text-2xl font-bold mb-2">{image.title}</h3>
                  <p className="text-white/90 text-sm">{image.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EUCelebrationDemo;
