/**
 * Project data. Kept separate from the component so the UI stays readable and
 * the dataset can be edited without touching presentation code.
 *
 * Titles and descriptions are resolved at runtime from the i18n files
 * (PROJECTS.<KEY>.TITLE / .DESCRIPTION / .LONG_DESCRIPTION) so the portfolio
 * stays translated. Technologies, categories, years and links are the
 * canonical values.
 */
export interface Project {
  key: string;
  /** i18n key path for the title, e.g. PROJECTS.AI_CHAT.TITLE */
  titleKey: string;
  descriptionKey: string;
  longDescriptionKey: string;
  /** Fallbacks used before translations resolve. */
  fallbackTitle: string;
  fallbackDescription: string;
  technologies: string[];
  category: string;
  featured: boolean;
  /** Year shown on the card. */
  date: string;
  links?: { labelKey: string; url: string; icon: string }[];
}

const GITHUB = 'https://github.com/abiidoox';

export const PROJECTS: Project[] = [
  {
    key: 'AI_CHAT',
    titleKey: 'PROJECTS.AI_CHAT.TITLE',
    descriptionKey: 'PROJECTS.AI_CHAT.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.AI_CHAT.LONG_DESCRIPTION',
    fallbackTitle: 'AI Chat Assistant',
    fallbackDescription: 'A conversational AI assistant built with FastAPI and TinyLlama',
    technologies: ['FastAPI', 'TinyLlama', 'React.js', 'Docker'],
    category: 'ai',
    featured: true,
    date: '2025',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'COMPANY_DOMICILIATION',
    titleKey: 'PROJECTS.COMPANY_DOMICILIATION.TITLE',
    descriptionKey: 'PROJECTS.COMPANY_DOMICILIATION.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.COMPANY_DOMICILIATION.LONG_DESCRIPTION',
    fallbackTitle: 'Company Domiciliation Management Platform',
    fallbackDescription: 'Web platform for complete management of company domiciliation',
    technologies: ['Spring Boot', 'Angular', 'MySQL', 'JPA/Hibernate', 'RESTful API', 'Spring Security'],
    category: 'web',
    featured: true,
    date: '2025',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'FACE_RECOGNITION',
    titleKey: 'PROJECTS.FACE_RECOGNITION.TITLE',
    descriptionKey: 'PROJECTS.FACE_RECOGNITION.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.FACE_RECOGNITION.LONG_DESCRIPTION',
    fallbackTitle: 'Smart Face Recognition System',
    fallbackDescription: 'An IoT-based facial recognition system using ESP32-S3, Django, and React Native',
    technologies: ['ESP32-S3', 'Django', 'React Native', 'FFmpeg', 'ResNet', 'SCRFD', 'PostgreSQL', 'Redis'],
    category: 'mobile',
    featured: true,
    date: '2024',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'EMPLOYMENT_PLATFORM',
    titleKey: 'PROJECTS.EMPLOYMENT_PLATFORM.TITLE',
    descriptionKey: 'PROJECTS.EMPLOYMENT_PLATFORM.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.EMPLOYMENT_PLATFORM.LONG_DESCRIPTION',
    fallbackTitle: 'Integrated Web Platform for Job and Internship Offers',
    fallbackDescription: 'A web platform dedicated to job and internship offers using web scraping',
    technologies: ['Spring Boot', 'Java', 'Spring Security', 'Selenium', 'MySQL', 'Chart.js', 'Thymeleaf'],
    category: 'web',
    featured: true,
    date: '2023',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'SPAM_DETECTION',
    titleKey: 'PROJECTS.SPAM_DETECTION.TITLE',
    descriptionKey: 'PROJECTS.SPAM_DETECTION.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.SPAM_DETECTION.LONG_DESCRIPTION',
    fallbackTitle: 'Email Spam Detection Model',
    fallbackDescription: 'A machine learning model to classify emails as spam or legitimate',
    technologies: ['Python', 'TF-IDF', 'K-NN', 'Decision Trees', 'scikit-learn'],
    category: 'ai',
    featured: false,
    date: '2023',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'SCHEDULE_SYSTEM',
    titleKey: 'PROJECTS.SCHEDULE_SYSTEM.TITLE',
    descriptionKey: 'PROJECTS.SCHEDULE_SYSTEM.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.SCHEDULE_SYSTEM.LONG_DESCRIPTION',
    fallbackTitle: 'Schedule Management System',
    fallbackDescription: 'A comprehensive schedule management system developed with ASP.NET and SQL Server',
    technologies: ['C#', 'ASP.NET MVC', 'Entity Framework', 'SQL Server', 'T-SQL'],
    category: 'web',
    featured: false,
    date: '2022',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }]
  },
  {
    key: 'SCHOOL_MANAGEMENT_APP_2',
    titleKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP_2.TITLE',
    descriptionKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP_2.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP_2.LONG_DESCRIPTION',
    fallbackTitle: 'School Management Desktop App',
    fallbackDescription: 'A Java Swing desktop application for managing school records',
    technologies: ['Java', 'Swing', 'MySQL', 'MVC'],
    category: 'desktop',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }],
    featured: false,
    date: '2022'
  },
  {
    key: 'SCHOOL_MANAGEMENT_APP',
    titleKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP.TITLE',
    descriptionKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.SCHOOL_MANAGEMENT_APP.LONG_DESCRIPTION',
    fallbackTitle: 'School Management Application',
    fallbackDescription: 'A complete and user-friendly school management application',
    technologies: ['ASP.NET Web Forms', 'SQL Server', 'JavaScript', 'HTML5', 'CSS3'],
    category: 'web',
    featured: false,
    date: '2021'
  },
  {
    key: 'OPTICIAN_ORDER_STOCK',
    titleKey: 'PROJECTS.OPTICIAN_ORDER_STOCK.TITLE',
    descriptionKey: 'PROJECTS.OPTICIAN_ORDER_STOCK.DESCRIPTION',
    longDescriptionKey: 'PROJECTS.OPTICIAN_ORDER_STOCK.LONG_DESCRIPTION',
    fallbackTitle: 'Order and Stock Management Application for Opticians',
    fallbackDescription: 'Software for managing orders and inventory in an optical store',
    technologies: ['C#', 'Windows Forms', 'T-SQL', 'SQL Server'],
    category: 'desktop',
    links: [{ labelKey: 'PROJECTS.GITHUB_PROFILE', url: GITHUB, icon: 'fab fa-github' }],
    featured: false,
    date: '2021'
  }
];
