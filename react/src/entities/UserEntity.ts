import { ProviderEntity } from "./ProviderEntity"

export interface UserEntity {
  id: string;
  provider: ProviderEntity;
  email: string;

  username: string;
  firstName: string;
  lastName: string;

  createdAt: Date;
  updatedAt: Date;
}
