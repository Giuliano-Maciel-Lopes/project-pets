import { Entity } from '@/core/entities/entitty';
import { UniqueEntityId } from '@/core/entities/unique-entity-id';
import { Optional } from '@/core/types/optional';

export enum Role {
  ADOPTER = 'ADOPTER',
  ADMIN = 'ADMIN',
}

export interface UserProps {
  name: string;
  email: string;
  role: Role;
  password: string;
  createdAt: Date;
  updatedAt?: Date;
}

export type UserSafe = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt?: Date;
}

export class User extends Entity<UserProps> {
  static create(
    props: Optional<UserProps, 'createdAt' | 'role'>,
    id?: UniqueEntityId,
  ) {
    const usercontent = new User(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        role: props.role ?? Role.ADOPTER,
      },
      id,
    );

    return usercontent;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }

  toSafe(): UserSafe {
    return {
      id: this.id.toString(),
      name: this.props.name,
      email: this.props.email,
      role: this.props.role,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get role() {
    return this.props.role;
  }

  get password() {
    return this.props.password;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
