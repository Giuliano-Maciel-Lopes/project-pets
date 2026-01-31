import { Entity } from "@/core/entities/entitty";
import { UniqueEntityId } from "@/core/entities/unique-entity-id";
import { Optional } from "@/core/types/optional";
import { CPF } from "./value-objects/cpf";
import { AggregateRoot } from "@/core/entities/aggregate-root";

export interface AdoptionCandidateProps {
  name: string;
  cpf: CPF;
  phone: string;

  identityUrl: string; // foto da identidae  frente e versa

  isBanned: boolean; // caso uma pessoa faço mals trato ao animal ele nunca mais podera fazer um adotamento
  bannedReason?: string; // motivo caso tenha algum

  createdAt: Date;
  updatedAt?: Date;
}

export class AdoptionCandidate extends AggregateRoot<AdoptionCandidateProps> {
  static create(
    props: Optional<AdoptionCandidateProps, "createdAt" | "isBanned">,
    id?: UniqueEntityId
  ) {
    const adoptionCandidateContent = new AdoptionCandidate(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
        isBanned: props.isBanned ?? false,
      },
      id
    );

    return adoptionCandidateContent;
  }

  // seTERS

  private touch() {
    this.props.updatedAt = new Date();
  }
  
 update(propsReq: Pick<AdoptionCandidateProps, "name" | "phone" | "identityUrl">) {
  this.props.name = propsReq.name;
  this.props.phone = propsReq.phone;
  this.props.identityUrl = propsReq.identityUrl;

  this.touch();
}
  banned(propsReq: Pick<AdoptionCandidateProps, "bannedReason" | "isBanned">){
    this.props.bannedReason =  propsReq.bannedReason
    this.props.isBanned = propsReq.isBanned
  }

  // GETTERS

  get name() {
    return this.props.name;
  }

  get cpf() {
    return this.props.cpf;
  }

  get phone() {
    return this.props.phone;
  }

  get identityUrl() {
    return this.props.identityUrl;
  }

  get isBanned() {
    return this.props.isBanned;
  }

  get bannedReason() {
    return this.props.bannedReason;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }
}
