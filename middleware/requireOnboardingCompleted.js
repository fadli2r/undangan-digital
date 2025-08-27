import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export async function requireOnboardingCompleted(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false
      }
    };
  }

  await dbConnect();
  const user = await User.findOne({ email: session.user.email });

  if (!user || !user.hasCompletedOnboarding) {
    return {
      redirect: {
        destination: `/onboarding/${getStepPath(user.onboardingStep || 1)}`,
        permanent: false
      }
    };
  }

  return null;
}

function getStepPath(step) {
  switch (step) {
    case 1: return "paket";
    case 2: return "data";
    case 3: return "summary";
    default: return "paket";
  }
}
