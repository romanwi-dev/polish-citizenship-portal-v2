export const RealisticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <div 
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1601113635288-e82aa99c9be9?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      />
    </div>
  );
};
