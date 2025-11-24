
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { supabaseService } from '@/lib/supabaseService';
import { toast } from '@/components/ui/use-toast';
import { ROLES } from '@/lib/constants';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (sessionUser) => {
    try {
      if (!sessionUser) {
        setUser(null);
        setTenant(null);
        return;
      }

      // Get User Profile
      const profile = await supabaseService.getUserProfile(sessionUser.id);
      
      // Get Tenant Info
      let tenantInfo = null;
      if (profile?.tenant_id) {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', profile.tenant_id)
          .single();
        if (!error) tenantInfo = data;
      }

      if (profile) {
        const userData = {
          ...sessionUser,
          ...profile,
          id: sessionUser.id, // Ensure ID consistency
          isSuperAdmin: profile.email === 'systemibrahem@gmail.com',
          isStoreOwner: profile.role === ROLES.STORE_OWNER,
        };

        // Check Subscription Expiry
        if (tenantInfo && !userData.isSuperAdmin) {
           const expiresAt = new Date(tenantInfo.subscription_expires_at);
           const now = new Date();
           const diffDays = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
           
           tenantInfo.daysRemaining = diffDays;
           tenantInfo.isExpired = diffDays <= 0;

           if (tenantInfo.isExpired) {
             toast({
               title: "Subscription Expired",
               description: "Your store subscription has expired. Please contact admin to renew.",
               variant: "destructive",
               duration: 10000
             });
           } else if (diffDays <= 7) {
             toast({
               title: "Subscription Expiring Soon",
               description: `Your subscription expires in ${diffDays} days.`,
               variant: "warning"
             });
           }
        }

        setUser(userData);
        setTenant(tenantInfo);
      } else {
        // Fallback for super admin initial seed scenario if profile missing
        if (sessionUser.email === 'systemibrahem@gmail.com') {
           setUser({ ...sessionUser, role: ROLES.SUPER_ADMIN, isSuperAdmin: true });
        } else {
           setUser(sessionUser);
        }
      }
    } catch (error) {
      console.error("Auth setup error:", error);
      setUser(sessionUser);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (mounted) await fetchProfile(session?.user);
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) await fetchProfile(session?.user);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const register = async ({ name, storeName, email, password }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // Creating tenant
      const tenant = await supabaseService.createTenant(storeName, authData.user.id);
      
      // Create owner profile
      await supabaseService.createUserProfile({
          id: authData.user.id,
          tenant_id: tenant.id,
          name,
          email,
          role: ROLES.STORE_OWNER,
          can_delete_data: true,
          can_edit_data: true,
          can_create_users: true,
          created_by: authData.user.id
      });

      toast({ title: 'Account Created!', description: 'Welcome to Ibrahim Accounting System.' });
      return authData;
    } catch (error) {
      toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTenant(null);
    window.location.href = '/login';
  };

  // Permission Helpers
  const canDelete = user?.isSuperAdmin || (user?.isStoreOwner && !tenant?.isExpired) || user?.can_delete_data;
  const canEdit = user?.isSuperAdmin || (user?.isStoreOwner && !tenant?.isExpired) || user?.can_edit_data;
  const canCreateUsers = user?.isSuperAdmin || (user?.isStoreOwner && !tenant?.isExpired) || user?.can_create_users;
  const isExpired = tenant?.isExpired && !user?.isSuperAdmin;

  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      tenant, 
      login, 
      register, 
      logout, 
      loading,
      permissions: { canDelete, canEdit, canCreateUsers, isExpired }
    }}>
      {children}
    </AuthContext.Provider>
  );
};
