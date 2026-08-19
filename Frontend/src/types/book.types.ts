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

export interface Author {
  id: number;
  firstName: string;
  lastName: string;
  biography: string | null;
  country: string | null;
  birthDate: string | null;
  photoUrl: string | null;
}

export interface AuthorDto {
  firstName: string;
  lastName: string;
  biography?: string | null;
  country?: string | null;
  birthDate?: string | null;
  photoUrl?: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface CategoryDto {
  name: string;
  description?: string | null;
}

export interface Publisher {
  id: number;
  name: string;
}

export interface BookCopy {
  id: number;
  bookId: number;
  status: string;
}
