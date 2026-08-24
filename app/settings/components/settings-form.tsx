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

            {/* Delivery Partners Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-3 pt-2">
                <Label>Manage Delivery Partners</Label>
                <div className="grid gap-2 max-w-md">
                  {(formData.deliveryPartners || "")
                    .split(",")
                    .filter(Boolean)
                    .map((partner: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          type="text"
                          value={partner}
                          onChange={(e) => {
                            const newVal = e.target.value;
                            const partners = (formData.deliveryPartners || "").split(",").filter(Boolean);
                            partners[idx] = newVal;
                            setFormData({ ...formData, deliveryPartners: partners.join(",") });
                          }}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            const partners = (formData.deliveryPartners || "").split(",").filter(Boolean);
                            partners.splice(idx, 1);
                            setFormData({ ...formData, deliveryPartners: partners.join(",") });
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                </div>

                <div className="flex gap-2 max-w-md mt-2">
                  <Input
                    type="text"
                    placeholder="Add new delivery partner"
                    id="new-delivery-partner"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = (e.currentTarget as HTMLInputElement).value;
                        if (val !== "") {
                          const partners = (formData.deliveryPartners || "").split(",").filter(Boolean);
                          partners.push(val);
                          setFormData({ ...formData, deliveryPartners: partners.join(",") });
                          (e.currentTarget as HTMLInputElement).value = "";
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const input = document.getElementById("new-delivery-partner") as HTMLInputElement;
                      const val = input?.value;
                      if (val && val !== "") {
                        const partners = (formData.deliveryPartners || "").split(",").filter(Boolean);
                        partners.push(val);
                        setFormData({ ...formData, deliveryPartners: partners.join(",") });
                        input.value = "";
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {/* Tax Settings Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showTax"
                  checked={formData.showTax ?? true}
                  onChange={e => setFormData({...formData, showTax: e.target.checked})}
                  className="h-4 w-4 rounded border-neutral-300 text-black focus:ring-black"
                />
                <Label htmlFor="showTax" className="cursor-pointer font-medium">Show Tax on Invoices & Products</Label>
              </div>

              {(formData.showTax ?? true) && (
                <div className="space-y-3 pt-2">
                  <Label>Manage Tax Options (%)</Label>
                  <div className="grid gap-2 max-w-md">
                    {(formData.taxRates || "0,5,10,20")
                      .split(",")
                      .filter(Boolean)
                      .map((rate: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={rate}
                            onChange={(e) => {
                              const newVal = e.target.value;
                              const rates = (formData.taxRates || "0,5,10,20").split(",").filter(Boolean);
                              rates[idx] = newVal;
                              setFormData({ ...formData, taxRates: rates.join(",") });
                            }}
                            className="w-24"
                          />
                          <span className="text-sm text-neutral-500">%</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              const rates = (formData.taxRates || "0,5,10,20").split(",").filter(Boolean);
                              rates.splice(idx, 1);
                              setFormData({ ...formData, taxRates: rates.join(",") });
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      ))}
                  </div>

                  <div className="flex gap-2 max-w-xs mt-2">
                    <Input
                      type="number"
                      placeholder="Add new tax %"
                      id="new-tax-rate"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value;
                          if (val !== "") {
                            const rates = (formData.taxRates || "0,5,10,20").split(",").filter(Boolean);
                            rates.push(val);
                            setFormData({ ...formData, taxRates: rates.join(",") });
                            (e.currentTarget as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const input = document.getElementById("new-tax-rate") as HTMLInputElement;
                        const val = input?.value;
                        if (val && val !== "") {
                          const rates = (formData.taxRates || "0,5,10,20").split(",").filter(Boolean);
                          rates.push(val);
                          setFormData({ ...formData, taxRates: rates.join(",") });
                          input.value = "";
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              )}
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
