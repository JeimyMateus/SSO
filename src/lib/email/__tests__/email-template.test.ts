import { renderOTPEmailTemplate } from "../templates/otp-email";

describe("OTP Email Template", () => {
  it("should render the OTP code and Conecta MINEDUC branding", () => {
    const html = renderOTPEmailTemplate("849201");

    expect(html).toContain("849201");
    expect(html).toContain("Conecta MINEDUC");
    expect(html).toContain("5 minutos");
    expect(html).toContain("verificación");
  });

  it("should format plain text fallback properly", () => {
    const html = renderOTPEmailTemplate("123456");
    expect(html).toContain("123456");
  });
});
