import { ReactNode } from 'react';

export const BrutalistDesign = ({ children }: { children: ReactNode }) => {
  return (
    <div className="h-full w-full relative overflow-hidden">
      {/* Footer-matching background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      {children}

      <style>{`
        .brutalist-link {
          background: black;
          color: white;
          border: 3px solid black;
          font-family: 'Arial Black', Arial, sans-serif;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.1s ease;
        }
        .dark .brutalist-link {
          background: white;
          color: black;
          border-color: white;
        }
        .brutalist-link:hover {
          background: red;
          color: white;
          border-color: red;
          transform: translate(2px, 2px);
          box-shadow: -4px -4px 0 black;
        }
        .dark .brutalist-link:hover {
          box-shadow: -4px -4px 0 white;
        }
        .brutalist-link:active {
          transform: translate(0, 0);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
};
