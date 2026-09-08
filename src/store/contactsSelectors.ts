import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export const selectContacts = (state: RootState) => state.contacts.items;
export const selectSearchQuery = (state: RootState) => state.contacts.searchQuery;
export const selectSort = (state: RootState) => state.contacts.sort;
export const selectListStatus = (state: RootState) => state.contacts.listStatus;
export const selectListError = (state: RootState) => state.contacts.listError;
export const selectCreateStatus = (state: RootState) => state.contacts.createStatus;
export const selectMutationError = (state: RootState) => state.contacts.mutationError;
export const selectSelectedContactId = (state: RootState) => state.contacts.selectedContactId;

export const selectIsInitialLoad = (state: RootState) =>
    (state.contacts.listStatus === 'idle' || state.contacts.listStatus === 'pending') &&
    state.contacts.items.length === 0;

export const selectIsListUnavailable = (state: RootState) =>
    state.contacts.listStatus === 'failed' && state.contacts.items.length === 0;

export const selectIsListRefreshing = (state: RootState) =>
    state.contacts.listStatus === 'pending' && state.contacts.items.length > 0;

export const selectFilteredContacts = createSelector(
    [selectContacts, selectSearchQuery],
    (contacts, searchQuery) => {
        const normalizedQuery = searchQuery.toLowerCase().trim();

        if (!normalizedQuery) {
            return contacts;
        }

        return contacts.filter(
            (contact) =>
                contact.first_name.toLowerCase().includes(normalizedQuery) ||
                contact.last_name.toLowerCase().includes(normalizedQuery) ||
                contact.email.toLowerCase().includes(normalizedQuery) ||
                contact.phone.includes(normalizedQuery)
        );
    }
);

export const selectSortedContacts = createSelector(
    [selectFilteredContacts, selectSort],
    (contacts, sort) =>
        [...contacts].sort((a, b) => {
            const comparison = (a[sort.field] ?? '').localeCompare(b[sort.field] ?? '', undefined, {
                sensitivity: 'base',
            });

            return sort.order === 'asc' ? comparison : -comparison;
        })
);

export const selectContactById = (id: string | null) => (state: RootState) =>
    id === null ? null : (state.contacts.items.find((contact) => contact.id === id) ?? null);

export const selectIsContactPending = (id: string | null) => (state: RootState) =>
    id !== null && state.contacts.pendingIds[id];
