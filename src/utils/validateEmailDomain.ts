import dns from "dns/promises";

export const validateEmailDomain = async (email: string) => {
  const domain = email.split("@")[1];
  if (!domain) {
    throw new Error("Invalid email format");
  }
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      throw new Error("Email domain does not have MX records");
    }
    return true;
  } catch (error) {
    throw new Error(`Invalid email domain: ${domain}`);
  }
};
