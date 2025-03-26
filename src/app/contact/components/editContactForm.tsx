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
import { Contact } from '@/types';
import { createContactValidationSchema } from '@/validation/contactSchema';
import ContactForm, { ContactFormValues } from './contactForm';

interface EditContactFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (id: string, values: Omit<Contact, 'id'>) => Promise<void>;
    contact: Contact | null;
    contacts: Contact[];
    isSubmitting?: boolean;
}

const EditContactForm: React.FC<EditContactFormProps> = ({
                                                             open,
                                                             onClose,
                                                             onSubmit,
                                                             contact,
                                                             contacts,
                                                             isSubmitting = false,
                                                         }) => {
    const formik = useFormik<ContactFormValues>({
        initialValues: {
            first_name: contact?.first_name || '',
            last_name: contact?.last_name || '',
            email: contact?.email || '',
            phone: contact?.phone || '',
            active: contact?.active || true,
        },
        validationSchema: createContactValidationSchema(contacts, contact?.id),
        onSubmit: async (values, { setSubmitting }) => {
            if (!contact) return;

            try {
                await onSubmit(contact.id, values);
                onClose();
            } catch (error) {
                console.error('Error updating contact:', error);
            } finally {
                setSubmitting(false);
            }
        },
        enableReinitialize: true,
    });

    if (!contact) return null;

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
                    <Button onClick={handleClose} color="inherit" disabled={formik.isSubmitting || isSubmitting}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={formik.isSubmitting || isSubmitting}
                        startIcon={formik.isSubmitting || isSubmitting ? <CircularProgress size={20} /> : null}
                    >
                        {formik.isSubmitting || isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EditContactForm;
