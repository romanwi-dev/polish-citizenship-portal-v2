import { Facebook, Twitter, Linkedin, Send, Link2, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  variant?: "default" | "floating" | "inline";
}

export function SocialShare({ 
  url = window.location.href,
  title = "Polish Citizenship Portal",
  description = "Expert assistance with Polish citizenship by descent",
  variant = "default"
}: SocialShareProps) {
  const { t } = useTranslation();

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    window.open(shareUrls[platform], '_blank', 'width=600,height=400');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('social.linkCopied'));
    } catch (err) {
      toast.error(t('social.copyFailed'));
    }
  };

  const baseButtonClass = variant === "floating" 
    ? "h-12 w-12 rounded-full shadow-lg hover:shadow-xl"
    : "gap-2";

  return (
    <div 
      className={`flex ${variant === "floating" ? "flex-col gap-3" : "flex-wrap gap-2"} items-center`}
      data-social-share
    >
      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={() => handleShare('facebook')}
        className={baseButtonClass}
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
        {variant !== "floating" && <span>Facebook</span>}
      </Button>

      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={() => handleShare('twitter')}
        className={baseButtonClass}
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
        {variant !== "floating" && <span>Twitter</span>}
      </Button>

      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={() => handleShare('linkedin')}
        className={baseButtonClass}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        {variant !== "floating" && <span>LinkedIn</span>}
      </Button>

      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={() => handleShare('whatsapp')}
        className={baseButtonClass}
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
        {variant !== "floating" && <span>WhatsApp</span>}
      </Button>

      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={() => handleShare('telegram')}
        className={baseButtonClass}
        aria-label="Share on Telegram"
      >
        <Send className="h-4 w-4" />
        {variant !== "floating" && <span>Telegram</span>}
      </Button>

      <Button
        variant="outline"
        size={variant === "floating" ? "icon" : "sm"}
        onClick={handleCopyLink}
        className={baseButtonClass}
        aria-label="Copy link"
      >
        <Link2 className="h-4 w-4" />
        {variant !== "floating" && <span>{t('social.copyLink')}</span>}
      </Button>
    </div>
  );
}
