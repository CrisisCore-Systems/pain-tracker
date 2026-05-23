import { defaultSEOConfig } from '../../lib/seo';

type PageMetadata = {
  title: string;
  description: string;
  canonicalUrl: string;
};

type ManagedNode = {
  element: Element;
  attribute: 'content' | 'href';
  previousValue: string | null;
  created: boolean;
};

function ensureNode(selector: string, factory: () => Element): { element: Element; created: boolean } {
  const existing = document.querySelector(selector);
  if (existing) {
    return { element: existing, created: false };
  }

  const created = factory();
  document.head.appendChild(created);
  return { element: created, created: true };
}

export function applyPageMetadata(metadata: PageMetadata): () => void {
  const previousTitle = document.title;
  const managed: ManagedNode[] = [];

  document.title = metadata.title;

  const bind = (
    selector: string,
    attribute: 'content' | 'href',
    value: string,
    factory: () => Element
  ) => {
    const { element, created } = ensureNode(selector, factory);
    managed.push({
      element,
      attribute,
      previousValue: element.getAttribute(attribute),
      created,
    });
    element.setAttribute(attribute, value);
  };

  bind('meta[name="description"]', 'content', metadata.description, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    return meta;
  });
  bind('meta[property="og:title"]', 'content', metadata.title, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:title');
    return meta;
  });
  bind('meta[property="og:description"]', 'content', metadata.description, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:description');
    return meta;
  });
  bind('meta[property="og:url"]', 'content', metadata.canonicalUrl, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:url');
    return meta;
  });
  bind('meta[property="og:site_name"]', 'content', defaultSEOConfig.siteName, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('property', 'og:site_name');
    return meta;
  });
  bind('meta[name="twitter:title"]', 'content', metadata.title, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:title');
    return meta;
  });
  bind('meta[name="twitter:description"]', 'content', metadata.description, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:description');
    return meta;
  });
  bind('meta[name="twitter:url"]', 'content', metadata.canonicalUrl, () => {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'twitter:url');
    return meta;
  });
  bind('link[rel="canonical"]', 'href', metadata.canonicalUrl, () => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    return link;
  });

  return () => {
    document.title = previousTitle || defaultSEOConfig.siteName;

    for (const item of managed.reverse()) {
      if (item.created) {
        item.element.remove();
      } else if (item.previousValue === null) {
        item.element.removeAttribute(item.attribute);
      } else {
        item.element.setAttribute(item.attribute, item.previousValue);
      }
    }
  };
}
