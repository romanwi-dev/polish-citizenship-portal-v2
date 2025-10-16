export const RealisticHeritage = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image with parallax effect */}
      <div className="absolute inset-0">
        <div
          className="w-full h-full bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1601113635288-e82aa99c9be9?w=1920&q=80)`,
          }}
        />
      </div>
      
      {/* Sepia overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-stone-900/50 to-black/80" />
      
      {/* Film grain effect */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMC4wNSIvPjwvc3ZnPg==')]" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl font-serif">
            Heritage & Legacy
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Reconnecting with Your Roots
          </p>
        </div>
      </div>
    </div>
  );
};
