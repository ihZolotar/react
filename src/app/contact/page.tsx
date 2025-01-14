'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Paper,
    Switch,
} from '@mui/material';
import { addContact, getContacts, deleteContact, updateContact } from '@/services/contactsService';
import { Contact } from '@/types';

const ContactsPage = () => {
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Завантаження контактів із Firestore
    useEffect(() => {
        const fetchContacts = async () => {
            const data = await getContacts();
            console.log(data);
            setContacts(data);
        };
        fetchContacts();
    }, []);

    // Додавання нового контакту
    const handleAddContact = async () => {
        const newContact: Omit<Contact, 'id'> = {
            first_name: 'New',
            last_name: 'Contact',
            email: 'new@example.com',
            phone: '+123456789',
            active: true,
        };
        const addedContact = await addContact(newContact);
        setContacts((prev) => [...prev, addedContact]);
    };

    // Видалення контакту
    const handleDeleteContact = async (id: string) => {
        await deleteContact(id);
        setContacts((prev) => prev.filter((contact) => contact.id !== id));
    };

    // Оновлення статусу активності
    const handleToggleActive = async (id: string, active: boolean) => {
        await updateContact(id, { active: !active });
        setContacts((prev) =>
            prev.map((contact) => (contact.id === id ? { ...contact, active: !active } : contact))
        );
    };

    return (
        <Container maxWidth="lg">
            <Box py={5}>
                <Typography variant="h4" gutterBottom>
                    Contacts
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddContact}
                    style={{ marginBottom: '16px' }}
                >
                    Add Contact
                </Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {/*<TableCell>ID</TableCell>*/}
                                <TableCell>First Name</TableCell>
                                <TableCell>Last Name</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Phone</TableCell>
                                <TableCell>Active</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {contacts.map((contact) => (
                                <TableRow key={contact.id}>
                                    {/*<TableCell>{contact.id}</TableCell>*/}
                                    <TableCell>{contact.first_name}</TableCell>
                                    <TableCell>{contact.last_name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.phone}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={contact.active}
                                            onChange={() => handleToggleActive(contact.id, contact.active)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            size="small"
                                            onClick={() => handleDeleteContact(contact.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default ContactsPage;
