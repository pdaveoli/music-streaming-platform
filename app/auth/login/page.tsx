import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-[url(/loginBackgroundImg.jpg)] bg-cover bg-center bg-no-repeat">
      <div className="w-full h-full background-[rgba(0,0,0,0.5)] backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-clear">
          <LoginForm className="isolate backdrop-blur-lg rounded-xl bg-white/40 dark:bg-black/40 shadow-lg ring-1 ring-black/5" />
        </div>
      </div>
    </div>
  );
}
