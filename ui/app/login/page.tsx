import { login, signup } from './actions';


export default function LoginPage() {
  return (
    <form className="text-white mx-auto mt-12 flex max-w-sm flex-col gap-3">
      <label htmlFor="email" className="text-sm font-medium">Email</label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        className="rounded-sm border px-3 py-2"
      />

      <label htmlFor="password" className="text-sm font-medium">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        required
        minLength={8}
        autoComplete="current-password"
        className="rounded-sm border px-3 py-2"
      />

      <div className="mt-2 flex gap-2">
        <button formAction={login}>Login</button>
        <button formAction={signup}>Sign Up</button>
      </div>
    </form>
  )
}