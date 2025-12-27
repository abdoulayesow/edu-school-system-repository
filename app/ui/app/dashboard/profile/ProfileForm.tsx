// app/ui/app/dashboard/profile/ProfileForm.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    dateOfBirth?: Date | null;
    phone?: string | null;
    role?: string | null;
    address?: {
      street?: string | null;
      city?: string | null;
      state?: string | null;
      zip?: string | null;
      country?: string | null;
    } | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState(user.name || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user.dateOfBirth ? user.dateOfBirth.toISOString().split("T")[0] : "",
  );
  const [phone, setPhone] = useState(user.phone || "");
  const [street, setStreet] = useState(user.address?.street || "");
  const [city, setCity] = useState(user.address?.city || "");
  const [state, setState] = useState(user.address?.state || "");
  const [zip, setZip] = useState(user.address?.zip || "");
  const [country, setCountry] = useState(user.address?.country || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

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
    });

    setIsLoading(false);

    if (res.ok) {
      toast({
        title: "Profile updated successfully!",
        description: "Your profile information has been saved.",
      });
      router.refresh(); // Refresh the page to show updated data
    } else {
      const errorData = await res.json();
      toast({
        title: "Error updating profile.",
        description: errorData.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email (Cannot be changed)</Label>
          <Input id="email" type="email" value={user.email || ""} disabled />
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
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Address Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="street">Street</Label>
          <Input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            disabled={isLoading}
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
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">Zip Code</Label>
          <Input
            id="zip"
            type="text"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            disabled={isLoading}
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
          />
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
