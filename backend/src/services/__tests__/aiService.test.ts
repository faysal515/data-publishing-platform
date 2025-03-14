import { AiService } from "../aiService";
import { generateObject, GenerateObjectResult } from "ai";
import { createAzure } from "@ai-sdk/azure";
import { ZodError } from "zod";

jest.mock("../../config/env", () => ({
  config: {
    azure: {
      apiKey: "test-api-key",
      baseUrl: "https://test.azure.com",
    },
  },
}));

// Mock external dependencies
jest.mock("ai", () => ({
  generateObject: jest.fn(),
}));

jest.mock("@ai-sdk/azure", () => ({
  createAzure: jest.fn(() => jest.fn()),
}));

describe("AiService", () => {
  let aiService: AiService;
  const mockAzureClient = jest.fn();
  const mockGenerateObject = generateObject as jest.MockedFunction<
    typeof generateObject
  >;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock implementations
    (createAzure as jest.Mock).mockReturnValue(() => mockAzureClient);

    // Initialize service
    aiService = new AiService();
  });

  describe("generateDatasetMetadata", () => {
    const mockContent = `
      <filename>test_dataset.csv</filename>
      <data>[{"name": "column1", "type": "string", "samples": ["value1", "value2"]}]</data>
    `;

    const mockMetadataObject = {
      title_en: "Test Dataset",
      title_ar: "مجموعة بيانات اختبار",
      description_en: "This is a test dataset containing sample data",
      description_ar: "هذه مجموعة بيانات اختبار تحتوي على بيانات عينة",
      tags: ["test", "sample", "data"],
      category_en: "Testing",
      category_ar: "اختبار",
      subcategory_en: "Unit Tests",
      subcategory_ar: "اختبارات الوحدة",
    };

    it("should initialize with correct Azure configuration", () => {
      expect(createAzure).toHaveBeenCalledWith({
        apiKey: "test-api-key",
        baseURL: "https://test.azure.com",
      });
    });

    it("should successfully generate metadata for a dataset", async () => {
      // Setup mock response
      const mockResponse = {
        object: mockMetadataObject,
        usage: {
          promptTokens: 100,
          completionTokens: 150,
          totalTokens: 250,
        },
      } as GenerateObjectResult<typeof mockMetadataObject>;

      mockGenerateObject.mockResolvedValueOnce(mockResponse);

      // Call the service method
      const result = await aiService.generateDatasetMetadata(mockContent);

      // Verify the result
      expect(result).toEqual(mockResponse);

      // Verify generateObject was called with correct parameters
      expect(generateObject).toHaveBeenCalledWith({
        model: expect.any(Function),
        system: expect.stringContaining("You are a bilingual"),
        prompt: mockContent,
        schema: expect.any(Object),
      });
    });

    it("should handle API errors gracefully", async () => {
      // Setup mock error
      const mockError = new Error("API Error");
      mockGenerateObject.mockRejectedValueOnce(mockError);

      // Verify the error is propagated
      await expect(
        aiService.generateDatasetMetadata(mockContent)
      ).rejects.toThrow("API Error");
    });
  });
});
