// Work history, education and publications. Newest first.
// The home page shows the first three highlights of each role; the About page shows all of them.

export interface Role {
  title: string;
  org: string;
  start: string;
  end: string;
  highlights: string[];
}

export const experience: Role[] = [
  {
    title: 'Machine Learning Engineer II',
    org: 'HealthKart',
    start: 'Apr 2026',
    end: 'Present',
    highlights: [
      'Lead LLM and agent work.',
      'Designed the system architecture for agent systems used inside the organisation, and built them out.',
      'Mentor engineers and review designs and code.',
    ],
  },
  {
    title: 'Software Development Engineer I',
    org: 'HealthKart',
    start: 'Aug 2024',
    end: 'Apr 2026',
    highlights: [
      'Designed and implemented a complete MLOps architecture for continuous monitoring of deployed ML models and training pipelines, to detect and handle model and data drift.',
      'Built an automated ML pipeline on Apache Airflow that retrains skin defect, hair loss stage and precipitate detection models bi-weekly, with MLflow for performance logging.',
      'Implemented a Model Context Protocol (MCP) server with tools to search products, add them to cart, and generate payment links for UPI or COD checkout.',
      'Fine-tuned LLMs on internal repositories to create coding-specific models, using Unsloth, Transformers and LoRA.',
      'Created and maintained Spring Boot REST APIs for payment link generation and verification.',
      'Enhanced OpenWebUI with custom PDF table parsing and RAG improvements: semantic chunking, reranking and metadata filtering.',
      'Developed a distributed event logging system in Spring Boot on AWS Kinesis producer and consumer streams.',
      'Built a database AI agent that handles customer support queries, integrated via MCP.',
      'Implemented a company-wide pull request code review pipeline.',
      'Created a synthetic dataset generator for fine-tuning LLMs on e-commerce question answering.',
      'Built a Python JSON preprocessor that converts complex nested structures into an LLM-friendly format, deployed as a GPT plugin for MuscleBlaze search, coupons and returns.',
      'Engineered a codebase parser with embedding and indexing support, integrated with LangGraph for retrieval.',
    ],
  },
  {
    title: 'AI Intern',
    org: 'HealthKart',
    start: 'Sep 2023',
    end: 'Aug 2024',
    highlights: [
      'Built an iOS LiDAR-based body measurement application using ARKit and a convex hull algorithm served via API.',
      'Trained a YOLOv8 model to detect seven hair loss stages with over 90% real-time accuracy.',
      'Developed a deep learning skin defect detection model (Mask R-CNN) for acne, fine lines, pigmentation and more.',
      'Implemented a glare classification model to filter unsuitable images out of the pipeline.',
    ],
  },
  {
    title: 'AI Intern',
    org: 'FrshrTech Technologies',
    start: 'Apr 2023',
    end: 'Jun 2023',
    highlights: [
      'Developed an RTSP and gait-based surveillance system for DRDO.',
      'Integrated pose estimation, instance segmentation, gait recognition and object detection in a unified pipeline.',
      'Containerised the entire application for deployment at the DRDO site.',
    ],
  },
];

export const education = [
  {
    degree: 'B.E. Computer Science, specialisation in AI & ML',
    school: 'Chandigarh University',
    start: '2019',
    end: '2023',
  },
];

export const publications = [
  {
    title: 'A Comparative Study of Pose Estimation',
    venue: 'IEEE Xplore',
    year: '2022',
    url: 'https://ieeexplore.ieee.org/document/9754071',
  },
];
