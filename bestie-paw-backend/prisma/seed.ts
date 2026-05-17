import { PrismaClient, PetType, Gender, NeuteredStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Test1234!', 12);

  const user = await prisma.user.upsert({
    where: { email: 'test@bestiepaw.com' },
    update: {},
    create: {
      username: 'testuser',
      email: 'test@bestiepaw.com',
      passwordHash,
      emailVerified: true
    }
  });

  await prisma.pet.createMany({
    data: [
      {
        ownerId: user.id,
        name: 'Milo',
        type: PetType.DOG,
        breed: 'Corgi',
        gender: Gender.MALE,
        weightKg: 12.5,
        neutered: NeuteredStatus.YES
      },
      {
        ownerId: user.id,
        name: 'Luna',
        type: PetType.CAT,
        breed: 'British Shorthair',
        gender: Gender.FEMALE,
        weightKg: 4.3,
        neutered: NeuteredStatus.NO
      }
    ],
    skipDuplicates: true
  });
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
