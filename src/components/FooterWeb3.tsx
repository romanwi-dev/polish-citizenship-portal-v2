import { Globe, Shield, Zap } from "lucide-react";

const FooterWeb3 = () => {
  return (
    <footer className="relative py-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-primary/5 to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="container px-4 mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Polish Citizenship
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed mb-6">
              Revolutionary citizenship services powered by blockchain verification, 
              AI processing, and global diplomatic networks. Your heritage, reimagined.
            </p>
            <div className="flex gap-4">
              {[Shield, Zap, Globe].map((Icon, i) => (
                <div 
                  key={i}
                  className="w-12 h-12 rounded-xl glass-card hover-glow flex items-center justify-center cursor-pointer group"
                >
                  <Icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-lg">Services</h4>
            <ul className="space-y-3">
              {['AI Eligibility', 'Blockchain Verify', 'Smart Processing', 'Fast-Track'].map((item) => (
                <li key={item}>
                  <a href="#services" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-foreground mb-6 text-lg">Resources</h4>
            <ul className="space-y-3">
              {['Documentation', 'API Access', 'Smart Contracts', 'Community'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © {new Date().getFullYear()} Polish Citizenship Services. Powered by Web3 Technology.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Smart Contracts
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterWeb3;