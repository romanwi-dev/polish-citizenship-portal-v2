import { Facebook, Twitter, Linkedin, Send, MessageCircle, Link2 } from "lucide-react";
import { toast } from "sonner";
import { SiPinterest } from "react-icons/si";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "default" | "floating" | "inline" | "minimal";
}

export function SocialShare({ 
  url = typeof window !== 'undefined' ? window.location.href : '',
  title = "Polish Citizenship Portal",
  description = "Expert assistance with Polish citizenship by descent",
  variant = "default"
}: SocialShareProps) {

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(description || title)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  if (variant === "minimal") {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleShare("facebook")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on Facebook"
        >
          <Facebook className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => handleShare("twitter")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on Twitter"
        >
          <Twitter className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => handleShare("linkedin")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on LinkedIn"
        >
          <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => handleShare("pinterest")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on Pinterest"
        >
          <SiPinterest className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => handleShare("whatsapp")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on WhatsApp"
        >
          <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={() => handleShare("telegram")}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Share on Telegram"
        >
          <Send className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        <button
          onClick={handleCopyLink}
          className="group p-3 rounded-full bg-muted/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
          aria-label="Copy link"
        >
          <Link2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>
      </div>
    );
  }

  return null;
}
