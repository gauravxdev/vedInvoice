"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { updateCompanySettings } from "@/app/actions/settings";
import { 
  Building2, 
  CreditCard, 
  Truck, 
  Percent, 
  Save, 
  Upload, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Mail,
  Phone,
  Receipt,
  MapPin,
  Sparkles,
  Layers
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SettingsForm({ initialData }: { initialData: any }) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState(initialData);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
        setSuccessMsg("Logo loaded! Click 'Save Changes' to apply.");
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
        setSuccessMsg("All settings have been successfully saved!");
      } else {
        setErrorMsg("Failed to save settings. Please try again.");
      }
    });
  };

  const paymentModesList = (formData.paymentModes || "Cash,PhonePe,Paytm,GPay,Amazon Pay,Card")
    .split(",")
    .map((m: string) => m.trim())
    .filter(Boolean);

  const deliveryPartnersList = (formData.deliveryPartners || "")
    .split(",")
    .map((p: string) => p.trim())
    .filter(Boolean);

  const taxRatesList = (formData.taxRates || "0,5,10,20")
    .split(",")
    .map((t: string) => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 md:p-6 rounded-xl border border-neutral-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">System & Business Settings</h1>
          <p className="text-xs md:text-sm text-neutral-500 mt-0.5">
            Configure your brand identity, payment channels, logistics, and billing rules in one place.
          </p>
        </div>
        <Button 
          type="button" 
          onClick={handleSave} 
          disabled={isPending || uploading}
          className="bg-black hover:bg-neutral-800 text-white shadow-sm px-6 h-10 shrink-0"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="flex items-center gap-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 p-4 rounded-lg shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 p-4 rounded-lg shadow-xs">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Bento 1: Company Profile (Span 2 on lg) */}
        <Card className="lg:col-span-2 shadow-sm border-neutral-200 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Company Profile & Branding</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Business credentials displayed on invoices and receipts
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs font-mono">Invoice Header</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Logo Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-neutral-50/70 border border-neutral-200/70">
                <div className="h-20 w-28 border rounded-lg bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                  {formData.companyLogo ? (
                    <img src={formData.companyLogo} alt="Logo" className="object-contain h-full w-full p-1" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-neutral-400">
                      <Upload className="h-5 w-5 mb-1" />
                      <span className="text-[10px] font-medium">No Logo</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="cursor-pointer">
                      <Input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        disabled={uploading} 
                        className="text-xs h-8 max-w-[240px] bg-white cursor-pointer" 
                      />
                    </label>
                    {formData.companyLogo && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFormData({ ...formData, companyLogo: null });
                          setSuccessMsg("Logo removed. Don't forget to save changes.");
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-8"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove Logo
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    PNG, JPG, or SVG up to 2MB. Best looks with a transparent background.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Company Name</Label>
                  <Input 
                    value={formData.companyName || ""} 
                    onChange={e => setFormData({...formData, companyName: e.target.value})} 
                    placeholder="e.g. Acme Technologies"
                    className="bg-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Email Address</Label>
                  <div className="relative">
                    <Input 
                      type="email" 
                      value={formData.email || ""} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                      placeholder="billing@company.com"
                      className="bg-white text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">Phone Number</Label>
                  <Input 
                    value={formData.phone || ""} 
                    onChange={e => setFormData({...formData, phone: e.target.value})} 
                    placeholder="+91 98765 43210"
                    className="bg-white text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-neutral-700">GST / Tax Number</Label>
                  <Input 
                    value={formData.gstNumber || ""} 
                    onChange={e => setFormData({...formData, gstNumber: e.target.value})} 
                    placeholder="e.g. 07AAAAA0000A1Z5"
                    className="bg-white text-sm uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-700">Company Address (Printed on Invoices)</Label>
                <Input 
                  value={formData.companyAddress || ""} 
                  onChange={e => setFormData({...formData, companyAddress: e.target.value})} 
                  placeholder="e.g. Suite 400, Industrial Area, Phase II, New Delhi - 110020" 
                  className="bg-white text-sm"
                />
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Bento 2: Payment Modes (Span 1) */}
        <Card className="shadow-sm border-neutral-200 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Payment Modes</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Invoice dropdown methods ({paymentModesList.length})
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {paymentModesList.map((mode: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-neutral-50 p-1.5 px-2 rounded-md border border-neutral-200/70">
                    <Input
                      type="text"
                      value={mode}
                      onChange={(e) => {
                        const newVal = e.target.value;
                        const modes = [...paymentModesList];
                        modes[idx] = newVal;
                        setFormData({ ...formData, paymentModes: modes.join(",") });
                      }}
                      className="h-7 text-xs bg-white flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      className="text-neutral-400 hover:text-red-600 hover:bg-red-50 h-7 w-7"
                      onClick={() => {
                        const modes = [...paymentModesList];
                        modes.splice(idx, 1);
                        setFormData({ ...formData, paymentModes: modes.join(",") });
                      }}
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1 border-t border-neutral-100">
                <Input
                  type="text"
                  placeholder="Add mode (e.g. RTGS)"
                  id="new-payment-mode"
                  className="h-8 text-xs bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val !== "" && !paymentModesList.includes(val)) {
                        setFormData({ ...formData, paymentModes: [...paymentModesList, val].join(",") });
                        (e.currentTarget as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={() => {
                    const input = document.getElementById("new-payment-mode") as HTMLInputElement;
                    const val = input?.value?.trim();
                    if (val && val !== "" && !paymentModesList.includes(val)) {
                      setFormData({ ...formData, paymentModes: [...paymentModesList, val].join(",") });
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </div>

          <div className="p-4 pt-0">
            <div className="flex flex-wrap gap-1 p-2 rounded bg-neutral-100/60 border border-neutral-200/50">
              <span className="text-[10px] text-neutral-400 font-medium block w-full mb-0.5">Active Options:</span>
              {paymentModesList.map((m: string, i: number) => (
                <span key={i} className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border text-neutral-700">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Bento 3: Delivery Partners (Span 1) */}
        <Card className="shadow-sm border-neutral-200 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Delivery Partners</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Couriers & dispatch channels ({deliveryPartnersList.length})
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {deliveryPartnersList.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic py-2 text-center">No delivery partners added</p>
                ) : (
                  deliveryPartnersList.map((partner: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 bg-neutral-50 p-1.5 px-2 rounded-md border border-neutral-200/70">
                      <Input
                        type="text"
                        value={partner}
                        onChange={(e) => {
                          const newVal = e.target.value;
                          const partners = [...deliveryPartnersList];
                          partners[idx] = newVal;
                          setFormData({ ...formData, deliveryPartners: partners.join(",") });
                        }}
                        className="h-7 text-xs bg-white flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-neutral-400 hover:text-red-600 hover:bg-red-50 h-7 w-7"
                        onClick={() => {
                          const partners = [...deliveryPartnersList];
                          partners.splice(idx, 1);
                          setFormData({ ...formData, deliveryPartners: partners.join(",") });
                        }}
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-2 pt-1 border-t border-neutral-100">
                <Input
                  type="text"
                  placeholder="Add partner (e.g. Bluedart)"
                  id="new-delivery-partner"
                  className="h-8 text-xs bg-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.currentTarget as HTMLInputElement).value.trim();
                      if (val !== "" && !deliveryPartnersList.includes(val)) {
                        setFormData({ ...formData, deliveryPartners: [...deliveryPartnersList, val].join(",") });
                        (e.currentTarget as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0"
                  onClick={() => {
                    const input = document.getElementById("new-delivery-partner") as HTMLInputElement;
                    const val = input?.value?.trim();
                    if (val && val !== "" && !deliveryPartnersList.includes(val)) {
                      setFormData({ ...formData, deliveryPartners: [...deliveryPartnersList, val].join(",") });
                      input.value = "";
                    }
                  }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </CardContent>
          </div>

          <div className="p-4 pt-0">
            <div className="flex flex-wrap gap-1 p-2 rounded bg-neutral-100/60 border border-neutral-200/50">
              <span className="text-[10px] text-neutral-400 font-medium block w-full mb-0.5">Active Partners:</span>
              {deliveryPartnersList.map((p: string, i: number) => (
                <span key={i} className="text-[10px] font-medium bg-white px-1.5 py-0.5 rounded border text-neutral-700">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* Bento 4: Tax & Invoicing Rules (Span 2 on lg) */}
        <Card className="lg:col-span-2 shadow-sm border-neutral-200 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
                    <Percent className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Tax & Billing Configuration</CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      Enable tax calculation and configure preset GST/tax slabs
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-lg bg-neutral-50 border border-neutral-200/70">
                <div className="space-y-0.5">
                  <Label htmlFor="showTax" className="text-sm font-semibold text-neutral-900 cursor-pointer">
                    Show Tax on Invoices & Products
                  </Label>
                  <p className="text-xs text-neutral-500">
                    When enabled, tax columns, subtotals, and calculations will appear on invoices.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="showTax"
                  checked={formData.showTax ?? true}
                  onChange={e => setFormData({...formData, showTax: e.target.checked})}
                  className="h-5 w-5 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                />
              </div>

              {(formData.showTax ?? true) && (
                <div className="space-y-3 pt-1">
                  <Label className="text-xs font-semibold text-neutral-700">Preset Tax Rates (%)</Label>
                  <div className="flex flex-wrap items-center gap-2">
                    {taxRatesList.map((rate: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-1 bg-white pl-2.5 pr-1 py-1 rounded-md border border-neutral-300 shadow-2xs">
                        <span className="font-mono text-xs font-semibold text-neutral-800">{rate}%</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="text-neutral-400 hover:text-red-600 h-5 w-5 ml-1"
                          onClick={() => {
                            const rates = [...taxRatesList];
                            rates.splice(idx, 1);
                            setFormData({ ...formData, taxRates: rates.join(",") });
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 max-w-xs pt-1">
                    <Input
                      type="number"
                      placeholder="Add tax % (e.g. 18)"
                      id="new-tax-rate"
                      className="h-8 text-xs bg-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.currentTarget as HTMLInputElement).value.trim();
                          if (val !== "" && !taxRatesList.includes(val)) {
                            setFormData({ ...formData, taxRates: [...taxRatesList, val].join(",") });
                            (e.currentTarget as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs shrink-0"
                      onClick={() => {
                        const input = document.getElementById("new-tax-rate") as HTMLInputElement;
                        const val = input?.value?.trim();
                        if (val && val !== "" && !taxRatesList.includes(val)) {
                          setFormData({ ...formData, taxRates: [...taxRatesList, val].join(",") });
                          input.value = "";
                        }
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Tax %
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </div>

          <div className="p-4 pt-0">
            <p className="text-[11px] text-neutral-400">
              Tax rates added here will appear in the quick tax selector during invoice creation.
            </p>
          </div>
        </Card>

      </div>
    </div>
  );
}
