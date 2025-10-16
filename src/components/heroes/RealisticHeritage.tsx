import heritageBackground from '@/assets/heritage-background.jpg';

export const RealisticHeritage = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heritageBackground}
          alt="Heritage background"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
