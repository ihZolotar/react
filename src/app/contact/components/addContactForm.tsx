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
import { createContactValidationSchema, newContactInitialValues } from '@/validation/contactSchema';
import ContactForm, { ContactFormValues } from './contactForm';

interface AddContactFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: Omit<Contact, 'id'>) => Promise<void>;
    contacts: Contact[];
    isSubmitting?: boolean;
}

const AddContactForm: React.FC<AddContactFormProps> = ({
                                                           open,
                                                           onClose,
                                                           onSubmit,
                                                           contacts,
                                                           isSubmitting = false,
                                                       }) => {
    const formik = useFormik<ContactFormValues>({
        initialValues: newContactInitialValues,
        validationSchema: createContactValidationSchema(contacts),
        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                await onSubmit(values);
                resetForm();
                onClose();
            } catch (error) {
                console.error('Error submitting form:', error);
            } finally {
                setSubmitting(false);
            }
        },
        enableReinitialize: true,
    });

    const handleClose = () => {
        formik.resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <form onSubmit={formik.handleSubmit}>
                <DialogTitle>Add Contact</DialogTitle>
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
                        {formik.isSubmitting || isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddContactForm;
