export const RealisticPolandJourney = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Video background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69a27dbc4ff2b87d38afc35f1a9e7c02d&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
      </video>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            Your Polish Citizenship Journey
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Begin Your Heritage Story
          </p>
        </div>
      </div>
    </div>
  );
};
