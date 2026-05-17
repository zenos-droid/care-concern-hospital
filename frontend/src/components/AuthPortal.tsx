import { FormEvent, useState } from "react";
import type { ReactNode } from "react";
import { Lock, LogIn, Phone, UserPlus, Mail, User } from "lucide-react";
import { AuthSession, authApi, saveSession } from "../services/api";

export default function AuthPortal({ onAuthenticated }: { onAuthenticated: (session: AuthSession) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [identifier, setIdentifier] = useState("admin@careconcern.in");
  const [password, setPassword] = useState("CareConcern@123");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const session = mode === "login"
        ? await authApi.login(identifier, password)
        : await authApi.signup(fullName, phone, email, password);
      saveSession(session);
      onAuthenticated(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="portal" className="py-16 bg-white border-y border-slate-150 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5">
          <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
            Secure Hospital Portal
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mt-3 tracking-tight">
            Real-time access for patients, doctors, reception and administrators
          </h2>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed mt-4">
            Sign in to manage appointments, approvals, queue movement, records and role-based dashboards powered by the backend API.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
            {["Admin analytics", "Doctor schedule", "Reception queue", "Patient history"].map((item) => (
              <div key={item} className="bg-slate-50 border border-slate-150 rounded-xl px-3 py-2 font-bold">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-5 md:p-6">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 mb-5">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider ${mode === "login" ? "bg-sky-600 text-white" : "text-slate-500"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider ${mode === "signup" ? "bg-sky-600 text-white" : "text-slate-500"}`}
            >
              Patient Signup
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" ? (
              <>
                <Field icon={<User className="w-4 h-4" />} label="Full name" value={fullName} onChange={setFullName} placeholder="Patient full name" required />
                <Field icon={<Phone className="w-4 h-4" />} label="Mobile number" value={phone} onChange={setPhone} placeholder="10 digit mobile" required />
                <Field icon={<Mail className="w-4 h-4" />} label="Email" value={email} onChange={setEmail} placeholder="patient@example.com" />
              </>
            ) : (
              <Field icon={<Mail className="w-4 h-4" />} label="Email or phone" value={identifier} onChange={setIdentifier} placeholder="admin@careconcern.in" required />
            )}

            <Field icon={<Lock className="w-4 h-4" />} label="Password" value={password} onChange={setPassword} placeholder="Password" type="password" required />

            {error && <div className="bg-red-50 border border-red-200 text-red-800 text-xs font-semibold rounded-xl p-3">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-black py-3.5 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
              {loading ? "Please wait..." : mode === "login" ? "Enter Portal" : "Create Patient Account"}
            </button>
          </form>

          <div className="mt-5 bg-white border border-slate-150 rounded-xl p-3 text-[11px] text-slate-500">
            Seeded demo logins: admin@careconcern.in, reception@careconcern.in, doc-mukherjee@careconcern.in. Password: CareConcern@123
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false
}: {
  icon: ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
      <span className="relative block">
        <span className="absolute left-3 top-3.5 text-slate-400">{icon}</span>
        <input
          type={type}
          required={required}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </span>
    </label>
  );
}
