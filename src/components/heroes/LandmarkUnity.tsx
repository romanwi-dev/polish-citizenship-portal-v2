export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-gradient-to-b from-background to-secondary/20">
      <div className="absolute inset-0 opacity-20">
        {/* Animated geometric grid */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-24 h-24 border border-primary/40 rotate-45 animate-[spin_30s_linear_infinite]" />
          <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-accent/30 -rotate-12 animate-[spin_25s_linear_infinite_reverse]" />
          <div className="absolute bottom-1/3 left-1/2 w-28 h-28 rounded-full border border-primary/35 animate-pulse" />
          <div className="absolute top-1/2 left-1/3 w-36 h-36 border border-accent/25 rotate-12 animate-[spin_35s_linear_infinite]" />
          <div className="absolute bottom-1/4 right-1/3 w-20 h-20 border border-primary/45 -rotate-45 animate-[spin_20s_linear_infinite_reverse]" />
          <div className="absolute top-2/3 right-1/2 w-32 h-32 border border-accent/20 rotate-30 animate-[spin_28s_linear_infinite]" />
        </div>
      </div>
    </div>
  );
};
