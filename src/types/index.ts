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

export type ContactDraft = Omit<Contact, 'id' | 'created_at' | 'updated_at'>;

export type RequestStatus = 'idle' | 'pending' | 'succeeded' | 'failed';

export interface FetchContactsArg {
    activeOnly?: boolean;
}

export interface ContactIdArg {
    id: string;
}

export interface UpdateContactArg extends ContactIdArg {
    changes: Partial<ContactDraft>;
    optimistic?: boolean;
}

export type SortField = 'first_name' | 'last_name' | 'email' | 'phone';

export type SortOrder = 'asc' | 'desc';

export interface ContactsSort {
    field: SortField;
    order: SortOrder;
}