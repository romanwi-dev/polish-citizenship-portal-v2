export const RealisticEUFlag = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="none"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://player.vimeo.com/external/456044157.sd.mp4?s=76d746841d5c09e5e7e67a164d3829a2f3a78a1b&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
      </video>
      
      {/* Blue overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-yellow-600/20" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            European Union Citizenship
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Freedom, Rights, Opportunities
          </p>
        </div>
      </div>
    </div>
  );
};
