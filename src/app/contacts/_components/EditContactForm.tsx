'use client';

import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import { ContactDraft } from '@/types';
import { createContactValidationSchema } from '@/validation/contactSchema';
import { useAppSelector } from '@/store/hooks';
import {
    selectContactById,
    selectContacts,
    selectIsContactPending,
    selectSelectedContactId,
} from '@/store/contactsSelectors';
import ContactForm from './ContactForm';

interface EditContactFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (id: string, values: ContactDraft) => Promise<void>;
}

const EditContactForm: React.FC<EditContactFormProps> = ({ open, onClose, onSubmit }) => {
    const contactId = useAppSelector(selectSelectedContactId);
    const contact = useAppSelector(selectContactById(contactId));
    const contacts = useAppSelector(selectContacts);
    const isSaving = useAppSelector(selectIsContactPending(contactId));

    const formik = useFormik<ContactDraft>({
        initialValues: {
            first_name: contact?.first_name ?? '',
            last_name: contact?.last_name ?? '',
            email: contact?.email ?? '',
            phone: contact?.phone ?? '',
            active: contact?.active ?? true,
        },
        validationSchema: createContactValidationSchema(contacts, contactId ?? undefined),
        onSubmit: async (values, { setSubmitting }) => {
            if (contactId === null) return;

            try {
                await onSubmit(contactId, values);
                onClose();
            } catch (error) {
                console.error('Error updating contact:', error);
            } finally {
                setSubmitting(false);
            }
        },
        enableReinitialize: true,
    });

    if (contact === null) return null;

    const handleClose = () => {
        formik.resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>Edit Contact</DialogTitle>
                <DialogContent>
                    <ContactForm formik={formik} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit" disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={isSaving}
                        startIcon={isSaving ? <CircularProgress size={20} /> : null}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditContactForm;
