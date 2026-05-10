import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Profile, defaultProfile, getStoredProfile, saveProfile } from './profile';

type ProfileCtx = {
  profile: Profile;
  setProfile: (p: Profile) => Promise<void>;
};

const Ctx = createContext<ProfileCtx | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(null);

  useEffect(() => {
    getStoredProfile().then((p) => setProfileState(p ?? defaultProfile()));
  }, []);

  const setProfile = async (p: Profile) => {
    setProfileState(p);
    await saveProfile(p);
  };

  const value = useMemo(() => {
    if (!profile) return null;
    return { profile, setProfile };
  }, [profile]);

  if (!value) return null;

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useProfile must be used inside ProfileProvider');
  return v;
}
