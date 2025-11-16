import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const baseUrl = "https://polishcitizenshipportal.com";
    const languages = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];
    const currentDate = new Date().toISOString();
    
    // Define all routes
    const routes = [
      { path: '', priority: '1.0', changefreq: 'weekly' },
      { path: '#services', priority: '0.9', changefreq: 'monthly' },
      { path: '#timeline', priority: '0.8', changefreq: 'monthly' },
      { path: '#pricing', priority: '0.9', changefreq: 'monthly' },
      { path: '#testimonials', priority: '0.7', changefreq: 'monthly' },
      { path: '#contact', priority: '0.8', changefreq: 'monthly' },
      { path: '#faq', priority: '0.8', changefreq: 'weekly' },
    ];

    // Build sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    sitemap += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Add URLs for each language
    for (const lang of languages) {
      for (const route of routes) {
        const url = `${baseUrl}/${lang}${route.path}`;
        sitemap += '  <url>\n';
        sitemap += `    <loc>${url}</loc>\n`;
        sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
        sitemap += `    <changefreq>${route.changefreq}</changefreq>\n`;
        sitemap += `    <priority>${route.priority}</priority>\n`;
        
        // Add hreflang alternates
        for (const altLang of languages) {
          const altUrl = `${baseUrl}/${altLang}${route.path}`;
          sitemap += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${altUrl}"/>\n`;
        }
        
        // Add OG image for main pages
        if (route.path === '') {
          sitemap += '    <image:image>\n';
          sitemap += `      <image:loc>${baseUrl}/og/${lang}-og-image.jpg</image:loc>\n`;
          sitemap += `      <image:title>Polish Citizenship Portal - ${lang.toUpperCase()}</image:title>\n`;
          sitemap += '    </image:image>\n';
        }
        
        sitemap += '  </url>\n';
      }
    }

    sitemap += '</urlset>';

    return new Response(sitemap, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  } catch (err) {
    const error = err as Error;
    console.error('Error generating sitemap:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
