import { db } from "../../../../lib/prisma";
import { userSelect } from "../../user.selects";
import { AdminRole, CustomerRole } from "../../../../lib/roles";

interface GoogleProfile {
  id: string;
  email: string;
  given_name?: string;
  family_name?: string;
}

export const handleGoogleCallback = async (profile: GoogleProfile) => {
  let user = await db.user.findFirst({
    where: {
      OR: [
        { googleId: profile.id },
        { email: profile.email }
      ],
      deletedAt: null
    },
    select: { ...userSelect, googleId: true }
  });

  if (user && !user.googleId) {
    user = await db.user.update({
      where: { id: user.id },
      data: { googleId: profile.id },
      select: { ...userSelect, googleId: true }
    });
  }

  if (!user) {
    const newUser = await createUserFromGoogle(profile);
    return {
      id: newUser.id,
      username: newUser.username,
      phone: newUser.phone,
      email: newUser.email,
      adminRole: newUser.adminRole,
      customerRole: newUser.customerRole,
      phoneVerified: newUser.phoneVerified
    };
  }

  const updatedUser = await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
    select: userSelect
  });

  return updatedUser;
};

export const createUserFromGoogle = async (profile: GoogleProfile) => {
  const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
  let username = baseUsername;
  let counter = 1;

  while (await db.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  const user = await db.user.create({
    data: {
      username,
      phone: null,
      email: profile.email,
      googleId: profile.id,
      firstName: profile.given_name,
      lastName: profile.family_name,
      phoneVerified: false,
      emailVerified: true,
      passwordHash: null,
      adminRole: AdminRole.CUSTOMER,
      customerRole: CustomerRole.MEMBER,
    }
  });

  return user;
};
