import { generateText, generateObject, LanguageModelUsage } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { z } from "zod";
import { config } from "../config/env";

interface GenerateTextResponse {
  text: string;
  usage: LanguageModelUsage;
}

interface GenerateObjectResponse<T> {
  object: T;
  usage: LanguageModelUsage;
}

const client = createAzure({
  apiKey: config.azure.apiKey,
  baseURL: config.azure.baseUrl,
});

const prompts = {
  scrape_structured: `
  
  `,
  generate_metadata: `
  You are a bilingual (English and Arabic) metadata generator for datasets. Analyze the provided dataset content and generate comprehensive metadata in both languages.

  The input will be provided in an XML-like format:
  <filename>original file name of the dataset</filename>
  <data>detailed column information including names, data types, and sample values</data>

  Guidelines:
  1. Use the file name and column data to generate natural, descriptive titles
  2. Create detailed descriptions explaining the dataset's purpose, contents, and potential uses
  3. Suggest relevant tags for easy discovery
  4. Categorize the dataset appropriately
  5. Ensure all text fields are provided in both English and Arabic
  6. Keep tags in English only for consistency
  7. Use proper Arabic grammar and vocabulary

  Example output:
  {
    "title_en": "UAE Economic Indicators 2020-2023",
    "title_ar": "مؤشرات اقتصاد الإمارات 2020-2023",
    "description_en": "Comprehensive dataset covering key economic indicators of the UAE including GDP, inflation rates, and employment statistics from 2020 to 2023.",
    "description_ar": "مجموعة بيانات شاملة تغطي المؤشرات الاقتصادية الرئيسية لدولة الإمارات بما في ذلك الناتج المحلي الإجمالي ومعدلات التضخم وإحصاءات التوظيف من 2020 إلى 2023.",
    "tags": ["economics", "uae", "gdp", "employment", "financial-indicators"],
    "category_en": "Economics",
    "category_ar": "الاقتصاد",
    "subcategory_en": "Financial Indicators",
    "subcategory_ar": "المؤشرات المالية"
  }
  `,
};

const structuredOutputSchema = z.object({
  post_url: z.string(),
  author: z.string(),
  images_urls: z.array(z.string()),
  post_markdown: z.string(),
});

const datasetMetadataSchema = z.object({
  title_en: z.string().min(1),
  title_ar: z.string().min(1),
  description_en: z.string().min(10),
  description_ar: z.string().min(10),
  tags: z.array(z.string()).min(3).max(10),
  category_en: z.string().min(1),
  category_ar: z.string().min(1),
  subcategory_en: z.string().min(1),
  subcategory_ar: z.string().min(1),
});

type StructuredOutput = z.infer<typeof structuredOutputSchema>;
type DatasetMetadata = z.infer<typeof datasetMetadataSchema>;

async function generateMarkdown(
  system: string,
  nodeText: string
): Promise<GenerateTextResponse> {
  const { text, usage } = await generateText({
    model: client("gpt-4o-mini"),
    system,
    prompt: nodeText,
  });
  return { text, usage };
}

async function getStructuredOutput(
  system: string,
  nodeText: string
): Promise<GenerateObjectResponse<StructuredOutput>> {
  const { object, usage } = await generateObject({
    model: client("gpt-4o-mini"),
    system,
    prompt: nodeText,
    schema: structuredOutputSchema,
  });
  return { object, usage };
}

async function generateDatasetMetadata(
  content: string
): Promise<GenerateObjectResponse<DatasetMetadata>> {
  const { object, usage } = await generateObject({
    model: client("gpt-4o-mini"),
    system: prompts.generate_metadata,
    prompt: content,
    schema: datasetMetadataSchema,
  });
  console.log(object);
  return { object, usage };
}

export {
  generateMarkdown,
  getStructuredOutput,
  generateDatasetMetadata,
  prompts,
  type StructuredOutput,
  type DatasetMetadata,
  type GenerateTextResponse,
  type GenerateObjectResponse,
};
