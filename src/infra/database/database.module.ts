import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaRepositoriesUser } from "./prisma/repositories.ts/prisma-rep-user";
import { RepositoriesUser } from "@/domain/account/application/repositories/repositoriesUser";
import { PrismaRepositoriesUnit } from "./prisma/repositories.ts/prisma-rep-unit";
import { RepositoriesUnits } from "@/domain/companyUnits/application/repositories/unistsRepositories";
import { PrismaRepositoriesPets } from "./prisma/repositories.ts/pisma-rep-pets";
import { RepositoriesPets } from "@/domain/pets/application/repositories/pets";
import { PrismaRepositoryPetAttachments } from "./prisma/repositories.ts/prisma-rep-pets-Attachement";
import { RepositoryPetAttachments } from "@/domain/pets/application/repositories/petsAttachement";

const DatabaseUtils = [
  PrismaService,
  { provide: RepositoriesUser, useClass: PrismaRepositoriesUser },
  { provide: RepositoriesUnits, useClass: PrismaRepositoriesUnit },
  { provide: RepositoriesPets, useClass: PrismaRepositoriesPets },
  { provide: RepositoryPetAttachments, useClass: PrismaRepositoryPetAttachments },
];


@Module({
    providers:[...DatabaseUtils],
    exports:[...DatabaseUtils]
})
export class DataBaseModule{}