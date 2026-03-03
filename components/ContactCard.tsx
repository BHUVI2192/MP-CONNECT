import React from 'react';
import { Phone, MessageCircle, Mail, Edit2, Trash2, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Contact } from '../types';

interface ContactCardProps {
    contact: Contact;
    onEdit: (contact: Contact) => void;
    onDelete: (id: string) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div
            onClick={() => navigate(`/staff/contacts/${contact.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow relative overflow-hidden group cursor-pointer"
        >
            {contact.isVip && (
                <div className="absolute top-2 right-2 text-yellow-500">
                    <Star size={20} fill="currentColor" />
                </div>
            )}

            <div className="flex flex-col items-center text-center">
                {contact.photoUrl ? (
                    <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-16 h-16 rounded-full object-cover mb-3 border-2 border-primary/10"
                    />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 border-2 border-primary/20">
                        <span className="text-xl font-bold text-primary">{getInitials(contact.name)}</span>
                    </div>
                )}

                <h3 className="text-lg font-bold text-gray-900 leading-tight">{contact.name}</h3>
                <p className="text-sm font-medium text-gray-600 mb-1">{contact.designation}</p>
                <p className="text-xs text-gray-400 mb-2">{contact.organization}</p>

                <div className="text-[11px] text-gray-500 mb-4 bg-gray-50 px-2 py-1 rounded-full uppercase tracking-wider">
                    {contact.location.taluk}, {contact.location.zilla}
                </div>

                <a
                    href={`tel:${contact.mobile}`}
                    className="text-primary font-semibold text-sm hover:underline mb-4 block"
                >
                    {contact.mobile}
                </a>

                <div className="w-full h-[1px] bg-gray-100 mb-4"></div>

                <div className="flex items-center justify-between w-full">
                    <div className="flex gap-3">
                        <button
                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Call"
                            onClick={() => window.open(`tel:${contact.mobile}`)}
                        >
                            <Phone size={18} />
                        </button>
                        <button
                            className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                            title="WhatsApp"
                            onClick={() => window.open(`https://wa.me/${contact.mobile.replace(/\D/g, '')}`)}
                        >
                            <MessageCircle size={18} />
                        </button>
                        <button
                            className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                            title="Email"
                            onClick={() => contact.email && window.open(`mailto:${contact.email}`)}
                            disabled={!contact.email}
                        >
                            <Mail size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors"
                            title="Edit"
                            onClick={() => onEdit(contact)}
                        >
                            <Edit2 size={16} />
                        </button>
                        <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                            onClick={() => onDelete(contact.id)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactCard;
