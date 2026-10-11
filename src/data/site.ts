// Site-wide settings, navigation and the profile shown on the home page.

export const site = {
  title: 'Raghvender',
  description:
    'Raghvender is a machine learning engineer working on LLM and agent systems, MLOps, and the databases and caches underneath them.',
  githubUser: 'Raghvender1205',
  analyticsId: 'G-4VP1VKLPKJ',
};

// Writing sections. Each key is a folder in src/content/ and a URL prefix.
export const sections = {
  blog: {
    label: 'Blog',
    blurb: 'Essays and write-ups on things I have built or learned.',
  },
  notes: {
    label: 'Research notes',
    blurb: 'Notes on papers I have read, and what I took from them.',
  },
  maths: {
    label: 'Maths',
    blurb: 'Derivations and worked problems behind the machine learning.',
  },
} as const;

export type SectionKey = keyof typeof sections;

// Project groups, in the order they appear on the projects page.
export const projectGroups = {
  'ml-systems': {
    label: 'ML systems',
    blurb: 'Infrastructure that machine learning runs on: vector search, serving, pipelines.',
  },
  'llm-tooling': {
    label: 'LLM tooling',
    blurb: 'Libraries and agents for building with language models.',
  },
  'ml-from-scratch': {
    label: 'ML from scratch',
    blurb: 'Frameworks and architectures rebuilt to understand how they work.',
  },
  systems: {
    label: 'Systems',
    blurb: 'Databases, caches and backends in Rust and Go.',
  },
} as const;

export type ProjectGroupKey = keyof typeof projectGroups;

export const nav = [
  { label: 'Projects', href: '/projects/' },
  { label: 'Blog', href: '/blog/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Maths', href: '/maths/' },
  { label: 'About', href: '/about/' },
];

export const profile = {
  name: 'Raghvender',
  role: 'Machine Learning Engineer II',
  company: 'HealthKart',
  location: 'Chandigarh, India',
  email: 'raghvender1205@gmail.com',
  // Path or URL of a resume PDF, e.g. '/resume.pdf' for a file in public/. Leave empty to hide the link.
  resumeUrl: '',
  intro: [
    'I am a machine learning engineer at HealthKart, where I lead LLM and agent work. I build the systems underneath AI as well as the models: MLOps pipelines, retrieval, agents, and the services they run on.',
    'Outside work I read papers and rebuild things from scratch to understand them, among them a vector database and a cache in Rust, an autodiff library, and model architectures.',
  ],
  glance: [
    { term: 'Now', detail: 'MLE-2 at HealthKart, since April 2026' },
    { term: 'Focus', detail: 'LLM and agent systems, MLOps, computer vision' },
    { term: 'Languages', detail: 'Python, Rust, Java, Go' },
    { term: 'Education', detail: 'B.E. Computer Science (AI & ML), Chandigarh University' },
    { term: 'Published', detail: 'IEEE, 2022: a comparative study of pose estimation' },
  ],
  links: [
    { label: 'GitHub', href: 'https://github.com/Raghvender1205' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/raghvender-changotra/' },
    { label: 'Hugging Face', href: 'https://huggingface.co/Raghvender' },
    { label: 'Kaggle', href: 'https://www.kaggle.com/raghvender' },
    { label: 'X', href: 'https://x.com/RaghvenderChan1' },
  ],
};
