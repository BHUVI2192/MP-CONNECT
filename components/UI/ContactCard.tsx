import React from 'react';
import { Phone, MessageCircle, Mail, Edit2, Trash2, Star } from 'lucide-react';
import { Contact } from '../../types';
import { Button } from './Button';

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (contact: Contact) => void;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, onEdit, onDelete }) => {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      {contact.isVip && (
        <div className="absolute top-4 right-4 text-amber-500" title="VIP Contact">
          <Star className="w-5 h-5 fill-current" />
        </div>
      )}

      <div className="flex items-start gap-4 mb-6">
        {contact.photoUrl ? (
          <img
            src={contact.photoUrl}
            alt={contact.name}
            className="w-[60px] h-[60px] rounded-full object-cover border-2 border-slate-100"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-[60px] h-[60px] rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-xl border-2 border-indigo-100">
            {initials}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h4 className="font-black text-slate-900 tracking-tight text-lg truncate">{contact.name}</h4>
          <p className="text-sm font-bold text-slate-500 truncate">{contact.designation}</p>
          <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1 truncate">
            {contact.organization}
          </p>
        </div>
      </div>

      <div className="space-y-1 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
          {contact.taluk}, {contact.zilla}
        </p>
        <a
          href={`tel:${contact.mobile}`}
          className="text-sm font-black text-indigo-600 hover:underline flex items-center gap-1.5"
        >
          <Phone className="w-3 h-3" />
          {contact.mobile}
        </a>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-50">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`tel:${contact.mobile}`);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            title="Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://wa.me/${contact.mobile.replace(/\D/g, '')}`);
            }}
            className="p-2 hover:bg-green-50 rounded-xl text-green-600 transition-colors"
            title="WhatsApp"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(`mailto:${contact.email}`);
            }}
            className="p-2 hover:bg-blue-50 rounded-xl text-blue-600 transition-colors"
            title="Email"
          >
            <Mail className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(contact);
            }}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(contact);
            }}
            className="p-2 hover:bg-red-50 rounded-xl text-slate-400 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
