"use client";

import React, { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import {
  Camera,
  Save,
  Phone,
  Mail,
  User,
  Building,
  Leaf,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { LocationPicker } from "@/components/ui/location-picker";
import { FadeIn } from "@/components/animations/fade-in";
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/trpc/client";
import { FarmCapacity } from "@prisma/client"; // Assuming this is available, or use string literals

// Define a type for the form data for better type safety
type ProfileFormData = {
  name: string;
  description: string;
  contactPhone: string;
  contactEmail: string;
  location: {
    district: string;
    province: string;
    sector: string;
    address?: string;
  } | null;
  // Farmer specific
  specializations: string[]; // Maps to 'certifications' on the backend
  farmName: string;
  farmLocationDetails: string;
  farmCapacity: FarmCapacity;
  // Seller specific
  businessName: string;
  deliveryOptions: string[];
};

export default function ProfilePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile
  const {
    data: profile,
    refetch,
    isLoading: isProfileLoading,
  } = api.user.getProfile.useQuery(undefined, {
    enabled: !!session, // Only fetch if session exists
  });

  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    location: null,
    specializations: [],
    farmName: "",
    farmLocationDetails: "",
    farmCapacity: "SMALL",
    businessName: "",
    deliveryOptions: [],
  });

  // Centralized mutation handling
  const handleMutationSuccess = (title: string) => {
    toast({
      title,
      description: "Your profile has been successfully updated.",
    });
    refetch();
  };

  const handleMutationError = (error: any) => {
    toast({
      title: "Update Failed",
      description: error.message || "An unexpected error occurred.",
      variant: "destructive",
    });
  };

  // Define all necessary mutations
  const updateProfileMutation = api.user.updateProfile.useMutation();
  const updateFarmerProfileMutation =
    api.user.updateFarmerProfile.useMutation();
  const updateSellerProfileMutation =
    api.user.updateSellerProfile.useMutation();

  // Combined loading state for all mutations
  const isUpdating =
    updateProfileMutation.isPending ||
    updateFarmerProfileMutation.isPending ||
    updateSellerProfileMutation.isPending;

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
        contactPhone: profile.contactPhone || "",
        contactEmail: profile.contactEmail || "",
        location: profile.location ? JSON.parse(profile.location) : null,
        // Farmer-specific fields (from nested farmerProfile)
        specializations: profile.farmerProfile?.certifications || [],
        farmName: profile.farmerProfile?.farmName || "",
        farmLocationDetails: profile.farmerProfile?.farmLocationDetails || "",
        farmCapacity: profile.farmerProfile?.farmCapacity || "SMALL",
        // Seller-specific fields (from nested sellerProfile)
        businessName: profile.sellerProfile?.businessName || "",
        deliveryOptions: profile.sellerProfile?.deliveryOptions || [],
      });
    }
  }, [profile]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!session) {
      toast({
        title: "Not Authenticated",
        description: "You must be logged in.",
        variant: "destructive",
      });
      return;
    }

    const mutationPromises = [];

    // 1. Update base profile
    mutationPromises.push(
      updateProfileMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        location: formData.location ?? undefined, // Pass object directly, handle null
      })
    );

    // 2. Conditionally update role-specific profile
    if (session.user.role === "FARMER") {
      mutationPromises.push(
        updateFarmerProfileMutation.mutateAsync({
          farmName: formData.farmName,
          farmLocationDetails: formData.farmLocationDetails,
          farmCapacity: formData.farmCapacity,
          certifications: formData.specializations,
          bio: formData.description,
        })
      );
    } else if (session.user.role === "SELLER") {
      mutationPromises.push(
        updateSellerProfileMutation.mutateAsync({
          businessName: formData.businessName,
          deliveryOptions: formData.deliveryOptions,
        })
      );
    }

    try {
      await Promise.all(mutationPromises);
      handleMutationSuccess("Profile Updated");
      setIsEditing(false);
    } catch (error) {
      handleMutationError(error);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addToArrayField = (field: keyof ProfileFormData, value: string) => {
    if (
      value &&
      Array.isArray(formData[field]) &&
      !(formData[field] as string[]).includes(value)
    ) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value],
      }));
    }
  };

  const removeFromArrayField = (
    field: keyof ProfileFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  if (isProfileLoading) return <div>Loading profile...</div>;
  if (!session) return <div>Access Denied. Please log in.</div>;

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant={isEditing ? "outline" : "default"}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </Button>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <SlideInOnScroll direction="left">
          <Card className="glassmorphism">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {formData.name?.charAt(0) ||
                      session.user.name?.charAt(0) ||
                      "U"}
                  </span>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {formData.name || session.user.name || "User"}
              </h2>
              <p className="text-muted-foreground mb-4 capitalize">
                {session.user.role.toLowerCase()}
              </p>
            </CardContent>
          </Card>
        </SlideInOnScroll>

        <div className="lg:col-span-2 space-y-6">
          <SlideInOnScroll direction="right">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="glassmorphism">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your full name"
                      aria-label="Full Name"
                    />
                    <Input
                      value={session.user.email || ""}
                      disabled
                      className="bg-muted"
                      aria-label="Email"
                    />
                  </div>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                    aria-label="Description"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Phone Number"
                      
                    />
                    <Input
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Contact Email"
                      
                    />
                  </div>
                  <LocationPicker
                    value={formData.location}
                    onChange={(loc) =>
                      setFormData((p) => ({ ...p, location: loc }))
                    }
                    disabled={!isEditing}
                  />
                </CardContent>
              </Card>

              {session.user.role === "FARMER" && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Leaf className="w-5 h-5 mr-2" />
                      Farmer Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="farmName"
                        value={formData.farmName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder="Farm Name"
                      />
                      <select
                        name="farmCapacity"
                        value={formData.farmCapacity}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="SMALL">Small Capacity</option>
                        <option value="MEDIUM">Medium Capacity</option>
                        <option value="LARGE">Large Capacity</option>
                      </select>
                    </div>
                    <Textarea
                      name="farmLocationDetails"
                      value={formData.farmLocationDetails}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Detailed farm location (e.g., near market)"
                    />
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Specializations (Certifications)
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.specializations.map((spec) => (
                          <span
                            key={spec}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary"
                          >
                            {spec}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeFromArrayField("specializations", spec)
                                }
                                className="ml-2 font-bold hover:text-red-500"
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
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addToArrayField(
                                  "specializations",
                                  e.currentTarget.value
                                );
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              addToArrayField("specializations", input.value);
                              input.value = "";
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {session.user.role === "SELLER" && (
                <Card className="glassmorphism">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="w-5 h-5 mr-2" />
                      Business Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Input
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your business name"
                    />
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Delivery Options
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {formData.deliveryOptions.map((opt) => (
                          <span
                            key={opt}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-500/10 text-blue-600"
                          >
                            {opt}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeFromArrayField("deliveryOptions", opt)
                                }
                                className="ml-2 font-bold hover:text-red-500"
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
                            placeholder="Add delivery option (e.g., Home Delivery)"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                addToArrayField(
                                  "deliveryOptions",
                                  e.currentTarget.value
                                );
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              addToArrayField("deliveryOptions", input.value);
                              input.value = "";
                            }}
                          >
                            Add
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {isEditing && (
                <div className="flex justify-end space-x-4 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isUpdating}
                    className="bg-gradient-primary text-white"
                  >
                    {isUpdating ? (
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
          </SlideInOnScroll>
        </div>
      </div>
    </div>
  );
}
