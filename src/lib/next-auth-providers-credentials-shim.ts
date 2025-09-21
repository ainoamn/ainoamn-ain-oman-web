// root: src/lib/next-auth-providers-credentials-shim.ts
// شِم لـ next-auth/providers/credentials
type Options = { name?: string; credentials?: any; authorize?: (c: any)=>Promise<any>|any };
export default function CredentialsProvider(opts: Options = {}) {
  return { type: "credentials", id: "credentials", name: opts.name || "Credentials", authorize: opts.authorize || (() => null) };
}
