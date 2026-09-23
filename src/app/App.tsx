import React, { useState, useMemo } from "react";
import { AppData, MealEntry, MealType, User, View } from "../types";
import { loadData, saveData } from "../lib/storage";
import { addOrMergeEntry, todayStr } from "../lib/utils";
import { AuthPage } from "../components/AuthPage";
import { Sidebar, BottomNav } from "../components/Sidebar";
import { DashboardView } from "../components/DashboardView";
import { MemberDetailView } from "../components/MemberDetailView";
import { FamilyMealModal } from "../components/FamilyMealModal";
import { ProductsView } from "../components/ProductsView";
import { RecipesView } from "../components/RecipesView";
import { FamilyMembersView } from "../components/FamilyMembersView";

export default function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<View>("dashboard");
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => todayStr());
  const [familyMealOpen, setFamilyMealOpen] = useState(false);

  const user = useMemo(
    () => data.users.find(u => u.id === userId) ?? null,
    [data.users, userId]
  );

  // ─── Data mutations ───────────────────────────────────────────────────────

  const updateData = (d: AppData) => {
    setData(d);
    saveData(d);
  };

  const updateUser = (u: User) =>
    updateData({ ...data, users: data.users.map(x => (x.id === u.id ? u : x)) });

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const handleLogin = (newUserId: string, newData: AppData) => {
    setData(newData);
    setUserId(newUserId);
    setView("dashboard");
    setSelectedMemberId(null);
  };

  const handleLogout = () => {
    setUserId(null);
    setView("dashboard");
    setSelectedMemberId(null);
  };

  // ─── Navigation ───────────────────────────────────────────────────────────

  const handleNav = (v: View) => {
    setView(v);
    setSelectedMemberId(null);
  };

  // ─── Family meal logging ──────────────────────────────────────────────────

  const handleFamilyMealLog = (
    entries: { memberId: string; mealType: MealType; entry: MealEntry }[]
  ) => {
    let meals = [...data.meals];
    entries.forEach(({ memberId, mealType, entry }) => {
      meals = addOrMergeEntry(meals, memberId, date, mealType, entry);
    });
    updateData({ ...data, meals });
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!userId || !user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const selectedMember = selectedMemberId
    ? user.familyMembers.find(m => m.id === selectedMemberId) ?? null
    : null;

  const renderContent = () => {
    if (selectedMember) {
      return (
        <MemberDetailView
          member={selectedMember}
          data={data}
          date={date}
          onDateChange={setDate}
          onUpdateData={updateData}
          onBack={() => setSelectedMemberId(null)}
        />
      );
    }

    switch (view) {
      case "family":
        return <FamilyMembersView user={user} onUpdateUser={updateUser} />;
      case "products":
        return (
          <ProductsView
            data={data}
            onUpdateData={updateData}
            user={user}
          />
        );
      case "recipes":
        return (
          <RecipesView
            data={data}
            onUpdateData={updateData}
            user={user}
          />
        );
      default:
        return (
          <DashboardView
            user={user}
            data={data}
            date={date}
            onDateChange={setDate}
            onSelectMember={id => {
              setSelectedMemberId(id);
              setView("dashboard");
            }}
            onAddFamilyMeal={() => setFamilyMealOpen(true)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <div className="hidden md:flex h-full">
        <Sidebar view={view} onNav={handleNav} user={user} onLogout={handleLogout} />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-8">
          {renderContent()}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <BottomNav view={view} onNav={handleNav} />
      </div>

      <FamilyMealModal
        open={familyMealOpen}
        onClose={() => setFamilyMealOpen(false)}
        familyMembers={user.familyMembers}
        data={data}
        date={date}
        onLog={entries => {
          handleFamilyMealLog(entries);
          setFamilyMealOpen(false);
        }}
      />
    </div>
  );
}