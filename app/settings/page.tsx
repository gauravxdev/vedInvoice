import { getCompanySettings } from "@/app/actions/settings";
import SettingsForm from "./components/settings-form";

export default async function SettingsPage() {
  const settings = await getCompanySettings();

  return (
    <div className="p-4 md:p-8">
      <SettingsForm initialData={settings} />
    </div>
  );
}
