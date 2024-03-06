export interface ListData<T> {
  data: T[];
  meta: Meta;
}

export interface Meta {
  currentPage?: number;
  firstPage?: number;
  firstPageUrl?: string;
  lastPage?: number;
  lastPageUrl?: string;
  nextPageUrl?: string;
  perPage?: number;
  previousPageUrl?: string;
  total: number;
}

export interface User {
  id: number;
  email: string;
  fullName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  user: User;
  createdAt?: string;
  updatedAt?: string;
}

export interface Todo {
  id: number;
  title: string;
  category: Category;
  status: string;
  user: User;
  createdAt?: string;
  updatedAt?: string;
}
