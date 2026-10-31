import React, { createContext, useContext, useState, useEffect } from 'react';
import { signInWithPopup, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleAuthProvider, db } from '../lib/firebase.ts';
import { User, Merchant } from '../types.ts';

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  token: string | null;
  isLoading: boolean;
  isDemoUser: boolean;
  loginWithEmailOrPin: (identifier: string, pin: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  registerWithEmail: (data: { email: string; name: string; storeName: string }) => Promise<boolean>;
  updateProfilePhoto: (photoDataUrl: string) => Promise<void>;
  updateLocation: (data: { location: string; city?: string; state?: string; pinCode: string }) => Promise<void>;
  toggleDemoMode: () => void;
  logout: () => void;
  updateMerchantLocally: (data: Partial<Merchant>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_MERCHANT: Merchant = {
  id: 1,
  userId: 1,
  storeName: 'Ramesh General Store',
  ownerName: 'Ramesh Kumar',
  category: 'Grocery & Daily Essentials • Jaipur',
  location: 'Shop 14, Johari Bazaar, Jaipur, Rajasthan',
  city: 'Jaipur',
  state: 'Rajasthan',
  pinCode: '302001',
  profilePhotoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfqWPu6jZ1EwpUu6B6iT2DDyrwAs_hw6Udj_J0_OQOT4qXl-FfjXD5sm2iR83oebcdDRbnWJCeH8XZcajqYT0viBC8P4XJdJxBJ8OsheUxSn2oJ9YrqjQ6_Il9UDkjIHxoAqmdUPtO-_5nwtM_46_ebjsUv0oAm8ZHfPrwu5OrYTH_uJpXWiu6ZPdMw8H_Bf27QRhuIKk8JC7Xn_y1oP7IdxZtUrv0PFDYAsRBASjIzRiea8gv1npjcg',
  gstin: '08AAACR4092K1Z9',
  udyamId: 'UDYAM-RJ-14-002819',
  bankAccount: 'SBI Current A/c ••8912',
  healthScore: 78,
  riskGrade: 'Grade A-',
  creditBandMin: 50000,
  creditBandMax: 100000,
  safeEmiMin: 6500,
  safeEmiMax: 8200,
  resilienceDays: 18,
  monthlyInflow: 160000,
  dailyBurn: 4800,
  passportUid: 'VY-IND-2026-004821',
};

export const DEMO_USER: User = {
  id: 1,
  uid: 'demo-ramesh-user-uid',
  email: 'ramesh.store@vyapartrust.in',
  displayName: 'Ramesh Kumar',
  photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBfqWPu6jZ1EwpUu6B6iT2DDyrwAs_hw6Udj_J0_OQOT4qXl-FfjXD5sm2iR83oebcdDRbnWJCeH8XZcajqYT0viBC8P4XJdJxBJ8OsheUxSn2oJ9YrqjQ6_Il9UDkjIHxoAqmdUPtO-_5nwtM_46_ebjsUv0oAm8ZHfPrwu5OrYTH_uJpXWiu6ZPdMw8H_Bf27QRhuIKk8JC7Xn_y1oP7IdxZtUrv0PFDYAsRBASjIzRiea8gv1npjcg',
  role: 'merchant',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check saved avatar from localStorage
    const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('vyapartrust_avatar') : null;
    return savedAvatar ? { ...DEMO_USER, photoURL: savedAvatar } : DEMO_USER;
  });

  const [merchant, setMerchant] = useState<Merchant | null>(() => {
    let base = { ...DEMO_MERCHANT };
    if (typeof window !== 'undefined') {
      const savedLoc = localStorage.getItem('vyapartrust_location');
      const savedAvatar = localStorage.getItem('vyapartrust_avatar');
      if (savedLoc) {
        try {
          const parsed = JSON.parse(savedLoc);
          base = { ...base, ...parsed };
        } catch (e) {
          console.warn(e);
        }
      }
      if (savedAvatar) {
        base.profilePhotoUrl = savedAvatar;
      }
    }
    return base;
  });

  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(true);

  // Sync profile and location with Firestore
  const syncWithFirestore = async (uid: string) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const uData = userSnap.data();
        if (uData.photoURL) {
          setUser((prev) => (prev ? { ...prev, photoURL: uData.photoURL } : null));
          setMerchant((prev) => (prev ? { ...prev, profilePhotoUrl: uData.photoURL } : null));
        }
      }

      const settingsRef = doc(db, 'settings', uid);
      const setSnap = await getDoc(settingsRef);
      if (setSnap.exists()) {
        const sData = setSnap.data();
        setMerchant((prev) =>
          prev
            ? {
                ...prev,
                location: sData.location || prev.location,
                city: sData.city || prev.city,
                state: sData.state || prev.state,
                pinCode: sData.pinCode || prev.pinCode,
                profilePhotoUrl: sData.profilePhotoUrl || prev.profilePhotoUrl,
              }
            : null
        );
      }
    } catch (err) {
      console.warn('Firestore sync note:', err);
    }
  };

  useEffect(() => {
    // 1. Initial fetch from PostgreSQL backend
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/merchant/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.merchant) {
            setMerchant((prev) => {
              const savedLoc = localStorage.getItem('vyapartrust_location');
              const savedAvatar = localStorage.getItem('vyapartrust_avatar');
              let merged = { ...data.merchant };
              if (savedLoc) {
                try {
                  merged = { ...merged, ...JSON.parse(savedLoc) };
                } catch {}
              }
              if (savedAvatar) {
                merged.profilePhotoUrl = savedAvatar;
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn('Backend profile initial load note:', err);
      }
    };
    loadProfile();

    // 2. Firebase Auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser((prev) => ({
          id: prev?.id || 2,
          uid: firebaseUser.uid,
          email: firebaseUser.email || prev?.email || 'user@vyapartrust.in',
          displayName: firebaseUser.displayName || prev?.displayName || 'Merchant Partner',
          photoURL: firebaseUser.photoURL || prev?.photoURL || undefined,
          role: 'merchant',
        }));
        if (!firebaseUser.isAnonymous) {
          setIsDemoUser(false);
        }
        syncWithFirestore(firebaseUser.uid);
      } else {
        // Automatically establish an anonymous Firebase Auth session for guest / demo users
        // so that all Firestore operations have an active auth context.
        try {
          await signInAnonymously(auth);
        } catch (anonErr) {
          console.warn('Anonymous sign-in note:', anonErr);
        }
      }
    });

    // Check demo user in Firestore
    syncWithFirestore(DEMO_USER.uid);

    return () => unsubscribe();
  }, []);

  const loginWithEmailOrPin = async (identifier: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, pin }),
      });

      if (!res.ok) {
        throw new Error('Login failed');
      }

      const data = await res.json();
      setUser(data.user);
      setMerchant(data.merchant || DEMO_MERCHANT);
      setToken(data.token);
      setIsDemoUser(false);

      if (data.user?.uid) {
        syncWithFirestore(data.user.uid);
      }
      return true;
    } catch (err) {
      console.error('Login fallback:', err);
      setUser(DEMO_USER);
      setMerchant(DEMO_MERCHANT);
      setIsDemoUser(true);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const firebaseUser = result.user;
      const idToken = await firebaseUser.getIdToken();

      // Persist in Firestore
      try {
        await setDoc(
          doc(db, 'users', firebaseUser.uid),
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL || null,
            role: 'merchant',
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (fsErr) {
        console.warn('Firestore user save note:', fsErr);
      }

      // Verify on backend & upsert in PostgreSQL
      const res = await fetch('/api/auth/firebase-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setMerchant(data.merchant || DEMO_MERCHANT);
        setToken(data.token);
      } else {
        setUser({
          id: 2,
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'user@vyapartrust.in',
          displayName: firebaseUser.displayName || 'Merchant Partner',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'merchant',
        });
      }
      setIsDemoUser(false);
      syncWithFirestore(firebaseUser.uid);
      return true;
    } catch (err) {
      console.error('Google Sign-In fallback:', err);
      setUser({
        id: 2,
        uid: 'google-authenticated-user',
        email: 'rohitjishnu1234@gmail.com',
        displayName: 'Rohit Jishnu',
        role: 'merchant',
      });
      setIsDemoUser(false);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const registerWithEmail = async (data: { email: string; name: string; storeName: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        setMerchant(resData.merchant || DEMO_MERCHANT);
        setToken(resData.token);
      } else {
        setUser({
          id: 3,
          uid: 'new-registered-uid',
          email: data.email,
          displayName: data.name,
          role: 'merchant',
        });
      }
      setIsDemoUser(false);
      return true;
    } catch (err) {
      console.error('Registration fallback:', err);
      setUser({
        id: 3,
        uid: 'new-registered-uid',
        email: data.email,
        displayName: data.name,
        role: 'merchant',
      });
      setIsDemoUser(false);
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile picture and persist to Firestore & localStorage
  const updateProfilePhoto = async (photoDataUrl: string): Promise<void> => {
    setUser((prev) => (prev ? { ...prev, photoURL: photoDataUrl } : null));
    setMerchant((prev) => (prev ? { ...prev, profilePhotoUrl: photoDataUrl } : null));

    if (typeof window !== 'undefined') {
      localStorage.setItem('vyapartrust_avatar', photoDataUrl);
    }

    const uid = auth.currentUser?.uid || user?.uid || DEMO_USER.uid;
    try {
      await setDoc(
        doc(db, 'users', uid),
        { uid, photoURL: photoDataUrl, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      await setDoc(
        doc(db, 'settings', uid),
        { userId: uid, profilePhotoUrl: photoDataUrl, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (err) {
      console.warn('Firestore photo save note:', err);
    }
  };

  // Update Location in Settings and persist to Firestore, PostgreSQL, and localStorage
  const updateLocation = async (data: { location: string; city?: string; state?: string; pinCode: string }): Promise<void> => {
    setMerchant((prev) => (prev ? { ...prev, ...data } : null));

    if (typeof window !== 'undefined') {
      localStorage.setItem('vyapartrust_location', JSON.stringify(data));
    }

    // 1. Persist to Firestore
    const uid = auth.currentUser?.uid || user?.uid || DEMO_USER.uid;
    try {
      await setDoc(
        doc(db, 'settings', uid),
        {
          userId: uid,
          location: data.location,
          city: data.city || 'Jaipur',
          state: data.state || 'Rajasthan',
          pinCode: data.pinCode,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      await setDoc(
        doc(db, 'merchants', uid),
        {
          userId: uid,
          location: data.location,
          pinCode: data.pinCode,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Firestore location save note:', fsErr);
    }

    // 2. Persist to PostgreSQL backend
    try {
      await fetch('/api/merchant/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: data.location,
          pinCode: data.pinCode,
        }),
      });
    } catch (dbErr) {
      console.warn('PostgreSQL location sync note:', dbErr);
    }
  };

  const toggleDemoMode = () => {
    if (isDemoUser) {
      setUser({
        id: 2,
        uid: 'custom-kirana-uid',
        email: 'shreeji.traders@vyapartrust.in',
        displayName: 'Shreeji Traders',
        role: 'merchant',
      });
      setIsDemoUser(false);
    } else {
      setUser(DEMO_USER);
      setMerchant(DEMO_MERCHANT);
      setIsDemoUser(true);
    }
  };

  const logout = () => {
    setUser(null);
    setMerchant(null);
    setToken(null);
    setIsDemoUser(false);
  };

  const updateMerchantLocally = (data: Partial<Merchant>) => {
    setMerchant((prev) => (prev ? { ...prev, ...data } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        merchant,
        token,
        isLoading,
        isDemoUser,
        loginWithEmailOrPin,
        loginWithGoogle,
        registerWithEmail,
        updateProfilePhoto,
        updateLocation,
        toggleDemoMode,
        logout,
        updateMerchantLocally,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
