'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Shield, Save, Mail, Calendar, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userProfile, setUserProfile] = useState<{ email: string; display_name: string; role: string; profile_photo_url?: string } | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [userPasswords, setUserPasswords] = useState<Array<{ id: string; display_name: string; email: string; role: string; latest_password: string | null }>>([]);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);

    // Fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('/api/auth/user');
                if (response.ok) {
                    const data = await response.json();
                    setUserProfile({
                        email: data.user.email,
                        display_name: data.user.display_name,
                        role: data.user.role,
                        profile_photo_url: data.user.profile_photo_url
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user profile:', error);
            }
        };
        fetchUserProfile();
    }, []);

    // Fetch user passwords (admin only)
    useEffect(() => {
        if (userProfile?.role === 'admin') {
            const fetchUserPasswords = async () => {
                try {
                    const response = await fetch('/api/admin/user-passwords');
                    if (response.ok) {
                        const data = await response.json();
                        setUserPasswords(data.users || []);
                    }
                } catch (error) {
                    console.error('Failed to fetch user passwords:', error);
                }
            };
            fetchUserPasswords();
        }
    }, [userProfile]);

    // Check if passwords match in realtime
    useEffect(() => {
        if (confirmPassword === '') {
            setPasswordsMatch(null);
        } else if (newPassword === confirmPassword) {
            setPasswordsMatch(true);
        } else {
            setPasswordsMatch(false);
        }
    }, [newPassword, confirmPassword]);

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedPhoto(file);
            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePhotoUpload = async () => {
        if (!selectedPhoto) return;

        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('photo', selectedPhoto);

            const response = await fetch('/api/profile/upload-photo', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                toast.success('Profile photo updated successfully!', {
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });

                // Update local state
                setUserProfile(prev => prev ? { ...prev, profile_photo_url: data.photoUrl } : null);
                setSelectedPhoto(null);
                setPhotoPreview(null);
            } else {
                const error = await response.json();
                toast.error(error.error || 'Failed to upload photo', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        } catch (error) {
            toast.error('Failed to upload photo', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
            return;
        }

        setIsLoading(true);

        try {
            // Get session token from localStorage
            const session = localStorage.getItem('supabase-session');
            const sessionData = session ? JSON.parse(session) : null;
            const token = sessionData?.access_token;

            if (!token) {
                toast.error('Session expired. Please login again.', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
                return;
            }

            const response = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password updated successfully!', {
                    style: {
                        background: '#000000',
                        color: '#FFC107',
                        border: '1px solid #FFC107',
                    },
                });
                setNewPassword('');
                setConfirmPassword('');
            } else {
                toast.error(data.error || 'Failed to update password', {
                    style: {
                        background: '#000000',
                        color: '#ffffff',
                        border: '1px solid #FFC107',
                    },
                });
            }
        } catch (error) {
            toast.error('Connection error. Please try again.', {
                style: {
                    background: '#000000',
                    color: '#ffffff',
                    border: '1px solid #FFC107',
                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full overflow-y-auto bg-black" style={{ padding: '20px' }}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ marginBottom: '25px' }}
                >
                    <h1
                        className="text-4xl text-center font-bold text-white"
                        style={{ marginBottom: '10px' }}
                    >
                        Settings
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Manage your account and security settings
                    </p>
                </motion.div>

                {/* Profile Photo Upload Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ marginBottom: '30px' }}
                >
                    <Card className="bg-[#0a0a0a] border-[rgba(255,193,7,0.3)]" style={{ padding: '25px' }}>
                        <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '20px' }}>
                            Profile Photo
                        </h2>

                        <div className="flex items-start" style={{ gap: '25px' }}>
                            {/* Current/Preview Photo */}
                            <div className="flex-shrink-0">
                                <Avatar className="w-32 h-32 border-4 border-[#FFC107]">
                                    {(photoPreview || userProfile?.profile_photo_url) ? (
                                        <img
                                            src={photoPreview || userProfile?.profile_photo_url}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <AvatarFallback className="bg-[#FFC107] text-black font-bold text-4xl">
                                            {userProfile?.display_name?.substring(0, 2).toUpperCase() || 'BA'}
                                        </AvatarFallback>
                                    )}
                                </Avatar>
                            </div>

                            {/* Upload Controls */}
                            <div className="flex-1">
                                <p className="text-gray-400" style={{ marginBottom: '15px' }}>
                                    Upload a profile photo. Max size: 5MB. Formats: JPEG, PNG, WebP
                                </p>


                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    id="photo-upload"
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                    onChange={handlePhotoSelect}
                                    style={{ display: 'none' }}
                                />

                                {!selectedPhoto && (
                                    <Button
                                        onClick={() => document.getElementById('photo-upload')?.click()}
                                        className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold"
                                        style={{ marginBottom: '15px' }}
                                    >
                                        {userProfile?.profile_photo_url ? 'Change Profile Photo' : 'Choose from Gallery'}
                                    </Button>
                                )}

                                {selectedPhoto && (
                                    <div className="flex items-center" style={{ gap: '10px' }}>
                                        <Button
                                            onClick={handlePhotoUpload}
                                            disabled={isUploadingPhoto}
                                            className="bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold"
                                        >
                                            {isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setSelectedPhoto(null);
                                                setPhotoPreview(null);
                                            }}
                                            variant="outline"
                                            className="border-[rgba(255,193,7,0.3)] text-white hover:bg-[rgba(255,193,7,0.1)]"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Profile Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ marginBottom: '30px' }}
                >
                    <Card className="bg-[#0a0a0a] border-[rgba(255,193,7,0.3)]" style={{ padding: '25px' }}>
                        <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '20px' }}>
                            Profile Information
                        </h2>

                        <div className="flex items-center" style={{ gap: '20px' }}>
                            <Avatar className="w-20 h-20 border-2 border-[#FFC107]">
                                {userProfile?.profile_photo_url ? (
                                    <img
                                        src={userProfile.profile_photo_url}
                                        alt={userProfile.display_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <AvatarFallback className="bg-[#FFC107] text-black font-bold text-2xl">
                                        {userProfile?.display_name?.substring(0, 2).toUpperCase() || 'BA'}
                                    </AvatarFallback>
                                )}
                            </Avatar>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-xl" style={{ marginBottom: '8px' }}>
                                    {userProfile?.display_name || 'Loading...'}
                                </h3>
                                <p className="text-gray-400 text-sm" style={{ marginBottom: '8px' }}>
                                    {userProfile?.email || 'Loading...'}
                                </p>
                                <div
                                    className={`inline-flex items-center rounded-lg font-semibold text-xs ${userProfile?.role === 'admin'
                                        ? 'bg-[#FFC107] text-black'
                                        : 'bg-[rgba(255,193,7,0.1)] text-[#FFC107] border border-[rgba(255,193,7,0.3)]'
                                        }`}
                                    style={{ padding: '6px 12px', gap: '6px' }}
                                >
                                    <Shield size={12} />
                                    <span>
                                        {userProfile?.role === 'admin' ? 'God of Blinders' :
                                            userProfile?.role === 'president' ? 'President' :
                                                userProfile?.role === 'chief_member' ? 'Chief Member' :
                                                    userProfile?.role === 'senior_member' ? 'Senior Member' : 'Agent'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Admin Password Tracking Section */}
                {userProfile?.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ marginBottom: '30px' }}
                    >
                        <Card className="bg-[#0a0a0a] border-[rgba(255,193,7,0.3)]" style={{ padding: '25px' }}>
                            <h2 className="text-2xl font-bold text-white" style={{ marginBottom: '20px' }}>
                                Agent's Latest Passwords
                            </h2>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-[rgba(255,193,7,0.2)]">
                                            <th className="text-left text-[#FFC107] font-semibold" style={{ padding: '12px' }}>Name</th>
                                            <th className="text-left text-[#FFC107] font-semibold" style={{ padding: '12px' }}>Email</th>
                                            <th className="text-left text-[#FFC107] font-semibold" style={{ padding: '12px' }}>Role</th>
                                            <th className="text-left text-[#FFC107] font-semibold" style={{ padding: '12px' }}>Latest Password</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {userPasswords.map((user) => (
                                            <tr key={user.id} className="border-b border-[rgba(255,193,7,0.1)]">
                                                <td className="text-white" style={{ padding: '12px' }}>{user.display_name}</td>
                                                <td className="text-gray-400 text-sm" style={{ padding: '12px' }}>{user.email}</td>
                                                <td className="text-gray-400 text-sm" style={{ padding: '12px' }}>
                                                    {user.role === 'president' ? 'President' :
                                                        user.role === 'chief_member' ? 'Chief Member' :
                                                            user.role === 'senior_member' ? 'Senior Member' : 'Agent'}
                                                </td>
                                                <td className="text-[#FFC107] font-mono" style={{ padding: '12px' }}>
                                                    {user.latest_password || 'Not set yet'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {userPasswords.length === 0 && (
                                    <p className="text-gray-400 text-center" style={{ padding: '20px' }}>
                                        No user passwords available yet.
                                    </p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Security Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="bg-[#0a0a0a] border-[rgba(255,193,7,0.2)]">
                        <div style={{ padding: '25px' }}>
                            <div className="flex items-center" style={{ gap: '10px', marginBottom: '8px' }}>
                                <Lock className="text-[#FFC107]" size={24} />
                                <h2 className="text-2xl font-bold text-white">Change Password</h2>
                            </div>
                            <p
                                className="text-gray-400"
                                style={{ marginBottom: '20px' }}
                            >
                                Update your password. The Chief will be notified of the change.
                            </p>

                            <form onSubmit={handlePasswordChange}>
                                <div style={{ marginBottom: '15px' }}>
                                    <label className="block text-gray-300 text-sm font-semibold" style={{ marginBottom: '8px' }}>
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            required
                                            className="bg-black text-xl border-[rgba(255,193,7,0.2)] text-white placeholder:text-gray-500 focus:border-[#FFC107] rounded-xl pr-12"
                                            style={{ height: '50px', paddingLeft: '15px', paddingRight: '15px' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFC107] transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label className="block text-gray-300 text-sm font-semibold" style={{ marginBottom: '8px' }}>
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            required
                                            className={`bg-black text-xl text-white placeholder:text-gray-500 rounded-xl pr-24 ${passwordsMatch === null
                                                ? 'border-[rgba(255,193,7,0.2)] focus:border-[#FFC107]'
                                                : passwordsMatch
                                                    ? 'border-green-500 focus:border-green-500'
                                                    : 'border-red-500 focus:border-red-500'
                                                }`}
                                            style={{ height: '50px', paddingLeft: '15px', paddingRight: '15px' }}
                                        />
                                        {/* Password Match Indicator */}
                                        {passwordsMatch !== null && (
                                            <div className="absolute right-14 top-1/2 -translate-y-1/2">
                                                {passwordsMatch ? (
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-green-500">
                                                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fill="currentColor" />
                                                    </svg>
                                                ) : (
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-red-500">
                                                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" fill="currentColor" />
                                                    </svg>
                                                )}
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FFC107] transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FFC107] hover:bg-[#FFD54F] text-black font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ height: '50px', gap: '10px' }}
                                >
                                    <Save size={20} />
                                    {isLoading ? 'Updating...' : 'Update Password'}
                                </Button>
                            </form>

                            {/* Security Notice */}
                            <div
                                className="bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.3)] rounded-xl"
                                style={{ marginTop: '20px', padding: '15px' }}
                            >
                                <div className="flex items-start" style={{ gap: '12px' }}>
                                    <Shield className="text-[#FFC107] flex-shrink-0" size={20} style={{ marginTop: '2px' }} />
                                    <div>
                                        <p
                                            className="font-semibold text-white"
                                            style={{ marginBottom: '4px' }}
                                        >
                                            Security Notice
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            Password changes are automatically synced with the Chief's records for security purposes.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div >
    );
}
