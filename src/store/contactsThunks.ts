import { createAsyncThunk } from '@reduxjs/toolkit';
import {
    addContact as addContactToFirestore,
    deleteContact as deleteContactFromFirestore,
    getContacts,
    updateContact as updateContactInFirestore,
} from '@/services/contactsService';
import { toErrorMessage } from '@/utils/toErrorMessage';
import type { ThunkConfig } from '@/store';
import type {
    Contact,
    ContactDraft,
    ContactIdArg,
    FetchContactsArg,
    UpdateContactArg,
} from '@/types';

export const fetchContacts = createAsyncThunk<Contact[], FetchContactsArg, ThunkConfig>(
    'contacts/fetchContacts',
    async ({ activeOnly = false }, { rejectWithValue }) => {
        try {
            return await getContacts(activeOnly);
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to fetch contacts'));
        }
    },
    {
        condition: (_arg, { getState }) => getState().contacts.listStatus !== 'pending',
    }
);

export const addContact = createAsyncThunk<Contact, ContactDraft, ThunkConfig>(
    'contacts/addContact',
    async (draft, { rejectWithValue }) => {
        try {
            return await addContactToFirestore(draft);
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to add contact'));
        }
    }
);

export const updateContact = createAsyncThunk<UpdateContactArg, UpdateContactArg, ThunkConfig>(
    'contacts/updateContact',
    async ({ id, changes }, { rejectWithValue }) => {
        try {
            await updateContactInFirestore(id, changes);

            return { id, changes };
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to update contact'));
        }
    }
);

export const deleteContact = createAsyncThunk<string, ContactIdArg, ThunkConfig>(
    'contacts/deleteContact',
    async ({ id }, { rejectWithValue }) => {
        try {
            await deleteContactFromFirestore(id);

            return id;
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to delete contact'));
        }
    }
);

export const toggleContactActive = createAsyncThunk<UpdateContactArg, ContactIdArg, ThunkConfig>(
    'contacts/toggleContactActive',
    async ({ id }, { getState, dispatch, rejectWithValue }) => {
        const contact = getState().contacts.items.find((item) => item.id === id);

        if (!contact) {
            return rejectWithValue(`Contact with id ${id} is not in the store`);
        }

        try {
            return await dispatch(
                updateContact({ id, changes: { active: !contact.active } })
            ).unwrap();
        } catch (error) {
            return rejectWithValue(toErrorMessage(error, 'Failed to update contact status'));
        }
    }
);
