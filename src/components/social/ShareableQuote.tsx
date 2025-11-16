import { Quote, Share2 } from "lucide-react";
import { useState } from "react";
import { SocialShare } from "./SocialShare";

interface ShareableQuoteProps {
  quote: string;
  author?: string;
  className?: string;
}

export function ShareableQuote({ quote, author, className = "" }: ShareableQuoteProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <div 
      className={`relative group ${className}`}
      data-shareable-quote
      itemScope
      itemType="https://schema.org/Quotation"
    >
      <blockquote className="border-l-4 border-primary pl-6 py-4 my-6 bg-muted/50 rounded-r-lg hover:bg-muted/70 transition-colors">
        <Quote className="h-8 w-8 text-primary/20 mb-2" aria-hidden="true" />
        <p className="text-lg italic text-foreground mb-3" itemProp="text">
          "{quote}"
        </p>
        {author && (
          <footer className="text-sm text-muted-foreground" itemProp="author">
            — {author}
          </footer>
        )}
        
        <button
          onClick={() => setShowShare(!showShare)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-background rounded-lg"
          aria-label="Share quote"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </blockquote>

      {showShare && (
        <div className="mt-3 p-4 bg-background border rounded-lg">
          <SocialShare
            title={`"${quote}" - ${author || 'Polish Citizenship Portal'}`}
            variant="inline"
          />
        </div>
      )}
    </div>
  );
}
