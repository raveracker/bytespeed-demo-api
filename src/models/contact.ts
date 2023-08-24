export interface Contact {
  id: number;
  phoneNumber: string | string[];
  email: string | string[];
  linkedId?: number | null;
  linkPrecedence?: "primary" | "secondary";
  secondaryContactIds?: number[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}
