import { expect, test } from "@playwright/test";
import { SESSION_KEY, signInAs } from "./helpers";

test.describe("sign in", () => {
  test("rejects a bad email", async ({ page }) => {
    await page.goto("/signin");
    await page.getByTestId("email").fill("not-an-email");
    await page.getByTestId("submit").click();
    await expect(page.getByTestId("email-error")).toBeVisible();
    await expect(page).toHaveURL(/\/signin/);
  });

  test("signs in as organizer and lands on the dashboard", async ({ page }) => {
    await page.goto("/signin");
    await page.getByTestId("email").fill("asha@deccansports.in");
    await page.getByTestId("role-organizer").click();
    await page.getByTestId("submit").click();

    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  });

  test("signs in as admin and lands on the admin panel", async ({ page }) => {
    await page.goto("/signin");
    await page.getByTestId("email").fill("ops@smidig.app");
    await page.getByTestId("role-admin").click();
    await page.getByTestId("submit").click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Platform overview" })).toBeVisible();
  });

  test("returns to the page that required sign-in", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page).toHaveURL(/\/signin\?next=/);

    await page.getByTestId("email").fill("asha@deccansports.in");
    await page.getByTestId("role-organizer").click();
    await page.getByTestId("submit").click();

    await expect(page).toHaveURL(/\/dashboard\/orders$/);
  });

  test("signup page links back to signin", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await page.getByRole("link", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/signin$/);
  });
});

test.describe("guards", () => {
  test("dashboard redirects a signed-out visitor", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/signin\?next=%2Fdashboard/);
  });

  test("admin redirects a signed-out visitor", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/signin\?next=%2Fadmin/);
  });

  test("organizer cannot open the admin panel", async ({ page }) => {
    await signInAs(page, "organizer");
    await page.goto("/admin");
    await expect(page).toHaveURL(/denied=1/);
    await expect(page.getByTestId("denied-notice")).toBeVisible();
  });

  test("admin cannot open the organizer dashboard", async ({ page }) => {
    await signInAs(page, "admin");
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/denied=1/);
  });
});

test.describe("account menu", () => {
  test("shows Sign in when signed out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("nav-signin")).toBeVisible();
  });

  test("opens, shows the role, and signs out", async ({ page }) => {
    await signInAs(page, "spectator", "fan@example.com");
    await page.goto("/");

    await page.getByTestId("account-button").click();
    await expect(page.getByTestId("account-menu")).toBeVisible();
    await expect(page.getByText("Spectator")).toBeVisible();

    await page.getByTestId("sign-out").click();
    await expect(page.getByTestId("nav-signin")).toBeVisible();

    const stored = await page.evaluate((k) => localStorage.getItem(k), SESSION_KEY);
    expect(stored).toBeNull();
  });
});

test.describe("onboarding", () => {
  test("picking a role routes to that role's home", async ({ page }) => {
    await signInAs(page, "spectator");
    await page.goto("/onboarding");
    await page.getByTestId("onboard-organizer").click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
