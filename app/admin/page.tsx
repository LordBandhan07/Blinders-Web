'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import toast, { Toaster } from 'react-hot-toast';

interface User {
    id: string;
    blinders_id: string;
    display_name: string;
    role: string;
    is_active: boolean;
    created_at: string;
}

export default function AdminPage() {
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/create-user');
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ displayName, password }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`User created! Blinders ID: ${data.user.blinders_id}`);
                setDisplayName('');
                setPassword('');
                fetchUsers();
            } else {
                toast.error(data.error || 'Failed to create user');
            }
        } catch (error) {
            toast.error('Connection error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <Toaster position="top-center" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-[var(--primary-accent)] to-[var(--secondary-accent)]">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--foreground)]">
                                Admin Panel
                            </h1>
                            <p className="text-[var(--foreground-secondary)]">
                                Chief of Blinders - User Management
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Create User Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <UserPlus size={20} />
                                    Create New Agent
                                </CardTitle>
                                <CardDescription>
                                    Add a new member to the Blinders organization
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--foreground)]">
                                            Display Name
                                        </label>
                                        <Input
                                            type="text"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Agent Shadow"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[var(--foreground)]">
                                            Initial Password
                                        </label>
                                        <div className="relative">
                                            <Input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Enter initial password"
                                                required
                                                className="pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-secondary)] hover:text-[var(--foreground)]"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                        <p className="text-xs text-[var(--foreground-secondary)]">
                                            Minimum 6 characters. User can change this later.
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Agent'}
                                    </Button>
                                </form>

                                <div className="mt-4 p-3 rounded-lg bg-[var(--primary-accent)]/10 border border-[var(--primary-accent)]/30">
                                    <p className="text-xs text-[var(--foreground-secondary)]">
                                        <strong>Note:</strong> Blinders ID will be auto-generated. You'll see all password updates from users.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Users List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users size={20} />
                                    All Agents ({users.length})
                                </CardTitle>
                                <CardDescription>
                                    Complete list of Blinders members
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                    {users.map((user, index) => (
                                        <motion.div
                                            key={user.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-4 rounded-lg bg-[var(--card-bg)] border border-[var(--border)] hover:border-[var(--primary-accent)] transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-[var(--foreground)]">
                                                        {user.display_name}
                                                    </p>
                                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                                        {user.blinders_id}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {user.role === 'admin' && (
                                                        <Shield className="w-4 h-4 text-yellow-500" />
                                                    )}
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${user.is_active
                                                                ? 'bg-[var(--success)]/20 text-[var(--success)]'
                                                                : 'bg-gray-500/20 text-gray-500'
                                                            }`}
                                                    >
                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {users.length === 0 && (
                                        <p className="text-center text-[var(--foreground-secondary)] py-8">
                                            No agents created yet
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
