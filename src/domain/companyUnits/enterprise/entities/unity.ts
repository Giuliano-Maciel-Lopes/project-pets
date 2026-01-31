import { Entity } from "@/core/entities/entitty";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { Slug } from "@/core/value-objects/slug";

export interface UnitProps {
  name: string;
  address: string;
  city: string;
  state: string;
  isPrincipal: boolean; // indica unidade principal
  isActive: boolean;
  slug: Slug;
  createdAt: Date;
  updatedAt?: Date;
  managerId: UniqueEntityId; // dono da unidade
}

export class Units extends Entity<UnitProps> {
  static create(
    props: Optional<
      UnitProps,
      "createdAt" | "isPrincipal" | "slug" | "isActive"
    >,
    id?: UniqueEntityId
  ) {
    const unitsContent = new Units({
      ...props,
      slug: props.slug ?? Slug.createFromText(props.name),
      createdAt: props.createdAt ?? new Date(),
      isPrincipal: props.isPrincipal ?? false,
      isActive: props.isActive ?? true,
    }, id);
    return unitsContent;
  }
  //getter
  get isActive() {
    return this.props.isActive;
  }
  get slug() {
    return this.props.slug;
  }
  get name() {
    return this.props.name;
  }
  get address() {
    return this.props.address;
  }
  get city() {
    return this.props.city;
  }
  get state() {
    return this.props.state;
  }
  get isPrincipal() {
    return this.props.isPrincipal;
  }
  get managerId() {
    return this.props.managerId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  //setters
  private touch() {
    this.props.updatedAt = new Date();
  }
  setActive(isActiveValue: boolean) {
    this.props.isActive = isActiveValue;
    this.touch();
  }
  update(data: {
    name: string;
    address: string;
    city: string;
    state: string;
    managerId: UniqueEntityId;
  }) {
    this.props.name = data.name;
    this.props.address = data.address;
    this.props.city = data.city;
    this.props.state = data.state;
    this.props.managerId = data.managerId;
    this.props.slug = Slug.createFromText(this.name);
    this.touch();
  }
}
