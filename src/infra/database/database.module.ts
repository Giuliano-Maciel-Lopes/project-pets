import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaRepositoriesUser } from "./prisma/repositories.ts/prisma-rep-user";
import { RepositoriesUser } from "@/domain/account/application/repositories/repositoriesUser";
import { PrismaRepositoriesUnit } from "./prisma/repositories.ts/prisma-rep-unit";
import { RepositoriesUnits } from "@/domain/companyUnits/application/repositories/unistsRepositories";

const DatabaseUtils = [
  PrismaService,
  { provide: RepositoriesUser, useClass: PrismaRepositoriesUser },
  { provide: RepositoriesUnits, useClass: PrismaRepositoriesUnit },
];


@Module({
    providers:[...DatabaseUtils],
    exports:[...DatabaseUtils]
})
export class DataBaseModule{}