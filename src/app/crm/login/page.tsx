import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CrmLoginForm } from "@/components/crm/login-form";
import { redirectIfLoggedIn } from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "CRM Login",
  robots: { index: false, follow: false },
};

export default async function CrmLoginPage() {
  await redirectIfLoggedIn();
  const t = await getTranslations("Crm");

  return (
    <section className="bg-parchment-deep px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-[82rem] gap-10 lg:grid-cols-[1fr_29rem] lg:items-start">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-brass-deep">
            {t("kicker")}
          </p>
          <h1 className="mt-5 max-w-3xl font-display text-5xl leading-[0.95] text-oxblood sm:text-7xl">
            {t("loginTitle")}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft">
            {t("loginBody")}
          </p>
        </div>
        <CrmLoginForm />
      </div>
    </section>
  );
}
