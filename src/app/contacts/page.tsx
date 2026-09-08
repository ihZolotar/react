'use client';

import React, { useEffect, useState } from 'react';
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
import { ContactDraft } from '@/types';
import ContactsTable from './_components/ContactsTable';
import AddContactForm from './_components/AddContactForm';
import EditContactForm from './_components/EditContactForm';
import styles from './page.module.css';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
    addContact,
    deleteContact,
    fetchContacts,
    toggleContactActive,
    updateContact,
} from '@/store/contactsThunks';
import { clearMutationError, setSearchQuery, setSelectedContactId } from '@/store/contactsSlice';
import { selectListError, selectMutationError } from '@/store/contactsSelectors';

const ContactsPage = () => {
    const dispatch = useAppDispatch();
    const listError = useAppSelector(selectListError);
    const mutationError = useAppSelector(selectMutationError);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        void dispatch(fetchContacts({}));
    }, [dispatch]);

    const dismissSuccess = () => setSuccessMessage(null);
    const dismissError = () => dispatch(clearMutationError());

    const handleAddContact = async (values: ContactDraft) => {
        setSuccessMessage(null);
        await dispatch(addContact(values)).unwrap();
        setSuccessMessage('Contact added successfully');
    };

    const handleUpdateContact = async (id: string, values: ContactDraft) => {
        setSuccessMessage(null);
        await dispatch(updateContact({ id, changes: values })).unwrap();
        setSuccessMessage('Contact updated successfully');
    };

    const handleDeleteContact = async (id: string) => {
        setSuccessMessage(null);

        const result = await dispatch(deleteContact({ id }));

        if (deleteContact.fulfilled.match(result)) {
            setSuccessMessage('Contact deleted successfully');
        }
    };

    const handleToggleActive = async (id: string) => {
        setSuccessMessage(null);

        const result = await dispatch(toggleContactActive({ id }));

        if (toggleContactActive.fulfilled.match(result)) {
            setSuccessMessage(
                result.payload.changes.active
                    ? 'Contact activated successfully'
                    : 'Contact deactivated successfully'
            );
        }
    };

    const handleEditContact = (id: string) => {
        dispatch(setSelectedContactId(id));
        setEditDialogOpen(true);
    };

    const handleSearch = () => {
        dispatch(setSearchQuery(searchInput));
    };

    const handleClearSearch = () => {
        setSearchInput('');
        dispatch(setSearchQuery(''));
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 5 }}>
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

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            placeholder="Search contacts..."
                            value={searchInput}
                            onChange={(event) => setSearchInput(event.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MdSearch />
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchInput && (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="clear search"
                                                onClick={handleClearSearch}
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
                            onClick={handleSearch}
                            disabled={!searchInput.trim()}
                        >
                            Search
                        </Button>
                    </Box>
                </Paper>

                {listError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {listError}
                    </Alert>
                )}

                <ContactsTable
                    onToggleActive={(id) => void handleToggleActive(id)}
                    onDelete={(id) => void handleDeleteContact(id)}
                    onEdit={handleEditContact}
                />

                <AddContactForm
                    open={addDialogOpen}
                    onClose={() => setAddDialogOpen(false)}
                    onSubmit={handleAddContact}
                />

                <EditContactForm
                    open={editDialogOpen}
                    onClose={() => setEditDialogOpen(false)}
                    onSubmit={handleUpdateContact}
                />

                <Snackbar
                    open={mutationError === null && successMessage !== null}
                    autoHideDuration={6000}
                    onClose={dismissSuccess}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={dismissSuccess} severity="success" sx={{ width: '100%' }}>
                        {successMessage}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={mutationError !== null}
                    autoHideDuration={6000}
                    onClose={dismissError}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert onClose={dismissError} severity="error" sx={{ width: '100%' }}>
                        {mutationError}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default ContactsPage;
