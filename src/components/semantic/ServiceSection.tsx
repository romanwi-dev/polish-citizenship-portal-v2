import { ReactNode } from "react";

interface ServiceSectionProps {
  serviceName: string;
  description?: string;
  price?: number;
  currency?: string;
  children: ReactNode;
  className?: string;
}

export function ServiceSection({
  serviceName,
  description,
  price,
  currency = "EUR",
  children,
  className = "",
}: ServiceSectionProps) {
  return (
    <section
      itemScope
      itemType="https://schema.org/Service"
      className={className}
      data-entity="service"
      data-service-name={serviceName}
    >
      <meta itemProp="name" content={serviceName} />
      {description && <meta itemProp="description" content={description} />}
      {price && (
        <>
          <meta itemProp="price" content={String(price)} data-price={price} />
          <meta itemProp="priceCurrency" content={currency} data-currency={currency} />
        </>
      )}
      {children}
    </section>
  );
}
