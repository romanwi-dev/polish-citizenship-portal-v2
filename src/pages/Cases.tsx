import { useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, FileText, CheckCircle2, MapPin, TrendingUp } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";

interface ClientCase {
  id: number;
  name: string;
  country: string;
  status: "active" | "completed" | "pending";
  startDate: string;
  documents: number;
  progress: number;
  ancestry: string;
}

const mockCases: ClientCase[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    country: "USA",
    status: "active",
    startDate: "2024-01-15",
    documents: 12,
    progress: 75,
    ancestry: "Grandmother from Warsaw"
  },
  {
    id: 2,
    name: "Michael Cohen",
    country: "Israel",
    status: "completed",
    startDate: "2023-08-20",
    documents: 18,
    progress: 100,
    ancestry: "Great-grandfather from Krakow"
  },
  {
    id: 3,
    name: "Emma Williams",
    country: "UK",
    status: "active",
    startDate: "2024-03-10",
    documents: 8,
    progress: 45,
    ancestry: "Grandfather from Gdańsk"
  },
  {
    id: 4,
    name: "David Kowalski",
    country: "Canada",
    status: "pending",
    startDate: "2024-06-01",
    documents: 5,
    progress: 20,
    ancestry: "Mother from Poznań"
  },
  {
    id: 5,
    name: "Anna Schmidt",
    country: "Germany",
    status: "active",
    startDate: "2024-02-28",
    documents: 15,
    progress: 60,
    ancestry: "Father from Wrocław"
  },
  {
    id: 6,
    name: "James O'Brien",
    country: "Ireland",
    status: "completed",
    startDate: "2023-11-05",
    documents: 20,
    progress: 100,
    ancestry: "Great-grandmother from Lublin"
  },
  {
    id: 7,
    name: "Maria Rodriguez",
    country: "Spain",
    status: "active",
    startDate: "2024-04-12",
    documents: 10,
    progress: 55,
    ancestry: "Grandfather from Szczecin"
  },
  {
    id: 8,
    name: "John Smith",
    country: "Australia",
    status: "pending",
    startDate: "2024-07-08",
    documents: 6,
    progress: 30,
    ancestry: "Great-grandfather from Łódź"
  },
  {
    id: 9,
    name: "Sophie Dubois",
    country: "France",
    status: "active",
    startDate: "2024-02-20",
    documents: 14,
    progress: 70,
    ancestry: "Grandmother from Białystok"
  },
  {
    id: 10,
    name: "Lars Anderson",
    country: "Sweden",
    status: "completed",
    startDate: "2023-09-15",
    documents: 22,
    progress: 100,
    ancestry: "Mother from Katowice"
  },
  {
    id: 11,
    name: "Chen Wei",
    country: "Singapore",
    status: "active",
    startDate: "2024-05-03",
    documents: 9,
    progress: 40,
    ancestry: "Great-grandmother from Toruń"
  },
  {
    id: 12,
    name: "Isabella Costa",
    country: "Brazil",
    status: "pending",
    startDate: "2024-08-01",
    documents: 7,
    progress: 25,
    ancestry: "Grandfather from Opole"
  }
];

const Cases = () => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "active":
        return "bg-primary/20 text-primary border-primary/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-muted/20 text-muted-foreground border-muted/30";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Background Layer - Fixed Position */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[150px] animate-pulse delay-700" />
      </div>
      
      {/* Content */}
      <section className="pt-24 md:pt-32 pb-20 relative">
        <div className="container px-4 mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-block px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Client Portfolio
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Cases Management
              </span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Track and manage all client citizenship applications in one place
            </p>
          </motion.div>

          {/* Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {mockCases.map((clientCase, index) => (
              <motion.div
                key={clientCase.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.3 }}
                  className="glass-card p-6 rounded-lg h-full hover-glow group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {clientCase.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {clientCase.country}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(clientCase.status)} capitalize flex-shrink-0`}>
                      {clientCase.status}
                    </span>
                  </div>

                  {/* Ancestry */}
                  <div className="mb-4 p-3 rounded-lg bg-background/50 backdrop-blur-sm">
                    <p className="text-xs text-muted-foreground mb-1">Polish Ancestry</p>
                    <p className="text-sm font-medium">{clientCase.ancestry}</p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                      <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Started</p>
                        <p className="text-sm font-medium">{new Date(clientCase.startDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-background/30">
                      <FileText className="w-4 h-4 text-secondary flex-shrink-0" />
                      <div>
                        <p className="text-xs text-muted-foreground">Documents</p>
                        <p className="text-sm font-medium">{clientCase.documents}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Progress</span>
                      </div>
                      <span className="font-bold">{clientCase.progress}%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
                        style={{ width: `${clientCase.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Completion Badge */}
                  {clientCase.status === "completed" && (
                    <div className="mt-4 flex items-center justify-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/30">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">Citizenship Granted</span>
                    </div>
                  )}
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Cases;
