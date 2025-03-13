import {
  IsString,
  IsArray,
  IsOptional,
  MaxLength,
  ArrayMaxSize,
} from "class-validator";

export class MetadataDto {
  @IsOptional()
  @IsString({ message: "Title (English) must be a string" })
  @MaxLength(200, { message: "Title (English) cannot exceed 200 characters" })
  title_en?: string;

  @IsOptional()
  @IsString({ message: "Title (Arabic) must be a string" })
  @MaxLength(200, { message: "Title (Arabic) cannot exceed 200 characters" })
  title_ar?: string;

  @IsOptional()
  @IsString({ message: "Description (English) must be a string" })
  @MaxLength(2000, {
    message: "Description (English) cannot exceed 2000 characters",
  })
  description_en?: string;

  @IsOptional()
  @IsString({ message: "Description (Arabic) must be a string" })
  @MaxLength(2000, {
    message: "Description (Arabic) cannot exceed 2000 characters",
  })
  description_ar?: string;

  @IsOptional()
  @IsArray({ message: "Tags must be an array" })
  @IsString({ each: true, message: "Each tag must be a string" })
  @ArrayMaxSize(20, { message: "Cannot have more than 20 tags" })
  tags?: string[];

  @IsOptional()
  @IsString({ message: "Category (English) must be a string" })
  @MaxLength(100, {
    message: "Category (English) cannot exceed 100 characters",
  })
  category_en?: string;

  @IsOptional()
  @IsString({ message: "Category (Arabic) must be a string" })
  @MaxLength(100, { message: "Category (Arabic) cannot exceed 100 characters" })
  category_ar?: string;

  @IsOptional()
  @IsString({ message: "Subcategory (English) must be a string" })
  @MaxLength(100, {
    message: "Subcategory (English) cannot exceed 100 characters",
  })
  subcategory_en?: string;

  @IsOptional()
  @IsString({ message: "Subcategory (Arabic) must be a string" })
  @MaxLength(100, {
    message: "Subcategory (Arabic) cannot exceed 100 characters",
  })
  subcategory_ar?: string;
}
