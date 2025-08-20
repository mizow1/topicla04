import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif mb-2">SEO Cluster Pro</h1>
          <p className="text-muted-foreground">トピッククラスター理論に基づくSEO記事作成支援ツール</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
