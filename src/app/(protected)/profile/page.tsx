"use client"

import React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Camera, Save, Phone, Mail, User, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { LocationPicker } from "@/components/ui/location-picker"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/client"

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)

  // Fetch user profile
  const { data: profile, refetch } = api.user.getProfile.useQuery()

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    location: null as any,
    specializations: [] as string[],
    businessName: "",
    businessType: "",
  })

  // Update profile mutation
  const updateProfileMutation = api.user.updateProfile.useMutation({
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
      refetch()
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      })
    },
  })

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
        contactPhone: profile.contactPhone || "",
        contactEmail: profile.contactEmail || "",
        location: profile.location ? JSON.parse(profile.location) : null,
        specializations: profile.specializations ? JSON.parse(profile.specializations) : [],
        businessName: profile.businessName || "",
        businessType: profile.businessType || "",
      })
    }
  }, [profile])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfileMutation.mutate({
      ...formData,
      location: formData.location ? JSON.stringify(formData.location) : null,
      specializations: JSON.stringify(formData.specializations),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const addSpecialization = (spec: string) => {
    if (spec && !formData.specializations.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        specializations: [...prev.specializations, spec],
      }))
    }
  }

  const removeSpecialization = (spec: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.filter((s) => s !== spec),
    }))
  }

  if (!session) return null

  return (
    <div className="space-y-8">
      {/* Header */}
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account information and preferences</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? "outline" : "default"}>
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture & Basic Info */}
        <SlideInOnScroll direction="left">
          <Card className="glassmorphism">
            <CardContent className="p-6">
              <div className="text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-4xl">
                      {formData.name?.charAt(0) || session.user.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  {isEditing && (
                    <Button size="sm" className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <h2 className="text-2xl font-bold mb-2">{formData.name || session.user.name || "User"}</h2>
                <p className="text-muted-foreground mb-4">
                  {session.user.role === "FARMER" ? "Farmer" : session.user.role === "SELLER" ? "Seller" : "Admin"}
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{session.user.role === "FARMER" ? "12" : "8"}</div>
                    <div className="text-sm text-muted-foreground">
                      {session.user.role === "FARMER" ? "Products" : "Orders"}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.8</div>
                    <div className="text-sm text-muted-foreground">Rating</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </SlideInOnScroll>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <SlideInOnScroll direction="right">
            <Card className="glassmorphism">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name</label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <Input value={session.user.email || ""} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          name="contactPhone"
                          value={formData.contactPhone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="+250 788 123 456"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          name="contactEmail"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="contact@example.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <LocationPicker
                      value={formData.location}
                      onChange={(location) => setFormData((prev) => ({ ...prev, location }))}
                      disabled={!isEditing}
                    />
                  </div>

                  {/* Business Info (for Sellers) */}
                  {session.user.role === "SELLER" && (
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-semibold flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        Business Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Business Name</label>
                          <Input
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            placeholder="Your business name"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Business Type</label>
                          <select
                            name="businessType"
                            value={formData.businessType}
                            onChange={(e) => setFormData((prev) => ({ ...prev, businessType: e.target.value }))}
                            disabled={!isEditing}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                          >
                            <option value="">Select type</option>
                            <option value="RESTAURANT">Restaurant</option>
                            <option value="GROCERY_STORE">Grocery Store</option>
                            <option value="WHOLESALER">Wholesaler</option>
                            <option value="RETAILER">Retailer</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specializations (for Farmers) */}
                  {session.user.role === "FARMER" && (
                    <div className="space-y-4 pt-6 border-t">
                      <h3 className="text-lg font-semibold">Specializations</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {formData.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                          >
                            {spec}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeSpecialization(spec)}
                                className="ml-2 text-primary hover:text-primary/70"
                              >
                                ×
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                      {isEditing && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add specialization"
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault()
                                addSpecialization(e.currentTarget.value)
                                e.currentTarget.value = ""
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget.previousElementSibling as HTMLInputElement
                              addSpecialization(input.value)
                              input.value = ""
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {isEditing && (
                    <div className="flex justify-end space-x-4 pt-6 border-t">
                      <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="bg-gradient-primary text-white"
                      >
                        {updateProfileMutation.isPending ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </SlideInOnScroll>
        </div>
      </div>
    </div>
  )
}
