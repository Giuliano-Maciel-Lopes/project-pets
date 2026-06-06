import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaRepositoriesUser } from "./prisma/repositories.ts/prisma-rep-user";
import { RepositoriesUser } from "@/domain/account/application/repositories/repositoriesUser";
import { PrismaRepositoriesUnit } from "./prisma/repositories.ts/prisma-rep-unit";
import { RepositoriesUnits } from "@/domain/companyUnits/application/repositories/unitsRepositories";
import { PrismaRepositoriesPets } from "./prisma/repositories.ts/prisma-rep-pets";
import { RepositoriesPets } from "@/domain/pets/application/repositories/pets";
import { PrismaRepositoryPetAttachments } from "./prisma/repositories.ts/prisma-rep-pets-Attachement";
import { RepositoryPetAttachments } from "@/domain/pets/application/repositories/petsAttachement";
import { PrismaAttachmentRepository } from "./prisma/repositories.ts/prisma-rep-attachment";
import { AttachmentRepository } from "@/domain/Attachment/application/repositories/attachment-repository";
import { PrismaRepositoriesAdoption } from "./prisma/repositories.ts/prisma-rep-adoptions";
import { RepositoriesAdoption } from "@/domain/adoption/application/repositories/adoption";
import { PrismaRepositoriesAdoptionCandidate } from "./prisma/repositories.ts/prisma-rep-adoptionCandidate";
import { RepositoriesAdoptionCandidate } from "@/domain/adoption/application/repositories/adoptioncandidate";

const DatabaseUtils = [
  PrismaService,
  { provide: RepositoriesUser, useClass: PrismaRepositoriesUser },
  { provide: RepositoriesUnits, useClass: PrismaRepositoriesUnit },
  { provide: RepositoriesPets, useClass: PrismaRepositoriesPets },
  { provide: RepositoryPetAttachments, useClass: PrismaRepositoryPetAttachments },
  { provide: AttachmentRepository, useClass: PrismaAttachmentRepository },
  { provide: RepositoriesAdoption, useClass: PrismaRepositoriesAdoption },
  { provide: RepositoriesAdoptionCandidate, useClass: PrismaRepositoriesAdoptionCandidate },
];


@Module({
    providers:[...DatabaseUtils],
    exports:[...DatabaseUtils]
})
export class DataBaseModule{}