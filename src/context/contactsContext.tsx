'use client';

import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {Contact} from '@/types';
import {
    addContact,
    getContacts,
    updateContact,
    deleteContact,
    getContactById,
    searchContacts as searchContactsService,
} from '@/services/contactsService';

interface ContactsContextType {
    contacts: Contact[];
    selectedContact: Contact | null;

    loading: boolean;
    error: string | null;

    fetchContacts: (activeOnly?: boolean) => Promise<void>;
    addContactHandler: (contactData: Omit<Contact, 'id'>) => Promise<Contact>;
    updateContactHandler: (id: string, contactData: Partial<Contact>) => Promise<void>;
    deleteContactHandler: (id: string) => Promise<void>;
    toggleActiveHandler: (id: string, active: boolean) => Promise<void>;
    setSelectedContact: (contact: Contact | null) => void;
    getContact: (id: string) => Promise<Contact | null>;
    searchContacts: (query: string) => Promise<void>;
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined);

export const useContacts = () => {
    const context = useContext(ContactsContext);
    if (context === undefined) {
        throw new Error('useContacts must be used within a ContactsProvider');
    }
    return context;
};

interface ContactsProviderProps {
    children: ReactNode;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({children}) => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async (activeOnly = false) => {
        try {
            setLoading(true);
            const data = await getContacts(activeOnly);
            setContacts(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch contacts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const searchContacts = async (query: string) => {
        if (!query.trim()) {
            return fetchContacts();
        }

        try {
            setLoading(true);
            const data = await searchContactsService(query);
            setContacts(data);
            setError(null);
        } catch (err) {
            setError('Failed to search contacts');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addContactHandler = async (contactData: Omit<Contact, 'id'>) => {
        try {
            setLoading(true);
            const addedContact = await addContact(contactData);
            setContacts((prev) => [...prev, addedContact]);
            setError(null);
            return addedContact;
        } catch (err) {
            setError('Failed to add contact');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateContactHandler = async (id: string, contactData: Partial<Contact>) => {
        try {
            setLoading(true);
            await updateContact(id, contactData);
            setContacts((prev) =>
                prev.map((contact) =>
                    contact.id === id ? {...contact, ...contactData} : contact
                )
            );

            if (selectedContact && selectedContact.id === id) {
                setSelectedContact((prev) => (prev ? {...prev, ...contactData} : null));
            }

            setError(null);
        } catch (err) {
            setError('Failed to update contact');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteContactHandler = async (id: string) => {
        try {
            setLoading(true);
            await deleteContact(id);
            setContacts((prev) => prev.filter((contact) => contact.id !== id));

            if (selectedContact && selectedContact.id === id) {
                setSelectedContact(null);
            }

            setError(null);
        } catch (err) {
            setError('Failed to delete contact');
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const toggleActiveHandler = async (id: string, active: boolean) => {
        try {
            return await updateContactHandler(id, {active: !active});
        } catch (err) {
            console.error('Failed to toggle active status:', err);
            throw err;
        }
    };

    const getContact = async (id: string) => {
        try {
            setLoading(true);
            const contact = await getContactById(id);
            setError(null);
            return contact;
        } catch (err) {
            setError('Failed to fetch contact');
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        contacts,
        selectedContact,
        loading,
        error,
        fetchContacts,
        addContactHandler,
        updateContactHandler,
        deleteContactHandler,
        toggleActiveHandler,
        setSelectedContact,
        getContact,
        searchContacts,
    };

    return <ContactsContext.Provider value={value}>{children}</ContactsContext.Provider>;
};

export default ContactsContext;
