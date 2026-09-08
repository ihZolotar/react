'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Switch,
    Typography,
    TablePagination,
    IconButton,
    Tooltip,
    Box,
    CircularProgress,
    LinearProgress,
    TableSortLabel,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { MdEdit, MdDelete } from 'react-icons/md';
import { Contact, SortField } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSort } from '@/store/contactsSlice';
import {
    selectIsContactPending,
    selectIsInitialLoad,
    selectIsListRefreshing,
    selectSearchQuery,
    selectSort,
    selectSortedContacts,
} from '@/store/contactsSelectors';
import styles from './ContactsTable.module.css';

interface ContactsTableProps {
    onToggleActive: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (id: string) => void;
}

interface ContactActionsProps {
    contact: Contact;
    onToggleActive: (id: string) => void;
    onEdit: (id: string) => void;
    onDeleteClick: (contact: Contact) => void;
}

type PageChangeEvent = React.MouseEvent<HTMLButtonElement> | null;

const SORT_FIELDS: SortField[] = ['first_name', 'last_name', 'email', 'phone'];

const toColumnLabel = (field: SortField) =>
    field
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

const DeleteConfirmDialog = ({
    open,
    contact,
    onCancel,
    onConfirm,
}: {
    open: boolean;
    contact: Contact | null;
    onCancel: () => void;
    onConfirm: () => void;
}) => (
    <Dialog open={open} onClose={onCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
            <Typography>
                Are you sure you want to delete {contact?.first_name} {contact?.last_name}?
                This action cannot be undone.
            </Typography>
        </DialogContent>
        <DialogActions>
            <Button onClick={onCancel} color="primary">
                Cancel
            </Button>
            <Button onClick={onConfirm} color="error" variant="contained">
                Delete
            </Button>
        </DialogActions>
    </Dialog>
);

const MobileContactCard = ({
    contact,
    onToggleActive,
    onEdit,
    onDeleteClick,
}: ContactActionsProps) => {
    const isPending = useAppSelector(selectIsContactPending(contact.id));

    return (
        <Card
            sx={{ mb: 2 }}
            className={`${styles.mobileCard} ${contact.active ? styles.active : styles.inactive}`}
        >
            <CardContent>
                <Grid container spacing={1}>
                    <Grid size={12}>
                        <Typography variant="h6">
                            {contact.first_name} {contact.last_name}
                        </Typography>
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="body2" className={styles.tableCellEmail} sx={{
                            color: 'text.secondary'
                        }}>
                            Email: {contact.email}
                        </Typography>
                    </Grid>
                    <Grid size={12}>
                        <Typography variant="body2" className={styles.tableCellPhone} sx={{
                            color: 'text.secondary'
                        }}>
                            Phone: {contact.phone}
                        </Typography>
                    </Grid>
                    <Grid
                        size={12}
                        sx={{
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                        <Chip
                            label={contact.active ? 'Active' : 'Inactive'}
                            color={contact.active ? 'success' : 'default'}
                            size="small"
                            sx={{ mr: 1 }}
                        />
                        <Switch
                            checked={contact.active}
                            onChange={() => onToggleActive(contact.id)}
                            disabled={isPending}
                            size="small"
                        />
                    </Grid>
                    <Grid
                        size={12}
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 1
                        }}>
                        <IconButton
                            color="primary"
                            onClick={() => onEdit(contact.id)}
                            disabled={isPending}
                            size="small"
                            className={styles.actionButton}
                            aria-label="Edit contact"
                        >
                            <MdEdit />
                        </IconButton>
                        <IconButton
                            color="error"
                            onClick={() => onDeleteClick(contact)}
                            disabled={isPending}
                            size="small"
                            className={styles.actionButton}
                            aria-label="Delete contact"
                        >
                            <MdDelete />
                        </IconButton>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const ContactRow = ({ contact, onToggleActive, onEdit, onDeleteClick }: ContactActionsProps) => {
    const isPending = useAppSelector(selectIsContactPending(contact.id));

    return (
        <TableRow className={styles.tableRow}>
            <TableCell>{contact.first_name}</TableCell>
            <TableCell>{contact.last_name}</TableCell>
            <TableCell className={styles.tableCellEmail}>{contact.email}</TableCell>
            <TableCell className={styles.tableCellPhone}>{contact.phone}</TableCell>
            <TableCell>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                    <Switch
                        checked={contact.active}
                        onChange={() => onToggleActive(contact.id)}
                        disabled={isPending}
                        color="primary"
                        slotProps={{
                            input: { 'aria-label': 'toggle contact active status' }
                        }}
                    />
                    <Typography variant="body2" className={styles.activeText}>
                        {contact.active ? 'Active' : 'Inactive'}
                    </Typography>
                </Box>
            </TableCell>
            <TableCell>
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1
                    }}>
                    <Tooltip title="Edit">
                        <span>
                            <IconButton
                                color="primary"
                                onClick={() => onEdit(contact.id)}
                                disabled={isPending}
                                size="small"
                                className={styles.actionButton}
                                aria-label="Edit contact"
                            >
                                <MdEdit />
                            </IconButton>
                        </span>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <span>
                            <IconButton
                                color="error"
                                onClick={() => onDeleteClick(contact)}
                                disabled={isPending}
                                size="small"
                                className={styles.actionButton}
                                aria-label="Delete contact"
                            >
                                <MdDelete />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Box>
            </TableCell>
        </TableRow>
    );
};

const ContactsTable: React.FC<ContactsTableProps> = ({ onToggleActive, onDelete, onEdit }) => {
    const dispatch = useAppDispatch();
    const contacts = useAppSelector(selectSortedContacts);
    const sort = useAppSelector(selectSort);
    const searchQuery = useAppSelector(selectSearchQuery);
    const isInitialLoad = useAppSelector(selectIsInitialLoad);
    const isRefreshing = useAppSelector(selectIsListRefreshing);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const lastPage = Math.max(0, Math.ceil(contacts.length / rowsPerPage) - 1);
    const safePage = Math.min(page, lastPage);

    const handleChangePage = useCallback((event: PageChangeEvent, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleSort = (field: SortField) => {
        const order = sort.field === field && sort.order === 'asc' ? 'desc' : 'asc';

        dispatch(setSort({ field, order }));
    };

    const handleDeleteClick = useCallback((contact: Contact) => {
        setContactToDelete(contact);
        setDeleteDialogOpen(true);
    }, []);

    const handleConfirmDelete = useCallback(() => {
        if (contactToDelete) {
            onDelete(contactToDelete.id);
            setDeleteDialogOpen(false);
            setContactToDelete(null);
        }
    }, [contactToDelete, onDelete]);

    const handleCancelDelete = useCallback(() => {
        setDeleteDialogOpen(false);
        setContactToDelete(null);
    }, []);

    const paginatedContacts = useMemo(
        () => contacts.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage),
        [contacts, safePage, rowsPerPage]
    );

    if (isInitialLoad) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 4
                }}>
                <CircularProgress />
            </Box>
        );
    }

    if (contacts.length === 0) {
        return (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1">
                    {searchQuery.trim()
                        ? 'No contacts match your search.'
                        : 'No contacts found. Add your first contact.'}
                </Typography>
            </Paper>
        );
    }

    return (
        <>
            {isRefreshing && <LinearProgress sx={{ mb: 1 }} />}

            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
                {paginatedContacts.map((contact) => (
                    <MobileContactCard
                        key={contact.id}
                        contact={contact}
                        onToggleActive={onToggleActive}
                        onEdit={onEdit}
                        onDeleteClick={handleDeleteClick}
                    />
                ))}
            </Box>

            <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Table aria-label="contacts table" role="grid">
                    <TableHead>
                        <TableRow>
                            {SORT_FIELDS.map((field) => (
                                <TableCell
                                    key={field}
                                    aria-sort={sort.field === field ? `${sort.order}ending` : 'none'}
                                >
                                    <TableSortLabel
                                        active={sort.field === field}
                                        direction={sort.field === field ? sort.order : 'asc'}
                                        onClick={() => handleSort(field)}
                                    >
                                        {toColumnLabel(field)}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Active</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedContacts.map((contact) => (
                            <ContactRow
                                key={contact.id}
                                contact={contact}
                                onToggleActive={onToggleActive}
                                onEdit={onEdit}
                                onDeleteClick={handleDeleteClick}
                            />
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={contacts.length}
                rowsPerPage={rowsPerPage}
                page={safePage}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage={
                    <>
                        <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Rows:</Box>
                        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Rows per page:</Box>
                    </>
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                contact={contactToDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </>
    );
};

export default React.memo(ContactsTable);
