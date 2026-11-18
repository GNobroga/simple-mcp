import { PasswordHasher } from "../lib/password-hasher.js";
import { prisma } from "./prisma.js";

try {
  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name: "Administrator",
        username: "admin",
        passwordHash: await PasswordHasher.hash("admin"),
      },
    });

    await tx.post.create({
      data: {
        title: "My first post",
        description: "The content of the post",
        userId: user.id,
        comments: {
          create: [
            {
              content: "Hello, this is my first comment in this post",
              authorId: user.id,
            },
          ],
        },
      },
    });
  });

  console.log("Seed executado com sucesso!");
} catch (error) {
  console.error("Erro ao executar seed:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}