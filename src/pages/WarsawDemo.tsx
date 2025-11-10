import { motion } from "framer-motion";
import warsaw1 from "@/assets/warsaw-demos/warsaw-1.png";
import warsaw2 from "@/assets/warsaw-demos/warsaw-2.png";
import warsaw3 from "@/assets/warsaw-demos/warsaw-3.png";
import warsaw4 from "@/assets/warsaw-demos/warsaw-4.png";
import warsaw5 from "@/assets/warsaw-demos/warsaw-5.png";
import warsaw6 from "@/assets/warsaw-demos/warsaw-6.png";
import warsaw7 from "@/assets/warsaw-demos/warsaw-7.png";
import warsaw8 from "@/assets/warsaw-demos/warsaw-8.png";
import warsaw9 from "@/assets/warsaw-demos/warsaw-9.png";
import warsaw10 from "@/assets/warsaw-demos/warsaw-10.png";
import warsaw11 from "@/assets/warsaw-demos/warsaw-11.png";
import warsaw12 from "@/assets/warsaw-demos/warsaw-12.png";
import warsaw13 from "@/assets/warsaw-demos/warsaw-13.png";
import warsaw14 from "@/assets/warsaw-demos/warsaw-14.png";
import warsaw15 from "@/assets/warsaw-demos/warsaw-15.png";

const WarsawDemo = () => {
  const images = [
    { src: warsaw1, title: "Futuristic Palace", description: "Palace of Culture with holographic displays and flying vehicles" },
    { src: warsaw2, title: "Sustainable Skyline", description: "Green towers with solar panels at golden hour" },
    { src: warsaw3, title: "Old Town Future", description: "Historic buildings with holographic facades" },
    { src: warsaw4, title: "Geodesic Domes", description: "Massive domes and vertical farms aerial view" },
    { src: warsaw5, title: "Royal Castle Tech", description: "Historic castle with energy shields and LED lighting" },
    { src: warsaw6, title: "Winter Smart City", description: "Snow-covered city with heated streets and aurora lights" },
    { src: warsaw7, title: "Crystalline Towers", description: "Bioluminescent skyscrapers with levitating pods" },
    { src: warsaw8, title: "Vistula Future", description: "Transparent walkways and holographic art installations" },
    { src: warsaw9, title: "Cultural Hub", description: "Theater with interactive light displays" },
    { src: warsaw10, title: "Smart Gardens", description: "Palace with smart glass and bioluminescent flowers" },
    { src: warsaw11, title: "Holographic Eagle", description: "Purple and blue neon with Polish eagle projection" },
    { src: warsaw12, title: "Metro System", description: "Underground station with bioluminescent walls" },
    { src: warsaw13, title: "Shopping District", description: "Holographic storefronts with transparent floors" },
    { src: warsaw14, title: "Sports Stadium", description: "Dome with smart glass and holographic scoreboard" },
    { src: warsaw15, title: "Eco Towers", description: "Vertical gardens and sustainable living pods" },
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
            Warsaw Gallery
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore the beauty of Warsaw through these stunning images showcasing the city's rich history, modern architecture, and vibrant culture.
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

export default WarsawDemo;
