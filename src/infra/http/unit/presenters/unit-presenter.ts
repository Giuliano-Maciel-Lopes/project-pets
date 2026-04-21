import { Units } from '@/domain/companyUnits/enterprise/entities/unity';

export class UnitPresenter {
  static toHTTP(unit: Units) {
    return {
      id: unit.id.toString(),
      name: unit.name,
      address: unit.address,
      city: unit.city,
      state: unit.state,
      slug: unit.slug.value,
      isPrincipal: unit.isPrincipal,
      isActive: unit.isActive,
      managerId: unit.managerId.toString(),
      attachments: unit.attachments.map((attachment) => ({
        id: attachment.id,
        title: attachment.title,
        link: attachment.link,
      })),
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
    };
  }
}
