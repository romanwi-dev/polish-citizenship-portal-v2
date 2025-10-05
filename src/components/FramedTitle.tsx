interface FramedTitleProps {
  text: string;
  className?: string;
}

export default function FramedTitle({ text, className = "" }: FramedTitleProps) {
  return (
    <span className={className}>
      {text.split('').map((char, index) => (
        <span key={index} className="text-framed-letter">
          {char}
        </span>
      ))}
    </span>
  );
}
