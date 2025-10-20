'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiUser, FiMail, FiSave, FiCamera } from 'react-icons/fi';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || '');
      setEmail(session.user.email || '');
      setImage(session.user.image || '');
    }
  }, [session]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Selecteer een afbeelding');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Afbeelding moet kleiner dan 5MB zijn');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'avatar');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setImage(data.url);
      toast.success('Avatar geüpload');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Fout bij uploaden van avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Naam is verplicht');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image }),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const data = await response.json();

      // Update session
      await updateSession({
        user: {
          ...session?.user,
          name: data.user.name,
          image: data.user.image,
        },
      });

      toast.success('Profiel bijgewerkt');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Fout bij bijwerken van profiel');
    } finally {
      setSaving(false);
    }
  };

  if (!session) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Profiel Instellingen
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Beheer je persoonlijke gegevens
          </p>
        </div>

        {/* Profile Card */}
        <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/5 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center mb-8">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 dark:border-gray-700/30 shadow-xl">
                  {image ? (
                    <Image
                      src={image}
                      alt={name || 'Profile'}
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500/80 to-purple-500/80 flex items-center justify-center">
                      <FiUser className="h-16 w-16 text-white" />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  ) : (
                    <FiCamera className="h-5 w-5" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                Klik op de camera om je avatar te wijzigen
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiUser className="inline h-4 w-4 mr-2" />
                Naam
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="Je naam"
                required
              />
            </div>

            {/* Email Input (Read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiMail className="inline h-4 w-4 mr-2" />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                readOnly
                disabled
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email kan niet worden gewijzigd
              </p>
            </div>

            {/* Save Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Opslaan...
                  </>
                ) : (
                  <>
                    <FiSave className="h-5 w-5" />
                    Profiel Opslaan
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Info */}
        <div className="mt-6 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-700/30 rounded-xl shadow-xl shadow-black/5 p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Informatie
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Organisatie</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(session.user as { organizationId?: string })?.organizationId ? 'Actief' : 'Geen organisatie'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Rol</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {(session.user as { organizationRole?: string })?.organizationRole || 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
