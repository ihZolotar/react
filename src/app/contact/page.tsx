'use client';

import React, {useEffect, useState} from 'react';
import {Box, Button, Container, Typography} from '@mui/material';
import {addContact, getContacts, deleteContact, updateContact} from '@/services/contactsService';
import {Contact} from '@/types';
import ContactsTable from './components/contactsTable';
import AddContactForm from './components/addContactForm';
import styles from './page.module.css';

const ContactsPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchContacts = async () => {
            const data = await getContacts();
            setContacts(data);
        };
        fetchContacts();
    }, []);

    const handleAddContact = async (values: Omit<Contact, 'id'>) => {
        const addedContact = await addContact(values);
        setContacts((prev) => [...prev, addedContact]);
    };

    const handleDeleteContact = async (id: string) => {
        await deleteContact(id);
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
    };

    const handleToggleActive = async (id: string, active: boolean) => {
        await updateContact(id, {active: !active});
        setContacts((prev) =>
            prev.map((contact) => (contact.id === id ? {...contact, active: !active} : contact))
        );
    };

    return (
        <Container maxWidth="lg">
            <Box py={5}>
                <div className={styles.headerContent}>
                    <Typography variant="h5">
                        Contacts
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpen(true)}
                        className={styles.addButton}
                    >
                        Add Contact
                    </Button>
                </div>

                <ContactsTable
                    contacts={contacts}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteContact}
                />
                <AddContactForm
                    open={open}
                    onClose={() => setOpen(false)}
                    onSubmit={handleAddContact}
                    contacts={contacts}
                />
            </Box>
        </Container>
    );
};

export default ContactsPage;
