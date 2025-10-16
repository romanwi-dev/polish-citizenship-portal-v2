import heritageBackground from '@/assets/heritage-background.jpg';

export const RealisticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <img
        src={heritageBackground}
        alt=""
        className="w-full h-full object-cover"
      />
    </div>
  );
};
