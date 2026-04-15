import type { ArticleData } from './types';

const article: ArticleData = {
  slug: 'zero-cloud-medical-privacy',
  title: 'Zero Cloud Medical Privacy: Keep Your Health Data Off Other People\'s Servers',
  description:
    'Zero-cloud means your health data never touches a remote server, not during entry, not during storage, not during analysis. Here is why that architectural choice matters.',
  h1: 'Zero Cloud Medical Privacy: Keeping Health Data on Your Device',
  cluster: 'privacy',
  isPillar: false,
  schemaTypes: ['Article'],
  sections: [
    {
      h2: 'What zero-cloud actually means',
      paragraphs: [
        'Zero-cloud medical privacy is not a marketing label. It is an architectural commitment. Health data never touches a remote server at any point in its lifecycle, not during entry, not during storage, not during analysis, not during export. The server delivers the application code; your device handles everything else. This provides privacy guarantees that no cloud-based privacy policy can match, because the protection is structural rather than contractual.',
        'Traditional cloud apps ask you to trust a company\'s promises. Zero-cloud asks you to trust mathematics and code, both of which are verifiable. Pain Tracker\'s open-source codebase lets anyone confirm that no data leaves your device. The privacy guarantee is auditable, not aspirational.',
      ],
    },
    {
      h2: 'Why cloud health data is inherently risky',
      paragraphs: [
        'Cloud-stored health data faces a uniquely difficult threat landscape. Unlike financial data, which can be frozen, changed, and reissued, health data cannot be changed once exposed. Your pain history, medication records, and functional limitations become permanent public information if a breach occurs. This irreversibility makes prevention the only viable strategy. Response is not enough.',
        'The scale of health data breaches makes this concrete. Hundreds of millions of health records have been exposed globally in the past five years. Even well-funded healthcare organisations with dedicated security teams suffer breaches regularly. For consumer health apps with smaller budgets and less security expertise, the risk is proportionally greater. The question is not whether breaches happen. They do.',
      ],
    },
    {
      h2: 'How zero-cloud architecture works in practice',
      paragraphs: [
        'Pain Tracker is delivered as a Progressive Web App. After the initial load, the service worker caches all application code locally. The app then functions entirely offline, using IndexedDB for encrypted data storage and the Web Crypto API for on-device encryption.',
        'There are no API endpoints that accept health data. No database on the server. No user accounts, authentication tokens, or session cookies that identify individual users. The server is stateless and health-data-free. It could be replaced by any static file hosting service without affecting functionality.',
        'This architecture also means no server logs containing health information, no database backups that could be exposed, and no admin panel displaying user data. The attack surface for health data is reduced to one point: your physical device.',
      ],
    },
    {
      h2: 'The trade-offs worth knowing about',
      paragraphs: [
        'Choosing zero-cloud means accepting certain trade-offs. There is no automatic multi-device sync, your data lives on one device unless you manually export and import. There is no "forgot password" recovery, your passphrase is the only key, and losing it means losing access. There are no server-side analytics that the development team can use to improve the product automatically.',
        'These trade-offs are intentional. Each represents a feature that would require server-side data access, which would break the zero-cloud guarantee. Pain Tracker mitigates these limitations through easy exports for manual backup, clear onboarding guidance about passphrase management, and open-source community feedback as an alternative to analytics. Nothing is hidden.',
      ],
    },
    {
      h2: 'Who needs zero-cloud medical privacy',
      paragraphs: [
        'Anyone tracking health data benefits from stronger privacy. But zero-cloud is particularly important for people whose health data exposure carries real consequences. Workers\' compensation claimants whose employers might seek access to health records. People with pain conditions whose insurers might use symptom data to deny coverage. Patients in domestic situations where a partner monitors their digital activity.',
        'The zero-cloud model also serves patients who simply believe health data is inherently private and should not exist on corporate servers regardless of how securely it is stored there. This is not paranoia. It is a reasonable privacy position that the technology industry should support, not dismiss.',
      ],
    },
  ],
};

export default article;
