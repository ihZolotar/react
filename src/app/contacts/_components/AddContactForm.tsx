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
import { createContactValidationSchema, newContactInitialValues } from '@/validation/contactSchema';
import { useAppSelector } from '@/store/hooks';
import { selectContacts, selectCreateStatus } from '@/store/contactsSelectors';
import ContactForm from './ContactForm';

interface AddContactFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: ContactDraft) => Promise<void>;
}

const AddContactForm: React.FC<AddContactFormProps> = ({ open, onClose, onSubmit }) => {
    const contacts = useAppSelector(selectContacts);
    const isSaving = useAppSelector(selectCreateStatus) === 'pending';

    const formik = useFormik<ContactDraft>({
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
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default AddContactForm;
