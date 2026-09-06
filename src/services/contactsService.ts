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
    FirestoreError,
    type DocumentData,
    type FirestoreDataConverter,
} from 'firebase/firestore';
import { db, ensureSignedIn } from '@/utils/firebaseConfig';
import { Contact } from '@/types';

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const asOptionalString = (value: unknown): string | undefined =>
    typeof value === 'string' ? value : undefined;

const contactConverter: FirestoreDataConverter<Contact> = {
    toFirestore: (contact): DocumentData => ({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        active: contact.active,
    }),
    fromFirestore: (snapshot, options): Contact => {
        const data = snapshot.data(options);

        return {
            id: snapshot.id,
            first_name: asString(data.first_name),
            last_name: asString(data.last_name),
            email: asString(data.email),
            phone: asString(data.phone),
            active: data.active === true,
            created_at: asOptionalString(data.created_at),
            updated_at: asOptionalString(data.updated_at),
        };
    },
};

const contactsCollection = collection(db, 'contacts');
const contactsReadCollection = contactsCollection.withConverter(contactConverter);

const contactDocRef = (id: string) => doc(db, 'contacts', id);

const handleFirebaseError = (error: unknown, customMessage: string): Error => {
    if (error instanceof FirestoreError) {
        return new Error(`${customMessage}: ${error.message} (code: ${error.code})`, {
            cause: error,
        });
    }

    return new Error(customMessage, { cause: error });
};

export const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    try {
        await ensureSignedIn();

        const now = new Date().toISOString();
        const docRef = await addDoc(contactsCollection, {
            ...contact,
            created_at: now,
            updated_at: now,
        });

        return { id: docRef.id, ...contact, created_at: now, updated_at: now };
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to add contact');
    }
};

export const getContacts = async (activeOnly = false): Promise<Contact[]> => {
    try {
        await ensureSignedIn();

        const contactsQuery = activeOnly
            ? query(contactsReadCollection, where('active', '==', true), orderBy('last_name'))
            : query(contactsReadCollection, orderBy('last_name'));

        const snapshot = await getDocs(contactsQuery);

        return snapshot.docs.map((snapshotDoc) => snapshotDoc.data());
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to get contacts');
    }
};

export const getContactById = async (id: string): Promise<Contact | null> => {
    try {
        await ensureSignedIn();

        const snapshot = await getDoc(contactDocRef(id).withConverter(contactConverter));

        return snapshot.exists() ? snapshot.data() : null;
    } catch (error) {
        throw handleFirebaseError(error, `Failed to get contact with id ${id}`);
    }
};

export const updateContact = async (id: string, updatedData: Partial<Contact>): Promise<void> => {
    try {
        await ensureSignedIn();

        await updateDoc(contactDocRef(id), {
            ...updatedData,
            updated_at: new Date().toISOString(),
        });
    } catch (error) {
        throw handleFirebaseError(error, `Failed to update contact with id ${id}`);
    }
};

export const deleteContact = async (id: string): Promise<void> => {
    try {
        await ensureSignedIn();

        await deleteDoc(contactDocRef(id));
    } catch (error) {
        throw handleFirebaseError(error, `Failed to delete contact with id ${id}`);
    }
};

export const searchContacts = async (searchQuery: string): Promise<Contact[]> => {
    try {
        const contacts = await getContacts();
        const normalizedQuery = searchQuery.toLowerCase().trim();

        return contacts.filter(
            (contact) =>
                contact.first_name.toLowerCase().includes(normalizedQuery) ||
                contact.last_name.toLowerCase().includes(normalizedQuery) ||
                contact.email.toLowerCase().includes(normalizedQuery) ||
                contact.phone.includes(normalizedQuery)
        );
    } catch (error) {
        throw handleFirebaseError(error, 'Failed to search contacts');
    }
};
