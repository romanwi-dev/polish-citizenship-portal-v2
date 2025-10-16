export const RealisticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src="https://images.unsplash.com/photo-1601113635288-e82aa99c9be9?w=1920&q=80"
        alt=""
        className="w-full h-full object-cover"
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
    </div>
  );
};
