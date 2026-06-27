import { createBrowserRouter, redirect } from "react-router";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { GitHubCallbackPage } from "./pages/GitHubCallbackPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { PricingPage } from "./pages/PricingPage";
import { B2BAdminPage } from "./pages/B2BAdminPage";
import { MyProjectsPage } from "./pages/MyProjectsPage";
import { BigTechJobsPage } from "./pages/BigTechJobsPage";
import { LearningHubPage } from "./pages/LearningHubPage";
import { BillingPage } from "./pages/BillingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { DashboardLayout } from "./layouts/DashboardLayout";

function requireAuth() {
  const token = localStorage.getItem("kryvant_token");
  if (!token) return redirect("/login");
  return null;
}

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/auth/github/callback", Component: GitHubCallbackPage },
  { path: "/onboarding", loader: requireAuth, Component: OnboardingPage },
  { path: "/pricing", Component: PricingPage },
  {
    path: "/dashboard",
    loader: requireAuth,
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardPage },
      { path: "projects", Component: MyProjectsPage },
      { path: "projects/:id", Component: ProjectDetailPage },
      { path: "jobs", Component: BigTechJobsPage },
      { path: "learning", Component: LearningHubPage },
      { path: "billing", Component: BillingPage },
      { path: "settings", Component: SettingsPage },
      { path: "b2b", Component: B2BAdminPage },
    ],
  },
]);
