import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateFileInput {
  @Field()
  filename: string;

  @Field()
  path: string;

  @Field({ nullable: true })
  mimetype?: string;

  @Field()
  size: number;

  @Field({ nullable: true })
  hash?: string;
}
