"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  LogOut, 
  Edit, 
  Save,
  ChevronRight,
  Home,
  Leaf,
  TrendingUp,
  Shield,
  Camera
} from "lucide-react"
import { supabase } from '@/lib/supabase'

interface UserData {
  id: string
  firstName: string
  lastName: string
  username: string
  email: string
  isEmailVerified: boolean
  createdAt?: string
}

const countryCodes = [
  { code: '+1', name: 'US', flag: '🇺🇸' },
  { code: '+44', name: 'UK', flag: '🇬🇧' },
  { code: '+91', name: 'IN', flag: '🇮🇳' },
  { code: '+33', name: 'FR', flag: '🇫🇷' },
  { code: '+49', name: 'DE', flag: '🇩🇪' },
  { code: '+81', name: 'JP', flag: '🇯🇵' },
  { code: '+86', name: 'CN', flag: '🇨🇳' },
  { code: '+234', name: 'NG', flag: '🇳🇬' },
  { code: '+27', name: 'ZA', flag: '🇿🇦' },
  { code: '+20', name: 'EG', flag: '🇪🇬' },
];

export default function ProfilePage() {
  const [activePanel, setActivePanel] = useState<'settings' | 'scanned' | 'recommended'>('settings');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<{ fullName: string; phone: string; countryCode: string; city: string; username: string; email: string; profileImage: string; cropsRecommended: any[]; } | null>(null);
  const [profileImage, setProfileImage] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: ""
  })
  const router = useRouter()
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cropsScanned, setCropsScanned] = useState<any[]>([]);

  useEffect(() => {
    // Get user data from localStorage
    try {
      const userData = localStorage.getItem("user")
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setEditForm({
          firstName: parsedUser.firstName || "",
          lastName: parsedUser.lastName || "",
          username: parsedUser.username || "",
          email: parsedUser.email || ""
        })
      } else {
        // Redirect to login if no user data
        router.push("/login")
      }
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/login")
    } finally {
      setIsLoading(false)
    }
    // Fetch profile on mount
    fetch('/api/profile')
      .then(res => res.json())
      .then(data => {
        console.log('Profile API response:', data); // Debug log
        if (data.profile) {
          setProfile({
            fullName: data.profile.fullName || '',
            phone: data.profile.phone || '',
            countryCode: data.profile.countryCode || '+91',
            city: data.profile.city || '',
            username: data.profile.username || '',
            email: data.profile.email || '',
            profileImage: data.profile.profileImage || '',
            cropsRecommended: data.profile.cropsRecommended || [],
          });
          setProfileImage(data.profile.profileImage || '');
          setCropsScanned(data.profile.cropsScanned || []);
        }
      })
      .catch(() => {});
  }, [router])

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: 'include'
      })
      
      if (response.ok) {
        localStorage.removeItem("user")
        setUser(null)
        router.push("/")
      }
    } catch (error) {
      console.error("Logout error:", error)
      // Still clear local state even if API call fails
      localStorage.removeItem("user")
      setUser(null)
      router.push("/")
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // Update user data in localStorage
    if (user) {
      const updatedUser = {
        ...user,
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        username: editForm.username,
        email: editForm.email
      }
      localStorage.setItem("user", JSON.stringify(updatedUser))
      setUser(updatedUser)
      window.dispatchEvent(new Event("user-updated"))
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        username: user.username || "",
        email: user.email || ""
      })
    }
    setIsEditing(false)
  }

  const getUserInitials = (userData: UserData | null) => {
    if (!userData) return "U";
    if (userData.firstName && userData.lastName) {
      return `${userData.firstName[0]}${userData.lastName[0]}`.toUpperCase();
    }
    if (userData.firstName) return userData.firstName[0].toUpperCase();
    if (userData.username) return userData.username[0].toUpperCase();
    if (userData.email) return userData.email[0].toUpperCase();
    return "U";
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Profile image upload handler
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setProfileImage(URL.createObjectURL(file));
      setShowSave(true);
    }
  };

  // Save profile handler
  const handleSaveProfile = async () => {
    setSaveMessage(null);
    let imageUrl = profileImage;
    let fullName = profile?.fullName?.trim();
    // If fullName is empty, recompute from user or fallback
    if (!fullName) {
      fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
    }
    try {
      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `profile_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('cropcare').upload(fileName, selectedFile);
        if (uploadError) throw uploadError;
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cropcare/${fileName}`;
      }
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          fullName, // always send a valid fullName
          profileImage: imageUrl,
        })
      });
      if (!response.ok) throw new Error('Failed to update profile');
      setSaveMessage('Profile Updated Successfully');
      setShowSave(false);
      setSelectedFile(null);
      // Refetch profile to update fields
      const updated = await response.json();
      if (updated.profile) {
        // Always use the correct fullName (from local state or recomputed)
        setProfile({
          fullName: fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || updated.profile.fullName || '',
          phone: updated.profile.phone || '',
          countryCode: updated.profile.countryCode || '+91',
          city: updated.profile.city || '',
          username: updated.profile.username || '',
          email: updated.profile.email || '',
          profileImage: updated.profile.profileImage || '',
          cropsRecommended: updated.profile.cropsRecommended || [],
        });
        setProfileImage(updated.profile.profileImage || '');
        setSaveMessage('Profile Updated Successfully');
        setIsEditing(false); // Exit editing mode after save
      }
    } catch (err: any) {
      setSaveMessage(err.message || 'Error updating profile');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                You need to be logged in to view this page.
              </AlertDescription>
            </Alert>
            <div className="mt-4 text-center">
              <Button asChild>
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#101014] flex flex-col">
      <div className="container mx-auto px-2 sm:px-4 md:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Sidebar */}
          <aside className="md:col-span-3 flex flex-col gap-0 mb-4 md:mb-0">
            <Card className="p-0 bg-white dark:bg-[#18181b] border dark:border-[#23272f] shadow-md">
              <CardContent className="flex flex-col items-center pt-8 pb-4">
                <div className="relative mb-2">
                  <Avatar className="h-20 w-20">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="rounded-full object-cover h-20 w-20" />
                    ) : (
                      <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-white dark:bg-[#23272f] rounded-full p-1 shadow cursor-pointer border border-gray-200 dark:border-[#23272f]">
                    <Camera className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleProfileImageChange} />
                  </label>
                </div>
                <div className="font-semibold text-lg text-gray-900 dark:text-gray-100">{profile?.fullName}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">@{profile?.username}</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-1 flex items-center"><Mail className="h-3 w-3 mr-1" />{profile?.email}</div>
                <div className="text-gray-400 dark:text-gray-500 text-xs mt-1">Joined {formatDate(user.createdAt)}</div>
              </CardContent>
            </Card>
            <div className="h-6" />
            <div className="bg-white dark:bg-[#18181b] rounded-lg shadow-sm p-4 mb-8 border dark:border-[#23272f]">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-2">Accounts</div>
              <div className="flex flex-col gap-1">
                <button
                  className={`flex items-center px-4 py-2 rounded-l-lg text-left transition-all ${activePanel === 'settings' ? 'font-bold border-l-4 border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'hover:bg-gray-100 dark:hover:bg-[#23272f] text-gray-700 dark:text-gray-200'}`}
                  onClick={() => setActivePanel('settings')}
                >
                  <Home className="h-4 w-4 mr-2" />Settings
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-l-lg text-left transition-all ${activePanel === 'scanned' ? 'font-bold border-l-4 border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'hover:bg-gray-100 dark:hover:bg-[#23272f] text-gray-700 dark:text-gray-200'}`}
                  onClick={() => setActivePanel('scanned')}
                >
                  <span className="mr-2">🌱</span>Crops Scanned
                </button>
                <button
                  className={`flex items-center px-4 py-2 rounded-l-lg text-left transition-all ${activePanel === 'recommended' ? 'font-bold border-l-4 border-green-500 bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200' : 'hover:bg-gray-100 dark:hover:bg-[#23272f] text-gray-700 dark:text-gray-200'}`}
                  onClick={() => setActivePanel('recommended')}
                >
                  <span className="mr-2">📋</span>Crops Recommended
                </button>
              </div>
            </div>
            <div className="mt-0">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 ml-2">Quick Stats</div>
              <div className="bg-white dark:bg-[#18181b] rounded-lg p-4 flex flex-col gap-2 shadow-sm border dark:border-[#23272f]">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-green-700 dark:text-green-300">🌱 Scans Performed</span>
                  <span className="font-bold">{Array.isArray(cropsScanned) ? cropsScanned.length : 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-blue-700 dark:text-blue-300">📋 Recommendations</span>
                  <span className="font-bold">{Array.isArray(profile?.cropsRecommended) ? profile.cropsRecommended.length : 0}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9 flex flex-col gap-8">
            {/* Profile Information Card */}
            <Card className="bg-white dark:bg-[#18181b] border dark:border-[#23272f] shadow-md">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-gray-900 dark:text-gray-100">Profile Information</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Update your personal information and account details</CardDescription>
                  </div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                      <Button onClick={handleSaveProfile}>Save</Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing((v) => !v)}>Edit</Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-900 dark:text-gray-100">Full Name</Label>
                    <Input id="fullName" value={profile?.fullName} disabled={!isEditing} onChange={e => setProfile(p => p ? { ...p, fullName: e.target.value } : p)}
                      className="bg-gray-50 dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f] placeholder-gray-400 dark:placeholder-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-900 dark:text-gray-100">Phone Number</Label>
                    <div className="flex gap-2">
                      <select
                        disabled={!isEditing}
                        className="border rounded px-2 py-1 text-sm bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f]"
                        value={profile?.countryCode || '+91'}
                        onChange={e => setProfile(p => p ? { ...p, countryCode: e.target.value } : p)}
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                        ))}
                      </select>
                      <Input
                        id="phone"
                        value={profile?.phone}
                        disabled={!isEditing}
                        onChange={e => setProfile(p => p ? { ...p, phone: e.target.value.replace(/[^0-9]/g, '').slice(0, 10) } : p)}
                        className="flex-1 bg-gray-50 dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f] placeholder-gray-400 dark:placeholder-gray-500"
                        placeholder="1234567890"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-900 dark:text-gray-100">City</Label>
                    <select id="city" disabled={!isEditing} className="border rounded px-2 py-1 text-sm w-full bg-white dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f]" value={profile?.city} onChange={e => setProfile(p => p ? { ...p, city: e.target.value } : p)}>
                      <option value="">Select City</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Bangalore">Bangalore</option>
                      {/* Add more cities as needed */}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-900 dark:text-gray-100">Username</Label>
                    <Input id="username" value={profile?.username} disabled={!isEditing} onChange={e => setProfile(p => p ? { ...p, username: e.target.value } : p)}
                      className="bg-gray-50 dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f] placeholder-gray-400 dark:placeholder-gray-500" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-900 dark:text-gray-100">Email Address</Label>
                    <Input id="email" value={profile?.email} disabled={!isEditing} onChange={e => setProfile(p => p ? { ...p, email: e.target.value } : p)}
                      className="bg-gray-50 dark:bg-[#23272f] text-gray-900 dark:text-gray-100 border dark:border-[#23272f] placeholder-gray-400 dark:placeholder-gray-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Content Area */}
            {activePanel === 'settings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences and security settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-600">Update your password to keep your account secure</p>
                      </div>
                      <Button variant="outline" size="sm">Change</Button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border rounded-lg gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-medium">Download Data</h4>
                        <p className="text-sm text-gray-600">Download a copy of your account data</p>
                      </div>
                      <Button variant="outline" size="sm">Download</Button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50 gap-2 sm:gap-0">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {activePanel === 'scanned' && (
              <Card>
                <CardHeader>
                  <CardTitle>Crops / Plants Scanned So far</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    {cropsScanned.length === 0 ? (
                      <div className="text-gray-400 text-center">No data yet</div>
                    ) : (
                      cropsScanned.map((scan, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-6 bg-gray-50 dark:bg-[#23272f] rounded-lg p-4">
                          <div className="w-24 h-24 bg-gray-200 dark:bg-[#23272f] rounded flex items-center justify-center overflow-hidden">
                            {scan.imageUrl ? (
                              <img src={scan.imageUrl} alt="Crop" className="object-cover w-24 h-24" />
                            ) : (
                              <span className="text-4xl">🖼️</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">{scan.disease}</div>
                            <div className="flex flex-wrap gap-4 text-sm mb-1">
                              <span>Confidence <span className="font-bold ml-1">{scan.confidence}</span></span>
                              <span>Severity <span className="font-bold ml-1">{scan.severity}</span></span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-700 dark:text-green-200 text-xs max-w-xs overflow-x-auto whitespace-pre-line block">
                                @ Treatment: {scan.treatment ? scan.treatment : 'N/A'}
                              </span>
                              <span className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-700 dark:text-green-200 text-xs max-w-xs overflow-x-auto whitespace-pre-line block">
                                @ Prevention Tips: {scan.prevention ? scan.prevention : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {activePanel === 'recommended' && (
              <Card>
                <CardHeader>
                  <CardTitle>Crops / Plants Recommended</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col gap-6">
                    {Array.isArray(profile?.cropsRecommended) && profile.cropsRecommended.length > 0 ? (
                      profile.cropsRecommended.map((rec, idx) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-6 bg-gray-50 dark:bg-[#23272f] rounded-lg p-4">
                          <div className="flex-1">
                            <div className="font-semibold text-lg mb-1 text-gray-900 dark:text-gray-100">{rec.crop}</div>
                            <div className="flex flex-wrap gap-4 text-sm mb-1">
                              <span>Suitability <span className="font-bold ml-1">{rec.suitability}</span></span>
                              <span>Profit <span className="font-bold ml-1">{rec.profit}</span></span>
                              <span>Expected Yield <span className="font-bold ml-1">{rec.expected_yield}</span></span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm mb-1">
                              <span>Best Season <span className="font-bold ml-1">{rec.best_season}</span></span>
                            </div>
                            <div className="flex flex-col gap-2 mt-2">
                              <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-700 dark:text-blue-200 text-xs max-w-xs overflow-x-auto whitespace-pre-line block">
                                Why Recommended: {Array.isArray(rec.why_recommended) ? rec.why_recommended.join(', ') : (rec.why_recommended || 'N/A')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 text-center">No data yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
      {saveMessage && (
        <div className="mt-2">
          <Alert variant="default">
            <AlertDescription>{saveMessage}</AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}