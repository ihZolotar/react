import { createSlice, isAnyOf, type PayloadAction } from '@reduxjs/toolkit';
import {
    addContact,
    deleteContact,
    fetchContacts,
    updateContact,
} from './contactsThunks';
import type { Contact, ContactsSort, RequestStatus } from '@/types';

interface ContactsState {
    items: Contact[];
    selectedContactId: string | null;
    searchQuery: string;
    sort: ContactsSort;
    listStatus: RequestStatus;
    listError: string | null;
    createStatus: RequestStatus;
    pendingIds: Record<string, boolean>;
    mutationError: string | null;
}

const initialState: ContactsState = {
    items: [],
    selectedContactId: null,
    searchQuery: '',
    sort: { field: 'last_name', order: 'asc' },
    listStatus: 'idle',
    listError: null,
    createStatus: 'idle',
    pendingIds: {},
    mutationError: null,
};

const isRowMutationPending = isAnyOf(updateContact.pending, deleteContact.pending);

const isRowMutationSettled = isAnyOf(
    updateContact.fulfilled,
    updateContact.rejected,
    deleteContact.fulfilled,
    deleteContact.rejected
);

const isMutationRejected = isAnyOf(
    addContact.rejected,
    updateContact.rejected,
    deleteContact.rejected
);

const contactsSlice = createSlice({
    name: 'contacts',
    initialState,
    reducers: {
        setSearchQuery(state, action: PayloadAction<string>) {
            state.searchQuery = action.payload;
        },
        setSort(state, action: PayloadAction<ContactsSort>) {
            state.sort = action.payload;
        },
        setSelectedContactId(state, action: PayloadAction<string | null>) {
            state.selectedContactId = action.payload;
        },
        clearMutationError(state) {
            state.mutationError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchContacts.pending, (state) => {
                state.listStatus = 'pending';
                state.listError = null;
            })
            .addCase(fetchContacts.fulfilled, (state, action) => {
                state.items = action.payload;
                state.listStatus = 'succeeded';
            })
            .addCase(fetchContacts.rejected, (state, action) => {
                state.listStatus = 'failed';
                state.listError = action.payload ?? 'Failed to fetch contacts';
            })
            .addCase(addContact.pending, (state) => {
                state.createStatus = 'pending';
                state.mutationError = null;
            })
            .addCase(addContact.fulfilled, (state, action) => {
                state.items.push(action.payload);
                state.createStatus = 'succeeded';
            })
            .addCase(addContact.rejected, (state) => {
                state.createStatus = 'failed';
            })
            .addCase(updateContact.fulfilled, (state, action) => {
                const { id, changes } = action.payload;
                const contact = state.items.find((item) => item.id === id);

                if (contact) {
                    Object.assign(contact, changes);
                }
            })
            .addCase(deleteContact.fulfilled, (state, action) => {
                state.items = state.items.filter((item) => item.id !== action.payload);

                if (state.selectedContactId === action.payload) {
                    state.selectedContactId = null;
                }
            })
            .addMatcher(isRowMutationPending, (state, action) => {
                state.pendingIds[action.meta.arg.id] = true;
                state.mutationError = null;
            })
            .addMatcher(isRowMutationSettled, (state, action) => {
                delete state.pendingIds[action.meta.arg.id];
            })
            .addMatcher(isMutationRejected, (state, action) => {
                state.mutationError = action.payload ?? 'Operation failed';
            });
    },
});

export const { setSearchQuery, setSort, setSelectedContactId, clearMutationError } =
    contactsSlice.actions;

export default contactsSlice.reducer;