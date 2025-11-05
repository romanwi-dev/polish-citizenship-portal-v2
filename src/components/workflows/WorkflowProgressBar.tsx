import { motion } from "framer-motion";

interface WorkflowProgressBarProps {
  totalStages: number;
  completedCount: number;
  documentsCount: number;
}

export function WorkflowProgressBar({ totalStages, completedCount, documentsCount }: WorkflowProgressBarProps) {
  const progressPercent = Math.round((completedCount / totalStages) * 100);
  const remainingCount = totalStages - completedCount;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t shadow-2xl">
      {/* Animated Progress Bar Fill */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${progressPercent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent"
        style={{
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)'
        }}
      />
      
      <div className="max-w-[1800px] mx-auto px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 transition-all"
          >
            <div className="text-2xl md:text-3xl font-bold text-primary mb-0.5">{documentsCount}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Documents</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 transition-all"
          >
            <motion.div
              key={completedCount}
              initial={{ scale: 1.2, color: '#22c55e' }}
              animate={{ scale: 1, color: '#16a34a' }}
              transition={{ duration: 0.5 }}
              className="text-2xl md:text-3xl font-bold text-green-600 mb-0.5"
            >
              {completedCount}
            </motion.div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Completed</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 transition-all"
          >
            <div className="text-2xl md:text-3xl font-bold text-accent mb-0.5">
              {remainingCount}
            </div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Remaining</div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="text-center p-2 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20 transition-all"
          >
            <motion.div
              key={completedCount}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-2xl md:text-3xl font-bold text-secondary mb-0.5"
            >
              {progressPercent}%
            </motion.div>
            <div className="text-[10px] md:text-xs text-muted-foreground">Progress</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
