import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getTeamForUser, getUser } from '@/lib/db/queries';

export default function DashboardPage() {
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Dashboard
      </h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-500">
            Manage your team, subscription, and account settings from this dashboard.
          </p>
        </div>
      </div>
    </section>
  );
}
