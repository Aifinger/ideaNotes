export type NoteCategory = 'DAILY' | 'WORK' | 'IDEA';

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type ViewMode = 'mobile' | 'desktop';

export interface AIResponse {
  text: string;
}
