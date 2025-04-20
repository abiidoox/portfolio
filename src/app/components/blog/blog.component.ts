import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

interface BlogPost {
  id: number;
  titleKey: string;
  excerptKey: string;
  contentKey: string;
  date: Date;
  author: string;
  category: string;
  image: string;
  readTime: number;
  tags: string[];
}

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  selectedCategory: string = 'all';
  selectedTag: string = 'all';
  searchQuery: string = '';
  selectedPost: BlogPost | null = null;

  categories: string[] = ['all', 'development', 'ai', 'iot', 'cloud'];
  tags: string[] = ['all', 'angular', 'python', 'machine-learning', 'web-development', 'cloud-computing'];

  blogPosts: BlogPost[] = [
    {
      id: 1,
      titleKey: 'BLOG.POSTS.AI_CHAT.TITLE',
      excerptKey: 'BLOG.POSTS.AI_CHAT.EXCERPT',
      contentKey: 'BLOG.POSTS.AI_CHAT.CONTENT',
      date: new Date('2024-03-15'),
      author: 'Abderrazzaq El Abdouni',
      category: 'ai',
      image: 'assets/images/blog/ai-chat.jpg',
      readTime: 5,
      tags: ['ai', 'python', 'machine-learning']
    },
    {
      id: 2,
      titleKey: 'BLOG.POSTS.FACE_RECOGNITION.TITLE',
      excerptKey: 'BLOG.POSTS.FACE_RECOGNITION.EXCERPT',
      contentKey: 'BLOG.POSTS.FACE_RECOGNITION.CONTENT',
      date: new Date('2024-02-20'),
      author: 'Abderrazzaq El Abdouni',
      category: 'iot',
      image: 'assets/images/blog/face-recognition.jpg',
      readTime: 8,
      tags: ['iot', 'python', 'machine-learning']
    },
    {
      id: 3,
      titleKey: 'BLOG.POSTS.CLOUD_ARCHITECTURE.TITLE',
      excerptKey: 'BLOG.POSTS.CLOUD_ARCHITECTURE.EXCERPT',
      contentKey: 'BLOG.POSTS.CLOUD_ARCHITECTURE.CONTENT',
      date: new Date('2024-01-10'),
      author: 'Abderrazzaq El Abdouni',
      category: 'cloud',
      image: 'assets/images/blog/cloud-architecture.jpg',
      readTime: 6,
      tags: ['cloud-computing', 'web-development']
    }
  ];

  constructor(private translate: TranslateService) { }

  ngOnInit(): void {
  }

  get filteredPosts(): BlogPost[] {
    return this.blogPosts.filter(post => {
      const categoryMatch = this.selectedCategory === 'all' || post.category === this.selectedCategory;
      const tagMatch = this.selectedTag === 'all' || post.tags.includes(this.selectedTag);
      const searchMatch = this.searchQuery === '' || 
        this.translate.instant(post.titleKey).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.translate.instant(post.excerptKey).toLowerCase().includes(this.searchQuery.toLowerCase());
      
      return categoryMatch && tagMatch && searchMatch;
    });
  }

  getCategoryLabel(category: string): string {
    return this.translate.instant(`BLOG.CATEGORIES.${category.toUpperCase()}`);
  }

  getTagLabel(tag: string): string {
    return this.translate.instant(`BLOG.TAGS.${tag.toUpperCase()}`);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString(this.translate.currentLang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  openPost(post: BlogPost): void {
    this.selectedPost = post;
  }

  closePost(): void {
    this.selectedPost = null;
  }
} 