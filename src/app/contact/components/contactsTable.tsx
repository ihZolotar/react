'use client';

import React, {useState, useCallback, useMemo} from 'react';
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
    TableSortLabel,
    useMediaQuery,
    useTheme,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {MdEdit, MdDelete} from 'react-icons/md';
import {Contact} from '@/types';
import styles from './contactsTable.module.css';

type SortOrder = 'asc' | 'desc';
type SortField = 'first_name' | 'last_name' | 'email' | 'phone';

interface ContactsTableProps {
    contacts: Contact[];
    onToggleActive: (id: string, active: boolean) => void;
    onDelete: (id: string) => void;
    onEdit: (contact: Contact) => void;
    loading?: boolean;
}

type PageChangeEvent = React.MouseEvent<HTMLButtonElement> | null;

const DeleteConfirmDialog = ({
                                 open,
                                 contact,
                                 onCancel,
                                 onConfirm
                             }: {
    open: boolean;
    contact: Contact | null;
    onCancel: () => void;
    onConfirm: () => void;
}) => (
    <Dialog
        open={open}
        onClose={onCancel}
    >
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

const MobileContactsList = ({
                                contacts,
                                onToggleActive,
                                onEdit,
                                onDeleteClick
                            }: {
    contacts: Contact[];
    onToggleActive: (id: string, active: boolean) => void;
    onEdit: (contact: Contact) => void;
    onDeleteClick: (contact: Contact) => void;
}) => (
    <>
        {contacts.map((contact) => (
            <Card
                key={contact.id}
                sx={{mb: 2}}
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
                            <Typography variant="body2" color="text.secondary" className={styles.tableCellEmail}>
                                Email: {contact.email}
                            </Typography>
                        </Grid>
                        <Grid size={12}>
                            <Typography variant="body2" color="text.secondary" className={styles.tableCellPhone}>
                                Phone: {contact.phone}
                            </Typography>
                        </Grid>
                        <Grid size={12} display="flex" alignItems="center">
                            <Chip
                                label={contact.active ? 'Active' : 'Inactive'}
                                color={contact.active ? 'success' : 'default'}
                                size="small"
                                sx={{mr: 1}}
                            />
                            <Switch
                                checked={contact.active}
                                onChange={() => onToggleActive(contact.id, contact.active)}
                                size="small"
                            />
                        </Grid>
                        <Grid size={12} display="flex" justifyContent="flex-end" gap={1}>
                            <IconButton
                                color="primary"
                                onClick={() => onEdit(contact)}
                                size="small"
                                className={styles.actionButton}
                                aria-label="Edit contact"
                            >
                                <MdEdit/>
                            </IconButton>
                            <IconButton
                                color="error"
                                onClick={() => onDeleteClick(contact)}
                                size="small"
                                className={styles.actionButton}
                                aria-label="Delete contact"
                            >
                                <MdDelete/>
                            </IconButton>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        ))}
    </>
);

const ContactsTable: React.FC<ContactsTableProps> = ({
                                                         contacts,
                                                         onToggleActive,
                                                         onDelete,
                                                         onEdit,
                                                         loading = false,
                                                     }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortField, setSortField] = useState<SortField>('last_name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleChangePage = useCallback((event: PageChangeEvent, newPage: number) => {
        setPage(newPage);
    }, []);

    const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    }, []);

    const handleSort = useCallback((field: SortField) => {
        setSortOrder((prevOrder) => {
            if (sortField !== field) return 'asc';
            return prevOrder === 'asc' ? 'desc' : 'asc';
        });
        setSortField(field);
    }, [sortField]);

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

    const sortedContacts = useMemo(() => {
        return [...contacts].sort((a, b) => {
            const valueA = a[sortField]?.toLowerCase() ?? '';
            const valueB = b[sortField]?.toLowerCase() ?? '';

            if (sortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
    }, [contacts, sortField, sortOrder]);

    const paginatedContacts = useMemo(() => {
        return sortedContacts.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage
        );
    }, [sortedContacts, page, rowsPerPage]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" p={4}>
                <CircularProgress/>
            </Box>
        );
    }

    if (contacts.length === 0) {
        return (
            <Paper sx={{p: 3, textAlign: 'center'}}>
                <Typography variant="body1">No contacts found. Add your first contact.</Typography>
            </Paper>
        );
    }

    const paginationComponent = (
        <TablePagination
            component="div"
            count={contacts.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage={isMobile ? "Rows:" : "Rows per page:"}
        />
    );

    if (isMobile) {
        return (
            <>
                <MobileContactsList
                    contacts={paginatedContacts}
                    onToggleActive={onToggleActive}
                    onEdit={onEdit}
                    onDeleteClick={handleDeleteClick}
                />

                {paginationComponent}

                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    contact={contactToDelete}
                    onCancel={handleCancelDelete}
                    onConfirm={handleConfirmDelete}
                />
            </>
        );
    }

    return (
        <>
            <TableContainer component={Paper}>
                <Table aria-label="contacts table" role="grid">
                    <TableHead>
                        <TableRow>
                            {['first_name', 'last_name', 'email', 'phone'].map((field) => (
                                <TableCell key={field}>
                                    <TableSortLabel
                                        active={sortField === field}
                                        direction={sortField === field ? sortOrder : 'asc'}
                                        onClick={() => handleSort(field as SortField)}
                                        aria-sort={sortField === field ? `${sortOrder}ending` : 'none'}
                                    >
                                        {field.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </TableSortLabel>
                                </TableCell>
                            ))}
                            <TableCell>Active</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedContacts.map((contact) => (
                            <TableRow key={contact.id} className={styles.tableRow}>
                                <TableCell>{contact.first_name}</TableCell>
                                <TableCell>{contact.last_name}</TableCell>
                                <TableCell className={styles.tableCellEmail}>{contact.email}</TableCell>
                                <TableCell className={styles.tableCellPhone}>{contact.phone}</TableCell>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Switch
                                            checked={contact.active}
                                            onChange={() => onToggleActive(contact.id, contact.active)}
                                            color="primary"
                                            inputProps={{'aria-label': 'toggle contact active status'}}
                                        />
                                        <Typography variant="body2" className={styles.activeText}>
                                            {contact.active ? 'Active' : 'Inactive'}
                                        </Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box display="flex" gap={1}>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                color="primary"
                                                onClick={() => onEdit(contact)}
                                                size="small"
                                                className={styles.actionButton}
                                                aria-label="Edit contact"
                                            >
                                                <MdEdit/>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                color="error"
                                                onClick={() => handleDeleteClick(contact)}
                                                size="small"
                                                className={styles.actionButton}
                                                aria-label="Delete contact"
                                            >
                                                <MdDelete/>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {paginationComponent}

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
