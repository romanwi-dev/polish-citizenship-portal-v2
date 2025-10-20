export const RealisticWarsaw = () => {
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
        <source src="https://player.vimeo.com/external/396761224.sd.mp4?s=115f7783eb27c0e9fb79c6e09b812f67a0f1acae&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
      </video>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-end justify-center pb-16 text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            Warsaw Awaits
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Your European Future
          </p>
        </div>
      </div>
    </div>
  );
};
