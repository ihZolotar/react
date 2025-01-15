'use client';

import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Button,
    Switch,
    Typography,
    TablePagination,
} from '@mui/material';
import { Contact } from '@/types';
import styles from './contactsTable.module.css'

interface ContactsTableProps {
    contacts: Contact[];
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
}

const ContactsTable: React.FC<ContactsTableProps> = ({ contacts, onToggleActive, onDelete }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>First Name</TableCell>
                            <TableCell>Last Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {contacts
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((contact) => (
                                <TableRow key={contact.id} className={styles.tableRow}>
                                    <TableCell>{contact.first_name}</TableCell>
                                    <TableCell>{contact.last_name}</TableCell>
                                    <TableCell>{contact.email}</TableCell>
                                    <TableCell>{contact.phone}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={contact.active}
                                            onChange={() => onToggleActive(contact.id, contact.active)}
                                            color="primary"
                                        />
                                        <Typography variant="body2" className={styles.activeText}>
                                            {contact.active ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            className={styles.deleteButton}
                                            onClick={() => onDelete(contact.id)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                component="div"
                count={contacts.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Rows per page:"
            />
        </>
    );
};

export default ContactsTable;
