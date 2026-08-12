import { useState, type SyntheticEvent } from "react";
import { ArrowRight, BookOpenText } from "lucide-react";
import { getSupabase, supabaseConfigured } from "../lib/supabase";

interface Props {
  initialError?: string;
}

export default function LoginScreen({ initialError }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(initialError ?? "");
  const [loading, setLoading] = useState(false);

  const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabaseConfigured) return;
    setLoading(true);
    setError("");
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) setError("邮箱或密码不正确");
    setLoading(false);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-mark"><BookOpenText size={22} /></div>
        <p className="login-kicker">DYSTATE</p>
        <h1>Log Studio</h1>
        <p className="login-intro">一个安静的 Markdown 日志工作区。</p>

        {!supabaseConfigured ? (
          <div className="config-warning">
            <strong>还差一步配置</strong>
            <span>复制 <code>.env.example</code> 为 <code>.env</code>，填写 Supabase URL 和匿名密钥。</span>
          </div>
        ) : (
          <form onSubmit={submit}>
            <label>
              <span>邮箱</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label>
              <span>密码</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
            </label>
            {error && <p className="login-error">{error}</p>}
            <button className="primary-button login-submit" disabled={loading}>
              {loading ? "登录中…" : "进入工作区"}<ArrowRight size={17} />
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
