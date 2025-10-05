import { Shield, Zap, Globe } from "lucide-react";
import logo from "@/assets/logo.png";

const FooterWeb3 = () => {
  return (
    <footer className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="mb-6">
              <img src={logo} alt="PolishCitizenship.pl" className="h-8 w-auto" />
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Expert legal guidance for people of Polish and Polish-Jewish descent from around the world. 
              Unmatched 100% success rate, realistic timelines, transparent pricing. Since 2003.
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
            <h4 className="font-semibold text-foreground mb-6 text-lg">Services</h4>
            <ul className="space-y-3">
              {['AI Analysis', 'Legal Guidance', 'Document Processing', 'Pricing'].map((item, idx) => (
                <li key={item}>
                  <a 
                    href={idx === 3 ? "#pricing" : "#services"} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-lg">Resources</h4>
            <ul className="space-y-3">
              {[
                { label: 'Take Test', url: 'https://polishcitizenship.typeform.com/to/PS5ecU' },
                { label: 'Family Tree', url: 'https://polishcitizenshippl-20-8pfm8wc5m6.replit.app/family-tree' },
                { label: 'About Process', url: '#' },
                { label: 'Contact', url: '#contact' }
              ].map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.url} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                    target={item.url.startsWith('http') ? '_blank' : undefined}
                    rel={item.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-lg">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} PolishCitizenship.pl - Expert Legal Services Since 2003
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWeb3;