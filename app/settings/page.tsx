import { getCompanySettings } from "@/app/actions/settings";
import SettingsForm from "./components/settings-form";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
