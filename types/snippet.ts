// types/snippet.ts
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

export interface Like {
  userId: string;
}

export interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags?: string[];
  likes?: Like[];
  comments?: Comment[];
}
