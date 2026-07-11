import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { User, Lock, LogOut, ShoppingBag, Heart, ChevronRight, Eye, EyeOff, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) { toast.error('New passwords do not match'); return; }
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(user.email, currentPassword);
      // If login succeeds, update password via reset flow — use updateMe for password
      await base44.auth.updateMe({ password: newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      toast.error(err.message || 'Current password is incorrect');
    } finally {
      setPwLoading(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="font-heading text-3xl sm:text-4xl mb-8">My Profile</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Sidebar */}
        <aside className="sm:w-56 flex-shrink-0">
          <div className="border border-border">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm font-body border-b border-border last:border-b-0 transition ${
                    activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              );
            })}
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm font-body text-destructive hover:bg-secondary transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 border border-border p-6">
          {activeTab === 'account' && (
            <div>
              <h2 className="font-heading text-2xl mb-6">Account Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-1">Full Name</p>
                  <p className="font-body text-sm">{user?.full_name || '—'}</p>
                </div>
                <div className="w-full h-px bg-border" />
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-1">Email</p>
                  <p className="font-body text-sm">{user?.email || '—'}</p>
                </div>
                <div className="w-full h-px bg-border" />
                <div>
                  <p className="text-xs tracking-[0.15em] uppercase font-body text-muted-foreground mb-1">Account Type</p>
                  <p className="font-body text-sm capitalize">{user?.role || 'Customer'}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div>
              <h2 className="font-heading text-2xl mb-6">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                {[
                  { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(v => !v) },
                  { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(v => !v) },
                  { label: 'Confirm New Password', value: confirmPassword, setter: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(v => !v) },
                ].map(({ label, value, setter, show, toggle }) => (
                  <div key={label}>
                    <label className="text-xs tracking-[0.15em] uppercase font-body text-muted-foreground block mb-2">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? 'text' : 'password'}
                        value={value}
                        onChange={e => setter(e.target.value)}
                        required
                        className="w-full border border-border bg-background px-3 py-2 text-sm font-body pr-10 focus:outline-none focus:border-primary"
                      />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition disabled:opacity-60"
                >
                  {pwLoading ? <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="font-heading text-2xl mb-6">My Orders</h2>
              <p className="text-sm font-body text-muted-foreground mb-4">View and track all your orders.</p>
              <Link to="/shop" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition">
                <ShoppingBag className="w-4 h-4" /> Continue Shopping
              </Link>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="font-heading text-2xl mb-6">My Wishlist</h2>
              <p className="text-sm font-body text-muted-foreground mb-4">Browse your saved items.</p>
              <Link to="/wishlist" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 text-xs tracking-[0.2em] uppercase font-body hover:opacity-90 transition">
                <Heart className="w-4 h-4" /> View Wishlist
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}