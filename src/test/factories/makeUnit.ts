import { Units, UnitProps } from '@/domain/companyUnits/enterprise/entities/unity'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

export function makeUnit(
  override: Partial<UnitProps> = {},
  id?: UniqueEntityId,
) {
  const unit = Units.create(
    {
      name: 'Unidade Teste',
      address: 'Rua Fake, 123',
      city: 'São Paulo',
      state: 'SP',
      managerId: new UniqueEntityId(),
      ...override,
    },
    id
  )

  return unit
}
