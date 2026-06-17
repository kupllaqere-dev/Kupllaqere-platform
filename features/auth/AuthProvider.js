'use client';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = useRef(null);
  if (!supabase.current) supabase.current = createClient();

  useEffect(() => {
    const sb = supabase.current;
    let mounted = true;

    async function loadProfile(userId, authUser) {
      const { data } = await sb
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (!mounted) return;

      let profileData = data ?? null;

      // Auto-populate platform_username from signup metadata on first login
      if (
        profileData &&
        !profileData.platform_username &&
        authUser?.user_metadata?.platform_username
      ) {
        const username = authUser.user_metadata.platform_username;
        await sb.from('profiles').update({ platform_username: username }).eq('id', userId);
        profileData = { ...profileData, platform_username: username };
      }

      setProfile(profileData);
    }

    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      const u = session?.user ?? null;
      setUser(u);
      if (!u) setProfile(null);
      if (mounted) setLoading(false);
      if (u) await loadProfile(u.id, u);
    });

    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const signOut = async () => {
    await supabase.current.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const signInWithEmail = async (email, password) => {
    return supabase.current.auth.signInWithPassword({ email, password });
  };

  const signUpWithEmail = async (email, password, { platform_username } = {}) => {
    return supabase.current.auth.signUp({
      email,
      password,
      ...(platform_username ? { options: { data: { platform_username } } } : {}),
    });
  };

  const updateBio = async (bio) => {
    if (!user) return { error: new Error('Not authenticated') };
    const trimmed = bio.slice(0, 200);
    const { data, error } = await supabase.current
      .from('profiles')
      .update({ platform_bio: trimmed })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const updatePlatformUsername = async (platform_username) => {
    if (!user) return { error: new Error('Not authenticated') };
    const { data, error } = await supabase.current
      .from('profiles')
      .update({ platform_username })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const refreshProfile = async () => {
    if (!user) return;
    const { data } = await supabase.current
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (data) setProfile(data);
  };

  async function uploadProfileImage(blob, folder) {
    if (!user) return { error: new Error('Not authenticated') };
    const sb = supabase.current;
    const path = `platform/${folder}/${user.id}.webp`;

    const { error: uploadError } = await sb.storage
      .from('kupllaqere')
      .upload(path, blob, { contentType: 'image/webp', upsert: true });
    if (uploadError) return { error: uploadError };

    const { data: { publicUrl } } = sb.storage.from('kupllaqere').getPublicUrl(path);
    return { url: `${publicUrl}?v=${Date.now()}` };
  }

  const updateAvatar = async (blob) => {
    const { url, error: uploadError } = await uploadProfileImage(blob, 'avatars');
    if (uploadError) return { error: uploadError };

    const { data, error } = await supabase.current
      .from('profiles')
      .update({ platform_avatar: url })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  const updateBanner = async (blob) => {
    const { url, error: uploadError } = await uploadProfileImage(blob, 'banners');
    if (uploadError) return { error: uploadError };

    const { data, error } = await supabase.current
      .from('profiles')
      .update({ banner: url })
      .eq('id', user.id)
      .select()
      .single();
    if (!error && data) setProfile(data);
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signOut, signInWithEmail, signUpWithEmail,
      updateBio, updatePlatformUsername, refreshProfile,
      updateAvatar, updateBanner,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
