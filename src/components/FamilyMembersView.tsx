import React, { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { FamilyMember, Sex, ActivityLevel, User } from "../types";
import { calcTDEE, getCalGoal, getMacroGoals, uid, ACTIVITY_OPTIONS, MEMBER_COLORS } from "../lib/utils";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { Field, TInput, NInput, Sel } from "./ui/Fields";
import { MemberAvatar } from "./ui/MemberAvatar";

interface FamilyMembersViewProps {
  user: User;
  onUpdateUser: (u: User) => void;
}

type MemberForm = {
  name: string; age: string; weight: string; height: string;
  sex: Sex; activityLevel: ActivityLevel; customCalorieGoal: string; color: string;
};

const emptyForm: MemberForm = {
  name: "", age: "30", weight: "70", height: "170",
  sex: "female", activityLevel: "moderate", customCalorieGoal: "", color: MEMBER_COLORS[0],
};

export function FamilyMembersView({ user, onUpdateUser }: FamilyMembersViewProps) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberForm>(emptyForm);

  const setF = (k: keyof MemberForm, v: string) =>
    setForm(f => ({ ...f, [k]: v }));

  const tdeePreview = (() => {
    const age = parseInt(form.age);
    const weight = parseFloat(form.weight);
    const height = parseFloat(form.height);
    if (!age || !weight || !height) return null;
    const b = 10 * weight + 6.25 * height - 5 * age + (form.sex === "male" ? 5 : -161);
    const multi: Record<string, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, very: 1.725, extra: 1.9 };
    return Math.round(b * multi[form.activityLevel]);
  })();

  const openAdd = () => {
    const usedColors = user.familyMembers.map(m => m.color);
    const availColor = MEMBER_COLORS.find(c => !usedColors.includes(c)) ?? MEMBER_COLORS[0];
    setForm({ ...emptyForm, color: availColor });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (m: FamilyMember) => {
    setForm({
      name: m.name, age: String(m.age), weight: String(m.weight), height: String(m.height),
      sex: m.sex, activityLevel: m.activityLevel,
      customCalorieGoal: m.customCalorieGoal ? String(m.customCalorieGoal) : "",
      color: m.color,
    });
    setEditId(m.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    const m: FamilyMember = {
      id: editId ?? uid(),
      name: form.name.trim(),
      age: parseInt(form.age) || 25,
      weight: parseFloat(form.weight) || 70,
      height: parseFloat(form.height) || 170,
      sex: form.sex,
      activityLevel: form.activityLevel,
      customCalorieGoal: form.customCalorieGoal ? parseInt(form.customCalorieGoal) : undefined,
      color: form.color,
    };
    onUpdateUser({
      ...user,
      familyMembers: editId
        ? user.familyMembers.map(x => x.id === editId ? m : x)
        : [...user.familyMembers, m],
    });
    setShowForm(false);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-foreground">Family Members</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.familyMembers.length} members
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus size={13} /> Add Member
        </Button>
      </div>

      {user.familyMembers.length === 0 && (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <img
            src="https://images.unsplash.com/photo-1609220136736-443140cffec6?w=300&h=200&fit=crop&auto=format&q=75"
            alt="Family"
            className="w-36 h-24 object-cover rounded-lg mx-auto mb-4 opacity-80"
          />
          <p className="font-semibold text-foreground">No family members yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add members to calculate their daily calorie and macro goals.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {user.familyMembers.map(m => {
          const tdee = calcTDEE(m);
          const cg = getCalGoal(m);
          const mg = getMacroGoals(m);
          return (
            <div key={m.id} className="bg-card rounded-xl border border-border p-4 flex items-start gap-3">
              <MemberAvatar member={m} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-foreground">{m.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {m.age} y · {m.weight} kg · {m.height} cm · {m.sex}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  TDEE {tdee} kcal · Goal {cg} kcal
                  {m.customCalorieGoal && <span className="text-primary ml-1">(custom)</span>}
                </div>
                <div className="flex gap-2.5 mt-2 text-xs tabular-nums">
                  <span className="text-blue-600">P {mg.protein}g</span>
                  <span className="text-amber-600">F {mg.fat}g</span>
                  <span className="text-orange-600">C {mg.carbs}g</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(m)}
                  className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() =>
                    onUpdateUser({ ...user, familyMembers: user.familyMembers.filter(x => x.id !== m.id) })
                  }
                  className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editId ? "Edit Member" : "Add Family Member"}
        footer={
          <>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editId ? "Save Changes" : "Add Member"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {/* Avatar color picker */}
          <Field label="Avatar Color">
            <div className="flex gap-2 flex-wrap">
              {MEMBER_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setF("color", color)}
                  className="w-8 h-8 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: color, outline: form.color === color ? `2px solid ${color}` : "none", outlineOffset: 2 }}
                />
              ))}
            </div>
            {/* Preview */}
            <div className="flex items-center gap-2 mt-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: form.color }}>
                {(form.name || "A")[0].toUpperCase()}
              </div>
              <span className="text-xs text-muted-foreground">Preview</span>
            </div>
          </Field>

          <Field label="Full Name">
            <TInput value={form.name} onChange={v => setF("name", v)} placeholder="Member's name" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Age">
              <NInput value={form.age} onChange={v => setF("age", v)} min={1} max={120} />
            </Field>
            <Field label="Weight (kg)">
              <NInput value={form.weight} onChange={v => setF("weight", v)} min={1} step={0.5} />
            </Field>
            <Field label="Height (cm)">
              <NInput value={form.height} onChange={v => setF("height", v)} min={50} max={250} />
            </Field>
          </div>

          <Field label="Sex">
            <Sel value={form.sex} onChange={v => setF("sex", v)}>
              <option value="female">Female</option>
              <option value="male">Male</option>
            </Sel>
          </Field>

          <Field label="Activity Level">
            <Sel value={form.activityLevel} onChange={v => setF("activityLevel", v)}>
              {ACTIVITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Sel>
          </Field>

          <Field
            label="Custom Calorie Goal (optional)"
            hint={tdeePreview ? `Calculated TDEE: ${tdeePreview} kcal/day` : undefined}
          >
            <NInput
              value={form.customCalorieGoal}
              onChange={v => setF("customCalorieGoal", v)}
              placeholder={tdeePreview ? String(tdeePreview) : "Leave blank to use TDEE"}
              min={500}
            />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
