import { Shield, Zap, Globe } from "lucide-react";
import logo from "@/assets/logo.png";
import { useTranslation } from 'react-i18next';
import { SocialShare } from "@/components/social/SocialShare";

const FooterWeb3 = () => {
  const { t } = useTranslation('landing');
  
  return (
    <footer className="relative py-20 -mt-2 pt-12">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src={logo} alt="PolishCitizenship.pl" className="h-8 w-auto" width="400" height="70" loading="lazy" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex gap-4">
              {[Shield, Zap, Globe].map((Icon, i) => (
                <div 
                  key={i}
                  className="w-12 h-12 rounded-lg glass-card hover-glow flex items-center justify-center cursor-pointer group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{t('footer.servicesTitle')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.aiAnalysis')}
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.legalGuidance')}
                </a>
              </li>
              <li>
                <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.documentProcessing')}
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.pricing')}
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-6 text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">{t('footer.resourcesTitle')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="https://polishcitizenship.typeform.com/to/PS5ecU" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  {t('footer.takeTest')}
                </a>
              </li>
              <li>
                <a href="https://polishcitizenshippl-20-8pfm8wc5m6.replit.app/family-tree" className="text-muted-foreground hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
                  {t('footer.familyTree')}
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.aboutProcess')}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
            {/* Copyright - 2 lines on desktop */}
            <div className="flex-shrink-0 text-center lg:text-left">
              <p className="text-muted-foreground text-sm leading-tight">
                © {new Date().getFullYear()} {t('footer.copyright').split(' - ')[0]}
              </p>
              <p className="text-muted-foreground text-sm leading-tight">
                {t('footer.copyright').split(' - ')[1]}
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex-shrink-0">
              <SocialShare variant="minimal" />
            </div>
            
            {/* Links */}
            <div className="flex gap-6 text-sm flex-shrink-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                {t('footer.terms')}
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors whitespace-nowrap">
                {t('footer.contactUs')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWeb3;