import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-slate-900/90 border border-slate-700",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-300",
            socialButtonsBlockButton:
              "bg-slate-800 border-slate-700 text-white hover:bg-slate-700",
            formButtonPrimary:
              "bg-gradient-to-r from-[#0e3a5f] to-[#14b8a6] hover:opacity-90",
            formFieldInput: "bg-slate-800 border-slate-700 text-white",
            formFieldLabel: "text-slate-300",
            footerActionLink: "text-[#14b8a6] hover:text-[#0e3a5f]",
          },
        }}
      />
    </div>
  );
}
