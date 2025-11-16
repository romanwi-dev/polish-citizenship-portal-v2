import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();
  
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => (
          <li
            key={index}
            className="flex items-center gap-2"
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
          >
            {item.href ? (
              <>
                <Link
                  to={item.href}
                  className="hover:text-foreground transition-colors"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </Link>
                <meta itemProp="position" content={String(index + 1)} />
              </>
            ) : (
              <>
                <span className="text-foreground font-medium" itemProp="name">
                  {item.label}
                </span>
                <meta itemProp="position" content={String(index + 1)} />
              </>
            )}
            {index < items.length - 1 && (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
