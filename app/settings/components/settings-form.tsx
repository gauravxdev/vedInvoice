"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { updateCompanySettings } from "@/app/actions/settings";
import Image from "next/image";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: basic file size validation (e.g. max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Image size should be less than 2MB.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData({ ...formData, companyLogo: base64String });
        setSuccessMsg("Logo loaded successfully! Don't forget to save changes.");
        setUploading(false);
      };
      reader.onerror = () => {
        setErrorMsg("Failed to read the file.");
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setErrorMsg(`Error loading image: ${error.message || 'Unknown error'}`);
      setUploading(false);
    }
  };

  const handleSave = () => {
    setErrorMsg("");
    setSuccessMsg("");
    startTransition(async () => {
      const res = await updateCompanySettings(formData);
      if (res.success) {
        setSuccessMsg("Settings saved!");
      } else {
        setErrorMsg("Failed to save settings");
      }
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            Update your company details. These will be displayed on your invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-2xl">
            <div className="space-y-4 pb-4 border-b">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 border rounded-lg bg-neutral-50 flex items-center justify-center overflow-hidden shrink-0">
                  {formData.companyLogo ? (
                    <img src={formData.companyLogo} alt="Logo" className="object-contain h-full w-full" />
                  ) : (
                    <span className="text-sm text-neutral-400">No Logo</span>
                  )}
                </div>
                <div>
                  <div className="flex gap-2 items-center">
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} disabled={uploading} />
                    {formData.companyLogo && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setFormData({ ...formData, companyLogo: null });
                          setSuccessMsg("Logo removed. Don't forget to save changes.");
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">Upload a transparent PNG or JPG logo for your invoice header.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input value={formData.companyName || ""} onChange={e => setFormData({...formData, companyName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email || ""} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={formData.phone || ""} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>GST / Tax Number</Label>
                <Input value={formData.gstNumber || ""} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2 pb-4">
              <Label>Company Address (Displays on Invoice)</Label>
              <Input value={formData.companyAddress || ""} onChange={e => setFormData({...formData, companyAddress: e.target.value})} placeholder="e.g. L-208, Dilshad Garden, Delhi - 95" />
            </div>

            {errorMsg && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-md">{errorMsg}</div>}
            {successMsg && <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md">{successMsg}</div>}

            <Button type="button" onClick={handleSave} disabled={isPending || uploading}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
