import { ReactNode } from "react";

interface ArticleWrapperProps {
  title: string;
  description?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  children: ReactNode;
  className?: string;
}

export function ArticleWrapper({
  title,
  description,
  author = "Polish Citizenship Portal",
  datePublished,
  dateModified,
  children,
  className = "",
}: ArticleWrapperProps) {
  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className={className}
      data-entity="article"
    >
      <meta itemProp="headline" content={title} />
      {description && <meta itemProp="description" content={description} />}
      <meta itemProp="author" content={author} />
      {datePublished && <meta itemProp="datePublished" content={datePublished} />}
      {dateModified && <meta itemProp="dateModified" content={dateModified} />}
      {children}
    </article>
  );
}
