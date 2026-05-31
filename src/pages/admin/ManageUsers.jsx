import React, { useEffect, useState } from 'react';
import { Users, Search, Phone, Calendar, Mail, User } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { formatDate } from '../../utils/formatDate';

function CustomerRow({ user }) {
  const initials = (user.full_name || 'C')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="user-row">
      <div className="user-avatar customer-avatar">{initials}</div>
      <div className="user-info">
        <span className="user-name">{user.full_name || 'Unnamed Customer'}</span>
        {user.email && (
          <span className="user-detail">
            <Mail size={11} /> {user.email}
          </span>
        )}
      </div>
      <div className="user-meta">
        {user.phone_number && (
          <span className="user-detail">
            <Phone size={11} /> {user.phone_number}
          </span>
        )}
      </div>
      <div className="user-date">
        <span className="user-detail">
          <Calendar size={11} /> Joined {formatDate(user.created_at)}
        </span>
      </div>
      <div className="user-badge customer-badge">
        <User size={11} /> Customer
      </div>
    </div>
  );
}

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'customer')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error('Error fetching customers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone_number?.includes(search)
  );

  return (
    <div className="user-page">
      <div className="user-page-header">
        <div>
          <h1 className="user-page-title">Customer Accounts</h1>
          <p className="user-page-sub">
            {loading ? 'Loading…' : `${users.length} registered customers`}
          </p>
        </div>
        <div className="user-search-wrap">
          <Search size={15} className="user-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone…"
            className="user-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="customer-search"
          />
        </div>
      </div>

      {loading ? (
        <div className="user-skeleton-list">
          {[1,2,3,4].map(n => <div key={n} className="user-skeleton" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="user-list">
          {filtered.map(user => <CustomerRow key={user.id} user={user} />)}
        </div>
      ) : (
        <div className="user-empty">
          <Users size={36} />
          <p>{search ? 'No customers match your search.' : 'No registered customers yet.'}</p>
        </div>
      )}

      <style>{`
        .user-page { font-family: 'Inter', sans-serif; }
        .user-page-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          flex-wrap: wrap; gap: 16px; margin-bottom: 24px;
        }
        .user-page-title {
          font-size: 1.6rem; font-weight: 800; color: #111827; margin: 0 0 4px;
          font-family: 'Playfair Display','Georgia',serif;
        }
        .user-page-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }
        .user-search-wrap { position: relative; }
        .user-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; pointer-events: none; }
        .user-search {
          padding: 9px 14px 9px 36px; border: 1.5px solid #e5e7eb; border-radius: 10px;
          font-size: 0.875rem; outline: none; width: 260px; background: #fafafa; transition: border-color 0.2s;
        }
        .user-search:focus { border-color: #e11d48; background: #fff; }
        .user-list { display: flex; flex-direction: column; gap: 10px; }
        .user-skeleton-list { display: flex; flex-direction: column; gap: 10px; }
        .user-skeleton {
          height: 72px; border-radius: 14px;
          background: linear-gradient(90deg,#f3f4f6,#e9ecef,#f3f4f6);
          background-size: 600px; animation: shimmer 1.4s infinite linear;
        }
        @keyframes shimmer { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
        .user-row {
          display: flex; align-items: center; gap: 14px;
          background: #fff; border: 1px solid #f1e8ec; border-radius: 14px;
          padding: 14px 18px; transition: box-shadow 0.2s;
        }
        .user-row:hover { box-shadow: 0 4px 18px rgba(225,29,72,0.07); }
        .user-avatar {
          width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, #e11d48, #f43f5e);
          color: #fff; font-weight: 700; font-size: 0.9rem;
          display: flex; align-items: center; justify-content: center;
        }
        .customer-avatar { background: linear-gradient(135deg, #7c3aed, #a855f7); }
        .user-info { flex: 1; min-width: 0; }
        .user-name { display: block; font-weight: 600; font-size: 0.9rem; color: #111827; }
        .user-detail {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.75rem; color: #9ca3af; margin-top: 2px;
        }
        .user-meta { min-width: 140px; }
        .user-date { min-width: 130px; }
        .user-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 0.72rem; font-weight: 700; padding: 4px 10px;
          border-radius: 99px; text-transform: uppercase; letter-spacing: 0.04em;
        }
        .vendor-badge { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
        .customer-badge { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
        .user-empty {
          text-align: center; padding: 60px 20px; color: #9ca3af;
          display: flex; flex-direction: column; align-items: center; gap: 12px; font-size: 0.875rem;
        }
        @media (max-width: 640px) {
          .user-meta, .user-date { display: none; }
          .user-search { width: 100%; }
          .user-page-header { flex-direction: column; }
        }
      `}</style>
    </div>
  );
};

export default ManageUsers;
