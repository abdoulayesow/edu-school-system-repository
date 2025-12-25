"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { User } from "lucide-react"

interface ProfileFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    dateOfBirth?: Date | null
    phone?: string | null
    role?: string | null
    status?: string | null
    image?: string | null
    address?: {
      street?: string | null
      city?: string | null
      state?: string | null
      zip?: string | null
      country?: string | null
    } | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState(user.name || "")
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : ""
  )
  const [phone, setPhone] = useState(user.phone || "")
  const [street, setStreet] = useState(user.address?.street || "")
  const [city, setCity] = useState(user.address?.city || "")
  const [state, setState] = useState(user.address?.state || "")
  const [zip, setZip] = useState(user.address?.zip || "")
  const [country, setCountry] = useState(user.address?.country || "")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        dateOfBirth: dateOfBirth || null,
        phone,
        street,
        city,
        state,
        zip,
        country,
      }),
    })

    setIsLoading(false)

    if (res.ok) {
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      })
      router.refresh()
    } else {
      const errorData = await res.json()
      toast({
        title: "Error updating profile",
        description: errorData.message || "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  // Get user initials for avatar fallback
  const getInitials = (name?: string | null) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Format role for display
  const formatRole = (role?: string | null) => {
    if (!role) return "User"
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get status badge variant
  const getStatusVariant = (status?: string | null) => {
    switch (status) {
      case "active":
        return "default"
      case "invited":
        return "secondary"
      case "inactive":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            {/* Account Details */}
            <div className="flex-1 space-y-3">
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="font-medium">{user.email}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Role</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{formatRole(user.role)}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Badge variant={getStatusVariant(user.status)}>
                      {user.status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  placeholder="+1234567890"
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="pt-4 border-t">
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    disabled={isLoading}
                    placeholder="123 Main St"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={isLoading}
                    placeholder="City"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    disabled={isLoading}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal Code</Label>
                  <Input
                    id="zip"
                    type="text"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    disabled={isLoading}
                    placeholder="12345"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    disabled={isLoading}
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
