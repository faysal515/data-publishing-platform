import {
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsString,
  IsArray,
} from "class-validator";
import { Transform } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    // Handle both string and array inputs
    if (typeof value === "string") {
      return value
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat.length > 0);
    }
    return value;
  })
  @IsString({ each: true })
  categories?: string[];
}
