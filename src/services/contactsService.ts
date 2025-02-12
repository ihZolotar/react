import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/utils/firebaseConfig';
import { Contact } from '@/types';

const contactsCollection = collection(db, 'contacts');

export const addContact = async (contact: Omit<Contact, 'id'>) => {
    const docRef = await addDoc(contactsCollection, contact);
    return { id: docRef.id, ...contact };
};

export const getContacts = async (): Promise<Contact[]> => {
    const snapshot = await getDocs(contactsCollection);
    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Contact[];
};

export const updateContact = async (id: string, updatedData: Partial<Contact>) => {
    const contactDoc = doc(db, 'contacts', id);
    await updateDoc(contactDoc, updatedData);
};

export const deleteContact = async (id: string) => {
    const contactDoc = doc(db, 'contacts', id);
    await deleteDoc(contactDoc);
};
