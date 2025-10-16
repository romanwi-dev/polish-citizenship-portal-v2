export const RealisticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src="https://images.unsplash.com/photo-1513026705753-bc3fffca8bf4?w=1920&q=80"
        alt=""
        className="w-full h-full object-cover"
      />
      {/* Sepia/vintage overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/60 via-stone-900/70 to-slate-950/80" />
    </div>
  );
};
