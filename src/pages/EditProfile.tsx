import { useState, useEffect } from 'react'
import Nav from '../components/Nav/Nav'
import { toast } from '../components/Toast/toastService'

function EditProfile() {
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  const stored = localStorage.getItem('user') || sessionStorage.getItem('user')
  const parsedUser = stored ? JSON.parse(stored) : null

  useEffect(() => {
    if (!token) {
      window.location.href = '/login'
      return
    }

    fetch('http://localhost:3001/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setDisplayName(data.displayName || '')
        setBio(data.bio || '')
        setUsername(data.username || '')
        setEmail(data.email || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [token])

const handleSave = async () => {
  setError('')
  setSuccess('')

  if (newPassword && newPassword !== confirmPassword) {
    setError('New passwords do not match')
    return
  }

  if (newPassword && newPassword.length < 6) {
    setError('Password must be at least 6 characters')
    return
  }

  setSaving(true)

  const updates: Record<string, string> = {
    displayName,
    bio,
    username,
    email,
  }

  if (newPassword) {
    updates.password = newPassword
  }

  try {
    const res = await fetch('http://localhost:3001/api/users/me', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.message || 'Failed to save changes')
      toast.error(data.message || 'Failed to save changes')
      return
    }

    if (stored) {
      const updated = { ...parsedUser, username: data.username }
      if (localStorage.getItem('user')) localStorage.setItem('user', JSON.stringify(updated))
      if (sessionStorage.getItem('user')) sessionStorage.setItem('user', JSON.stringify(updated))
    }

    setSuccess('Profile updated successfully')
    toast.success('Profile updated')
    setNewPassword('')
    setConfirmPassword('')

    setTimeout(() => {
      window.location.href = `/profile/${data.username}`
    }, 1000)
  } catch {
    setError('Something went wrong. Please try again.')
    toast.error('Something went wrong')
  } finally {
    setSaving(false)
  }
}

  if (loading) {
    return (
      <div className="bg-[#0f0e0d] min-h-screen text-white">
        <Nav />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#9a9590] text-sm animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#0f0e0d] min-h-screen text-white">
      <Nav />

      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => window.location.href = `/profile/${parsedUser?.username}`}
            className="text-[#9a9590] hover:text-[#f0ede8] transition-all cursor-pointer text-[13px]"
          >
            ← Back to profile
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-xl font-medium text-[#f0ede8] mb-1">Edit profile</h1>
          <p className="text-[13px] text-[#9a9590]">Update your public profile information</p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Avatar preview */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5 flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold flex-shrink-0"
              style={{ backgroundColor: '#D13924', color: '#fff' }}
            >
              {(displayName || username).slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[13px] font-medium text-[#f0ede8] mb-1">Profile picture</div>
              <div className="text-[11px] text-[#9a9590]">Your initials are used as your avatar. Custom avatars coming soon.</div>
            </div>
          </div>

          {/* Display name */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Display name</label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="How you want to be known"
              maxLength={50}
              autoComplete="off"
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
            />
            <div className="text-[10px] text-[#5a5650] mt-2 text-right">{displayName.length}/50</div>
          </div>

          {/* Bio */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Bio</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell people what you're into..."
              maxLength={160}
              rows={3}
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] resize-none transition-all"
            />
            <div className="text-[10px] text-[#5a5650] mt-2 text-right">{bio.length}/160</div>
          </div>

          {/* Username */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="username"
              maxLength={30}
              autoComplete="off"
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
            />
            <div className="text-[10px] text-[#5a5650] mt-2">Changing your username will update your profile URL</div>
          </div>

          {/* Email */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              autoComplete="off"
              className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
            />
          </div>

          {/* Password change */}
          <div className="bg-[#1a1815] border border-white/7 rounded-xl p-5">
            <label className="text-[12px] text-[#9a9590] mb-4 block">Change password</label>
            <div className="flex flex-col gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                className="w-full bg-[#0f0e0d] border border-white/10 rounded-lg px-4 py-2.5 text-[13px] text-[#f0ede8] placeholder-[#5a5650] focus:outline-none focus:border-[#D13924] transition-all"
              />
              <div className="text-[10px] text-[#5a5650]">Leave blank to keep your current password</div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <p className="text-[12px] text-red-400">{error}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-[#1D9E75]/10 border border-[#1D9E75]/25 rounded-xl px-4 py-3">
              <p className="text-[12px] text-[#1D9E75]">{success}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => window.location.href = `/profile/${parsedUser?.username}`}
              className="text-[13px] text-[#9a9590] hover:text-[#f0ede8] cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-[13px] text-white font-medium px-6 py-2.5 rounded-full cursor-pointer hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#D13924' }}
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EditProfile