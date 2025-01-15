'use client';

import React from 'react';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
} from '@mui/material';
import {Formik, Form} from 'formik';
import * as Yup from 'yup';
import {Contact} from '@/types';
import styles from './addContactForm.module.css';

interface AddContactFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: Omit<Contact, 'id'>) => void;
    contacts: Contact[];
}

const AddContactForm: React.FC<AddContactFormProps> = ({open, onClose, onSubmit, contacts}) => {
    const emailExists = (email: string) => contacts.some((contact) => contact.email === email);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Add Contact</DialogTitle>
            <Formik
                initialValues={{
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone: '',
                    active: true,
                }}
                validationSchema={Yup.object({
                    first_name: Yup.string().required('First Name is required'),
                    last_name: Yup.string().required('Last Name is required'),
                    email: Yup.string()
                        .email('Invalid email')
                        .required('Email is required')
                        .test('unique', 'Email already exists', (value) => !emailExists(value || '')),
                    phone: Yup.string()
                        .matches(/^\+\d{10,15}$/, 'Phone must be in international format, e.g. +1234567890')
                        .required('Phone is required'),
                })}
                onSubmit={(values, { resetForm }) => {
                    onSubmit(values);
                    resetForm();
                    onClose();
                }}
            >
                {({values, errors, touched, handleChange, handleBlur, handleSubmit}) => (
                    <Form onSubmit={handleSubmit}>
                        <DialogContent className={styles.dialogContent}>
                            <TextField
                                fullWidth
                                margin="normal"
                                id="first_name"
                                name="first_name"
                                label="First Name"
                                value={values.first_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.first_name && Boolean(errors.first_name)}
                                helperText={touched.first_name && errors.first_name}
                                className={styles.textField}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                id="last_name"
                                name="last_name"
                                label="Last Name"
                                value={values.last_name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.last_name && Boolean(errors.last_name)}
                                helperText={touched.last_name && errors.last_name}
                                className={styles.textField}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                id="email"
                                name="email"
                                label="Email"
                                type="email"
                                value={values.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.email && Boolean(errors.email)}
                                helperText={touched.email && errors.email}
                                className={styles.textField}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                id="phone"
                                name="phone"
                                label="Phone"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.phone && Boolean(errors.phone)}
                                helperText={touched.phone && errors.phone}
                                className={styles.textField}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={onClose} color="inherit">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" color="primary">
                                Save
                            </Button>
                        </DialogActions>
                    </Form>
                )}
            </Formik>
        </Dialog>
    );
};

export default AddContactForm;
