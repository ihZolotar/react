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
 * Обробка помилок Firebase
 */
const handleFirebaseError = (error: unknown, customMessage: string): Error => {
    console.error(customMessage, error);

    if (error instanceof FirestoreError) {
        return new Error(`${customMessage}: ${error.message} (code: ${error.code})`);
    }

    return new Error(customMessage);
};

/**
 * Додає новий контакт до бази даних
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
 * Отримує всі контакти з бази даних
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
 * Отримує один контакт за ID
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
 * Оновлює існуючий контакт
 */
export const updateContact = async (id: string, updatedData: Partial<Contact>): Promise<void> => {
    try {
        const contactDoc = doc(db, 'contacts', id);

        // Перевіряємо, чи існує контакт
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
 * Видаляє контакт
 */
export const deleteContact = async (id: string): Promise<void> => {
    try {
        const contactDoc = doc(db, 'contacts', id);

        // Перевіряємо, чи існує контакт
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
 * Пошук контактів за ім'ям, прізвищем або email
 */
export const searchContacts = async (searchQuery: string): Promise<Contact[]> => {
    try {
        // Firebase не має вбудованого повнотекстового пошуку
        // Тому отримуємо всі контакти і фільтруємо на клієнті
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
