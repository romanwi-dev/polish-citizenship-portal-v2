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

const WarsawDemo = () => {
  const images = [
    { src: warsaw1, title: "Night Cityscape", description: "Dramatic Warsaw skyline with illuminated landmarks" },
    { src: warsaw2, title: "Golden Hour", description: "Sunset view of modern Warsaw" },
    { src: warsaw3, title: "Old Town Square", description: "Historic colorful townhouses" },
    { src: warsaw4, title: "Aerial View", description: "Bird's eye perspective of the city" },
    { src: warsaw5, title: "Royal Castle", description: "Magnificent baroque architecture" },
    { src: warsaw6, title: "Winter Wonderland", description: "Festive Christmas atmosphere" },
    { src: warsaw7, title: "Modern Architecture", description: "Futuristic glass skyscrapers" },
    { src: warsaw8, title: "Vistula Boulevards", description: "Riverside promenade at sunset" },
    { src: warsaw9, title: "Cultural Scene", description: "Grand theater illuminated at night" },
    { src: warsaw10, title: "Lazienki Park", description: "Historic palace with blooming gardens" },
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
