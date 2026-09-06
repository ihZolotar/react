'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Box,
    Button,
    Container,
    Typography,
    Alert,
    Snackbar,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
    Divider,
} from '@mui/material';
import { MdSearch, MdAdd, MdClose } from 'react-icons/md';
import { Contact } from '@/types';
import ContactsTable from './components/contactsTable';
import AddContactForm from './components/addContactForm';
import EditContactForm from './components/editContactForm';
import styles from './page.module.css';
import { useContacts } from '@/context/contactsContext';
import { toErrorMessage } from '@/utils/toErrorMessage';

type NotificationType = {
    open: boolean;
    message: string;
    type: 'success' | 'error';
};

const initialNotification: NotificationType = {
    open: false,
    message: '',
    type: 'success',
};

const ContactsPage = () => {
    const {
        contacts,
        loading,
        error,
        addContactHandler,
        updateContactHandler,
        deleteContactHandler,
        toggleActiveHandler,
        searchContacts,
        fetchContacts,
    } = useContacts();

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [currentContact, setCurrentContact] = useState<Contact | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState<NotificationType>(initialNotification);

    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        setNotification({
            open: true,
            message,
            type,
        });
    }, []);

    const handleCloseNotification = useCallback(() => {
        setNotification(prev => ({
            ...prev,
            open: false,
        }));
    }, []);

    const handleAddContact = useCallback(async (values: Omit<Contact, 'id'>) => {
        try {
            setSubmitting(true);
            await addContactHandler(values);
            showNotification('Contact added successfully', 'success');
            setAddDialogOpen(false);
        } catch (error) {
            showNotification(toErrorMessage(error, 'Failed to add contact'), 'error');
            throw error;
        } finally {
            setSubmitting(false);
        }
    }, [addContactHandler, showNotification]);

    const handleUpdateContact = useCallback(async (id: string, values: Partial<Contact>) => {
        try {
            setSubmitting(true);
            await updateContactHandler(id, values);
            showNotification('Contact updated successfully', 'success');
            setEditDialogOpen(false);
        } catch (error) {
            showNotification(toErrorMessage(error, 'Failed to update contact'), 'error');
            throw error;
        } finally {
            setSubmitting(false);
        }
    }, [updateContactHandler, showNotification]);

    const handleDeleteContact = useCallback(async (id: string) => {
        try {
            await deleteContactHandler(id);
            showNotification('Contact deleted successfully', 'success');
        } catch (error) {
            showNotification(toErrorMessage(error, 'Failed to delete contact'), 'error');
        }
    }, [deleteContactHandler, showNotification]);

    const handleToggleActive = useCallback(async (id: string, active: boolean) => {
        try {
            await toggleActiveHandler(id, active);
            showNotification(
                `Contact ${active ? 'deactivated' : 'activated'} successfully`,
                'success'
            );
        } catch (error) {
            showNotification(toErrorMessage(error, 'Failed to update contact status'), 'error');
        }
    }, [toggleActiveHandler, showNotification]);

    const handleEditContact = useCallback((contact: Contact) => {
        setCurrentContact(contact);
        setEditDialogOpen(true);
    }, []);

    const handleSearch = useCallback(async () => {
        if (!searchQuery.trim()) return;
        await searchContacts(searchQuery);
    }, [searchQuery, searchContacts]);

    const handleClearSearch = useCallback(async () => {
        setSearchQuery('');
        await fetchContacts();
    }, [fetchContacts]);

    const handleSearchKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            void handleSearch();
        }
    }, [handleSearch]);

    const renderDialogs = useMemo(() => (
        <>
            <AddContactForm
                open={addDialogOpen}
                onClose={() => setAddDialogOpen(false)}
                onSubmit={handleAddContact}
                contacts={contacts}
                isSubmitting={submitting}
            />

            <EditContactForm
                open={editDialogOpen}
                onClose={() => setEditDialogOpen(false)}
                onSubmit={handleUpdateContact}
                contact={currentContact}
                contacts={contacts}
                isSubmitting={submitting}
            />
        </>
    ), [addDialogOpen, editDialogOpen, handleAddContact, handleUpdateContact, contacts, currentContact, submitting]);

    const searchComponent = useMemo(() => (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <MdSearch />
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery && (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="clear search"
                                    onClick={() => void handleClearSearch()}
                                    edge="end"
                                    size="small"
                                >
                                    <MdClose />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }
                }}
            />
            <Button
                variant="outlined"
                sx={{ ml: 1 }}
                onClick={() => void handleSearch()}
                disabled={!searchQuery.trim()}
            >
                Search
            </Button>
        </Box>
    ), [searchQuery, handleSearchKeyDown, handleClearSearch, handleSearch]);

    return (
        <Container maxWidth="lg">
            <Box sx={{
                py: 5
            }}>
                <Paper elevation={0} sx={{ p: 2, mb: 3 }}>
                    <div className={styles.headerContent}>
                        <Typography variant="h5" component="h1">Contacts</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setAddDialogOpen(true)}
                            className={styles.addButton}
                            startIcon={<MdAdd />}
                        >
                            Add Contact
                        </Button>
                    </div>

                    <Divider sx={{ my: 2 }} />

                    {searchComponent}
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <ContactsTable
                    contacts={contacts}
                    onToggleActive={(id, active) => void handleToggleActive(id, active)}
                    onDelete={(id) => void handleDeleteContact(id)}
                    onEdit={handleEditContact}
                    loading={loading}
                    isFiltered={Boolean(searchQuery.trim())}
                />

                {renderDialogs}

                <Snackbar
                    open={notification.open}
                    autoHideDuration={6000}
                    onClose={handleCloseNotification}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseNotification}
                        severity={notification.type}
                        sx={{ width: '100%' }}
                    >
                        {notification.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default ContactsPage;
