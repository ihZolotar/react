import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    FirestoreError
} from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { Contact } from '@/types';

const contactsCollection = collection(db, 'contacts');

/**
 * Error handling for Firebase
 */
const handleFirebaseError = (error: unknown, customMessage: string): Error => {
    console.error(customMessage, error);

    if (error instanceof FirestoreError) {
        return new Error(`${customMessage}: ${error.message} (code: ${error.code})`);
    }

    return new Error(customMessage);
};

/**
 * Adds a new contact to the database
 */
export const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    try {
        const now = new Date().toISOString();
        const docRef = await addDoc(contactsCollection, {
            ...contact,
            created_at: now,
            updated_at: now
        });

        return { id: docRef.id, ...contact };
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to add contact');
    }
};

/**
 * Gets all contacts from the database
 */
export const getContacts = async (activeOnly = false): Promise<Contact[]> => {
    try {
        let contactsQuery;

        if (activeOnly) {
            contactsQuery = query(
                contactsCollection,
                where('active', '==', true),
                orderBy('last_name')
            );
        } else {
            contactsQuery = query(contactsCollection, orderBy('last_name'));
        }

        const snapshot = await getDocs(contactsQuery);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Contact[];
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to get contacts');
    }
};

/**
 * Gets a contact by ID
 */
export const getContactById = async (id: string): Promise<Contact | null> => {
    try {
        const contactDoc = doc(db, 'contacts', id);
        const snapshot = await getDoc(contactDoc);

        if (!snapshot.exists()) {
            return null;
        }

        return {
            id: snapshot.id,
            ...snapshot.data(),
        } as Contact;
    } catch (error) {
        throw handleFirebaseError(error, `Failed to get contact with id ${id}`);
    }
};

/**
 * Updates an existing contact
 */
export const updateContact = async (id: string, updatedData: Partial<Contact>): Promise<void> => {
    try {
        const contactDoc = doc(db, 'contacts', id);

        const snapshot = await getDoc(contactDoc);
        if (!snapshot.exists()) {
            throw new Error(`Contact with id ${id} not found`);
        }

        await updateDoc(contactDoc, {
            ...updatedData,
            updated_at: new Date().toISOString()
        });
    } catch (error) {
        throw handleFirebaseError(error, `Failed to update contact with id ${id}`);
    }
};

/**
 * Contact deletion
 */
export const deleteContact = async (id: string): Promise<void> => {
    try {
        const contactDoc = doc(db, 'contacts', id);

        const snapshot = await getDoc(contactDoc);

        if (!snapshot.exists()) {
            throw new Error(`Contact with id ${id} not found`);
        }

        await deleteDoc(contactDoc);
    } catch (error) {
        throw handleFirebaseError(error, `Failed to delete contact with id ${id}`);
    }
};

/**
 * Search contacts by name, surname or email
 */
export const searchContacts = async (searchQuery: string): Promise<Contact[]> => {
    try {
        const snapshot = await getDocs(contactsCollection);
        const contacts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Contact[];

        const query = searchQuery.toLowerCase().trim();

        return contacts.filter(
            (contact) =>
                contact.first_name.toLowerCase().includes(query) ||
                contact.last_name.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                contact.phone.includes(query)
        );
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to search contacts');
    }
};
