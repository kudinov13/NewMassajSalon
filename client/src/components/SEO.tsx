import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  schema?: Record<string, any> | Record<string, any>[];
  children?: React.ReactNode;
}

const DEFAULT_OG_IMAGE = 'https://koosmo.ru/logo512.png';
const SITE_NAME = 'КООСМО';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_OG_IMAGE,
  ogUrl,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  schema,
  children,
}) => {
  const fullTitle = title.includes('КООСМО') ? title : `${title} | КООСМО`;

  const renderSchema = () => {
    if (!schema) return null;
    const schemas = Array.isArray(schema) ? schema : [schema];
    return schemas.map((s, i) => (
      <script key={i} type="application/ld+json">
        {JSON.stringify({ '@context': 'https://schema.org', ...s })}
      </script>
    ));
  };

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      {canonical && <link rel="canonical" href={canonical} />}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="512" />
      <meta property="og:image:height" content="512" />
      <meta property="og:locale" content="ru_RU" />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {renderSchema()}
      {children}
    </Helmet>
  );
};

export default SEO;
