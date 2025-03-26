// Інтерфейс для контакту
export interface Contact {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    active: boolean;
    created_at?: string;
    updated_at?: string;
}

// Тип для даних форми створення контакту
export type NewContactData = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

// Тип для помилок API
export interface ApiError {
    code: string;
    message: string;
}

// Типи для сортування таблиці
export type SortDirection = 'asc' | 'desc';
export type SortableField = 'first_name' | 'last_name' | 'email' | 'phone';
