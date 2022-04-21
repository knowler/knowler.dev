import mail from "@sendgrid/mail";
import invariant from 'tiny-invariant';

invariant(process.env.SENDGRID_API_KEY, 'SENDGRID_API_KEY must be set.');
invariant(process.env.VERIFIER_API_KEY, 'VERIFIER_API_KEY must be set.');

mail.setApiKey(process.env.SENDGRID_API_KEY as string);

export default mail;

export async function verifyEmail(email: string) {
  const verifierEndpoint = new URL(
    email,
    "https://verifier.meetchopra.com/verify/"
  );
  verifierEndpoint.searchParams.set(
    "token",
    process.env.VERIFIER_API_KEY as string
  );
  const response = await fetch(verifierEndpoint.toString());
  const verifierResult = await response.json();
  return verifierResult.status;
}
