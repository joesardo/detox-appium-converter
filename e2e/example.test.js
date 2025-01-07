describe("Test", () => {
  it("should have sign up & sign in buttons", async () => {
    await device.launchApp();
    await expect(element(by.id("signUpButton"))).toBeVisible();
    await expect(element(by.id("signInButton"))).toBeVisible();
  });

  it("should show input fields when sign in button is pressed", async () => {
    await element(by.id("signUpButton")).tap();
    await expect(element(by.id("emailField"))).toBeVisible();
  });

  it("should show navigate to home screen after signing in successfully", async () => {
    await element(by.id("emailField")).typeText("test.com");
    await element(by.id("passwordField")).typeText("12345");
    await element(by.text("Continue")).tap();
    await expect(element(by.text("My Courses"))).toBeVisible();
  });
});
