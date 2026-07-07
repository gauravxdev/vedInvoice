import { getCompanySettings } from "@/app/actions/settings";
import SettingsForm from "./components/settings-form";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <SettingsForm initialData={settings} />
    </div>
  );
}
