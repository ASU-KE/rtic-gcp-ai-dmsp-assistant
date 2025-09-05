import { ProviderEntity } from "./ProviderEntity"

export interface UserEntity {
  id: string;
  // provider: ProviderEntity;
  username: string;
  email: string;
  firstName: string;
  lastName: string;

  // createdAt: Date;
  // updatedAt: Date;
}
