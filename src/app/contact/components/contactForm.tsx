'use client';

import React from 'react';
import { TextField, Box } from '@mui/material';
import { FormikProps } from 'formik';
import { Contact } from '@/types';
import styles from './addContactForm.module.css';

export type ContactFormValues = Omit<Contact, 'id'>;

interface ContactFormProps {
    formik: FormikProps<ContactFormValues>;
}

const ContactForm: React.FC<ContactFormProps> = ({ formik }) => {
    const { values, errors, touched, handleChange, handleBlur } = formik;

    return (
        <Box className={styles.dialogContent}>
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
        </Box>
    );
};

export default ContactForm;
