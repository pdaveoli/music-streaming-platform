import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="w-full min-h-screen bg-[url(/loginBackgroundImg.jpg)] bg-cover bg-center bg-no-repeat">
      <div className="flex min-h-screen w-full items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm">
          <LoginForm className="isolate backdrop-blur-lg rounded-xl bg-white/40 dark:bg-black/40 shadow-lg ring-1 ring-black/5" />
        </div>
      </div>
    </div>
  );
}
