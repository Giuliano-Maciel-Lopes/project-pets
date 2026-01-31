import { Entity } from '@/core/entities/entitty'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'

interface MenagerProps {
  name: string
}

export class Menager extends Entity<MenagerProps> {
  static create(props: MenagerProps, id?: UniqueEntityId) {
    const menager = new Menager(props, id)

    return menager
  }
}
