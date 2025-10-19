import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const DEMO_CASE_ID = "demo-preview";

const formCards = [
  {
    id: 'intake',
    title: 'Client Intake',
    route: `/admin/intake/${DEMO_CASE_ID}`,
  },
  {
    id: 'familyTree',
    title: 'Family Tree',
    route: `/admin/family-tree/${DEMO_CASE_ID}`,
  },
  {
    id: 'familyHistory',
    title: 'Family History',
    route: `/admin/family-history/${DEMO_CASE_ID}`,
  },
  {
    id: 'poa',
    title: 'Power of Attorney',
    route: `/admin/poa/${DEMO_CASE_ID}`,
  },
  {
    id: 'citizenship',
    title: 'Citizenship Application',
    route: `/admin/citizenship/${DEMO_CASE_ID}`,
  },
  {
    id: 'civilRegistry',
    title: 'Civil Registry',
    route: `/admin/civil-registry/${DEMO_CASE_ID}`,
  },
];


export default function FormsDemo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <div className="container mx-auto py-12 px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-heading font-black tracking-tight text-center whitespace-nowrap" style={{
                background: 'linear-gradient(135deg, hsl(221, 83%, 53%) 0%, hsl(204, 70%, 53%) 50%, hsl(221, 50%, 45%) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Polish Citizenship Forms
              </h1>
            </motion.div>
          </div>
        </motion.div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formCards.map((form, index) => (
            <motion.div
              key={form.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={cn(
                  "cursor-pointer group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/50",
                  "hover:scale-105 transform"
                )}
                onClick={() => navigate(form.route)}
              >
                <CardContent className="p-8 flex items-center justify-center">
                  <h3 className="text-2xl font-heading font-black tracking-tight" style={{
                    background: 'linear-gradient(135deg, hsl(221, 83%, 53%) 0%, hsl(204, 70%, 53%) 50%, hsl(221, 50%, 45%) 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {form.title}
                  </h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
