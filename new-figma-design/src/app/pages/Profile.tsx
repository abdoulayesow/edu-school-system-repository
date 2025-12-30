import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { PageContainer } from "../components/layout"
import { ContentCard } from "../components/layout/ContentCard"
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar"
import { Badge } from "@/app/components/ui/badge"
import { Separator } from "@/app/components/ui/separator"
import { sizing } from "@/lib/design-tokens"
import { User, Mail, Phone, MapPin, Calendar, Shield, Save } from "lucide-react"

export function Profile() {
  return (
    <PageContainer maxWidth="lg">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      {/* Profile Overview Card */}
      <ContentCard className="mb-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">Admin User</h2>
              <Badge variant="default" className="gap-1">
                <Shield className={sizing.icon.xs} />
                Administrator
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className={sizing.icon.xs} />
                admin@gspn.edu
              </div>
              <div className="flex items-center gap-2">
                <Phone className={sizing.icon.xs} />
                +224 621 000 000
              </div>
              <div className="flex items-center gap-2">
                <Calendar className={sizing.icon.xs} />
                Member since September 2020
              </div>
            </div>
          </div>
          <Button variant="outline">
            Change Photo
          </Button>
        </div>
      </ContentCard>

      {/* Personal Information */}
      <ContentCard
        title="Personal Information"
        description="Update your personal details"
        className="mb-6"
      >
        <form className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" defaultValue="Admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" defaultValue="User" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" defaultValue="admin@gspn.edu" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" type="tel" defaultValue="+224 621 000 000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" defaultValue="Conakry, Guinea" />
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Save className={`${sizing.icon.sm} mr-2`} />
              Save Changes
            </Button>
          </div>
        </form>
      </ContentCard>

      {/* Account Security */}
      <ContentCard
        title="Account Security"
        description="Manage your password and security settings"
      >
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Separator />

          <div className="flex justify-end gap-4">
            <Button variant="outline">Cancel</Button>
            <Button>
              <Save className={`${sizing.icon.sm} mr-2`} />
              Update Password
            </Button>
          </div>
        </form>
      </ContentCard>
    </PageContainer>
  )
}