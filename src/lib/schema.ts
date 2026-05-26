export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function articleJsonLd({
  title, description, url, imageUrl, date, authorName,
}: {
  title: string; description: string; url: string; imageUrl: string; date: string; authorName: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    image: imageUrl,
    datePublished: date,
    author: { "@type": "Person", name: authorName },
    publisher: { "@type": "Organization", name: "PremiumPeek" },
  }
}

export function blogJsonLd(posts: { title: string; url: string; desc: string; date: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "PremiumPeek Blog",
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: post.url,
      description: post.desc,
      datePublished: post.date,
    })),
  }
}
