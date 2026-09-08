import { MdHome, MdContacts } from 'react-icons/md';

export interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
    { name: 'Home', path: '/', icon: <MdHome /> },
    { name: 'Contacts', path: '/contacts', icon: <MdContacts /> },
];
