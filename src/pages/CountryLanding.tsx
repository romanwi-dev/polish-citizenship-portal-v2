import React from 'react';
import { useParams } from 'react-router-dom';
import HeritageGlobe from '@/components/HeritageGlobe';
import Navigation from '@/components/Navigation';
import FooterWeb3 from '@/components/FooterWeb3';

const CountryLanding = () => {
  const { countryCode } = useParams();
  // Default to 'US' if something goes wrong, but usually it grabs the URL
  const code = countryCode?.toUpperCase() || 'US';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow">
        <div className="bg-slate-900 pt-20 pb-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Claim Your Heritage
              </h1>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Specialized citizenship assistance for families in {code}.
              </p>
            </div>

            {/* The Dynamic Globe - Changes based on URL */}
            <div className="max-w-5xl mx-auto">
              <HeritageGlobe country={code} />
            </div>
          </div>
        </div>
      </main>

      <FooterWeb3 />
    </div>
  );
};

export default CountryLanding;

