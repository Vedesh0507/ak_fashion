import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, MapPin, User, Home, Building, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import OrderHistory from '@/components/OrderHistory';

interface SavedAddress {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
}

const Profile = () => {
  const { user, profile, refreshProfile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('saved_addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });
    
    if (!error && data) {
      setAddresses(data);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim() || !phone.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setIsUpdating(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, phone })
      .eq('id', user.id);

    setIsUpdating(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      refreshProfile();
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('saved_addresses')
      .insert({
        user_id: user.id,
        ...addressForm,
        is_default: addresses.length === 0,
      });

    if (error) {
      toast.error('Failed to add address');
    } else {
      toast.success('Address added');
      setShowAddressForm(false);
      setAddressForm({
        label: 'Home',
        full_name: '',
        phone: '',
        address_line1: '',
        address_line2: '',
        city: '',
        state: '',
        pincode: '',
      });
      fetchAddresses();
    }
  };

  const handleDeleteAddress = async (id: string) => {
    const { error } = await supabase
      .from('saved_addresses')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete address');
    } else {
      toast.success('Address deleted');
      fetchAddresses();
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;

    // First, unset all defaults
    await supabase
      .from('saved_addresses')
      .update({ is_default: false })
      .eq('user_id', user.id);

    // Then set the new default
    const { error } = await supabase
      .from('saved_addresses')
      .update({ is_default: true })
      .eq('id', id);

    if (!error) {
      toast.success('Default address updated');
      fetchAddresses();
    }
  };

  const getLabelIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'office': return <Building className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cream">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link to="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Store
        </Link>

        {/* Profile Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Profile
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || user?.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Saved Addresses Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Saved Addresses
                </CardTitle>
                <CardDescription>Manage your delivery addresses</CardDescription>
              </div>
              {!showAddressForm && (
                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Address
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {showAddressForm && (
              <form onSubmit={handleAddAddress} className="space-y-4 mb-6 p-4 border rounded-lg bg-secondary/30">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <select
                      value={addressForm.label}
                      onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                    >
                      <option value="Home">Home</option>
                      <option value="Office">Office</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={addressForm.full_name}
                      onChange={(e) => setAddressForm({ ...addressForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 1 *</Label>
                  <Input
                    value={addressForm.address_line1}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line1: e.target.value })}
                    placeholder="House/Flat No., Building Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Address Line 2</Label>
                  <Input
                    value={addressForm.address_line2}
                    onChange={(e) => setAddressForm({ ...addressForm, address_line2: e.target.value })}
                    placeholder="Street, Locality"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>City *</Label>
                    <Input
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>State *</Label>
                    <Input
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pincode *</Label>
                    <Input
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Save Address</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            {addresses.length === 0 && !showAddressForm ? (
              <p className="text-muted-foreground text-center py-8">No saved addresses yet</p>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <div key={address.id} className={`p-4 border rounded-lg ${address.is_default ? 'border-gold bg-gold/5' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${address.is_default ? 'bg-gold/20' : 'bg-secondary'}`}>
                          {getLabelIcon(address.label)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{address.label}</span>
                            {address.is_default && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gold text-gold-foreground">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm mt-1">{address.full_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {address.address_line1}
                            {address.address_line2 && `, ${address.address_line2}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          <p className="text-sm text-muted-foreground">{address.phone}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!address.is_default && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetDefault(address.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History Section */}
        <OrderHistory />

        {/* Logout Button */}
        <Button 
          variant="outline" 
          className="w-full mt-6" 
          onClick={() => {
            signOut();
            navigate('/');
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
