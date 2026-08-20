import React, { useState } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { AppData, User } from "../types";
import { loadData, saveData } from "../lib/storage";
import { uid } from "../lib/utils";
import { Button } from "./ui/Button";
import { Field, TInput } from "./ui/Fields";

interface AuthPageProps {
  onLogin: (userId: string, data: AppData) => void;
}

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=900&h=1200&fit=crop&auto=format&q=80";

export function AuthPage({ onLogin }: AuthPageProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    setError("");
    const data = loadData();

    if (mode === "login") {
      const u = data.users.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      if (!u) return setError(t('auth.invalidCredentials'));
      onLogin(u.id, data);
    } else {
      if (!name.trim()) return setError(t('auth.requiredField'));
      if (!email.includes("@")) return setError(t('auth.invalidEmail'));
      if (password.length < 6) return setError(t('auth.passwordMin'));
      if (data.users.find(u => u.email.toLowerCase() === email.toLowerCase()))
        return setError(t('auth.emailExists'));
      const u: User = {
        id: uid(),
        email: email.toLowerCase().trim(),
        name: name.trim(),
        password,
        familyMembers: [],
      };
      data.users.push(u);
      saveData(data);
      onLogin(u.id, data);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit();
  };

  const toggle = () => {
    setMode(m => (m === "login" ? "register" : "login"));
    setError("");
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      {/* Form panel */}
      <div className="flex flex-col justify-center px-8 py-16 sm:px-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="max-w-sm w-full mx-auto"
        >
          {/* Brand */}
          <div className="mb-10">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              NutriFamily
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-snug">
              {mode === "login" ? t('auth.welcomeBack') : t('auth.createAccount')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {mode === "login"
                ? t('auth.signInSubtitle')
                : t('auth.registerSubtitle')}
            </p>
          </div>

          {/* Form */}
          <div className="flex flex-col gap-4">
            {mode === "register" && (
              <Field label={t('auth.fullName')}>
                <TInput
                  value={name}
                  onChange={setName}
                  placeholder={t('auth.namePlaceholder')}
                  onKeyDown={handleKey}
                />
              </Field>
            )}
            <Field label={t('auth.email')}>
              <TInput
                value={email}
                onChange={setEmail}
                placeholder={t('auth.emailPlaceholder')}
                type="email"
                onKeyDown={handleKey}
              />
            </Field>
            <Field label={t('auth.password')}>
              <TInput
                value={password}
                onChange={setPassword}
                placeholder={t('auth.passwordPlaceholder')}
                type="password"
                onKeyDown={handleKey}
              />
            </Field>

            {error && (
              <p className="text-xs text-destructive bg-destructive/8 border border-destructive/15 px-3 py-2 rounded-md">
                {error}
              </p>
            )}

            <Button onClick={submit} size="lg" fullWidth className="mt-1">
              {mode === "login" ? t('auth.signIn') : t('auth.signUp')}
            </Button>
          </div>

          <p className="text-sm text-muted-foreground text-center mt-7">
            {mode === "login" ? t('auth.noAccount') : t('auth.hasAccount')}
            <button
              onClick={toggle}
              className="text-primary font-medium hover:underline"
            >
              {mode === "login" ? t('auth.registerNow') : t('auth.loginNow')}
            </button>
          </p>
        </motion.div>
      </div>

      {/* Image panel */}
      <div className="hidden lg:block relative bg-muted overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=400&h=260&fit=crop&auto=format&q=75"
          alt={t('auth.heroAlt')}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-12 left-10 right-10 text-white">
          <blockquote className="text-xl font-semibold leading-snug">
            {t('auth.quote')}
          </blockquote>
          <p className="text-white/60 text-sm mt-2">
            {t('auth.quoteAuthor')}
          </p>
        </div>
      </div>
    </div>
  );
}
