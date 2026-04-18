import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service";
import { PrismaRepositoriesUser } from "./prisma/repositories.ts/prisma-rep-user";
import { RepositoriesUser } from "@/domain/account/application/repositories/repositoriesUser";

const DatabaseUtils = [
  PrismaService,
  { provide: RepositoriesUser, useClass: PrismaRepositoriesUser },
];


@Module({
    providers:[...DatabaseUtils],
    exports:[...DatabaseUtils]
})
export class DataBaseModule{}