import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Shield, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const DEMO_HINTS = {
  rescue_team: { phone: "9000000002", password: "demo1234", label: "Rescue Team demo" },
  authority: { phone: "9000000003", password: "demo1234", label: "Authority demo" },
};

export default function LoginPage() {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "rescue_team";
  const hint = DEMO_HINTS[role] || DEMO_HINTS.rescue_team;

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userInfo = await login(phone, password);
      if (userInfo.role === "rescue_team" || userInfo.role === "authority") {
        navigate("/rescue");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = () => {
    setPhone(hint.phone);
    setPassword(hint.password);
  };

  return (
    <div className="min-h-screen bg-bg-base flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg p-6 shadow-md">
        <div className="flex flex-col items-center mb-6">
          <Shield className="text-gov-blue mb-2" size={36} strokeWidth={2.5} aria-hidden="true" />
          <h1 className="text-xl font-bold text-text-primary">{t.appName}</h1>
          <p className="text-sm text-text-secondary mt-1 capitalize">{role.replace("_", " ")} sign in</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-text-primary mb-1">
              Phone number
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full min-h-tap px-3 rounded-lg border-2 border-border focus:border-gov-blue outline-none"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full min-h-tap px-3 rounded-lg border-2 border-border focus:border-gov-blue outline-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-emergency-dark bg-emergency-light rounded-lg p-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="min-h-tap bg-gov-blue hover:bg-gov-blue-dark disabled:opacity-50 text-white font-bold rounded-lg"
          >
            {loading ? t.common.loading : t.landing.signIn}
          </button>
        </form>

        <button
          onClick={fillDemo}
          className="w-full text-center text-sm font-semibold text-gov-blue mt-4 min-h-tap"
        >
          Use {hint.label} credentials
        </button>
      </div>
    </div>
  );
}
