/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `adoption_candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cpf]` on the table `adoption_candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `adoption_candidates` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `adoption_candidates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "adoption_candidates" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "adoption_candidates_email_key" ON "adoption_candidates"("email");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_candidates_cpf_key" ON "adoption_candidates"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "adoption_candidates_userId_key" ON "adoption_candidates"("userId");

-- AddForeignKey
ALTER TABLE "adoption_candidates" ADD CONSTRAINT "adoption_candidates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
