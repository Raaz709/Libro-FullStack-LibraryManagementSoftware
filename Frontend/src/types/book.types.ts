export interface Book {
  id: number;
  isbn: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  language: string | null;
  edition: string | null;
  publisherId: number;
  publishedDate: string | null; 
  price: number | null;
  coverImageUrl: string | null;
  status: string;
  createdAt: string; 
}