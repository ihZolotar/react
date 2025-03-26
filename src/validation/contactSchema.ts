import * as Yup from 'yup';
import { Contact } from '@/types';

const createEmailValidator = (contacts: Contact[], currentId?: string) => {
    return (email: string) =>
        !contacts.some(
            (contact) => contact.email === email && contact.id !== currentId
        );
};

export const createContactValidationSchema = (contacts: Contact[], currentId?: string) => {
    return Yup.object({
        first_name: Yup.string().required('First Name is required'),
        last_name: Yup.string().required('Last Name is required'),
        email: Yup.string()
            .email('Invalid email')
            .required('Email is required')
            .test(
                'unique',
                'Email already exists',
                (value) => !value || createEmailValidator(contacts, currentId)(value)
            ),
        phone: Yup.string()
            .matches(
                /^\+\d{10,15}$/,
                'Phone must be in international format, e.g. +1234567890'
            )
            .required('Phone is required'),
    });
};

export const newContactInitialValues = {
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    active: true,
};
