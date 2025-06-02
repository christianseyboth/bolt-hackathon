import React from "react";
import { AmbientColor } from "@/components/ambient-color";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { AuthForm } from "@/components/auth/auth-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | SecPilot | AI-Powered Email Security",
  description: "Reset your SecPilot account password to regain access to your email security dashboard.",
};

export default function ResetPasswordPage() {
  return (
    <div className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center">
      <AmbientColor />
      <Container className="flex flex-col items-center">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="w-full max-w-md bg-neutral-900/80 border border-neutral-800 rounded-xl p-8 backdrop-blur-sm">
          <AuthForm mode="reset" />
        </div>
      </Container>
    </div>
  );
}