export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    name: string;
  };
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
  author?: {
    name: string;
  };
}
