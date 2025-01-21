import { detectBreakingNews } from '@/utils/breakingNewsDetector';
import { HfInference } from '@huggingface/inference';

jest.mock('@huggingface/inference', () => {
  const zeroShotClassificationMock = jest.fn();
  return {
    HfInference: jest.fn().mockImplementation(() => ({
      zeroShotClassification: zeroShotClassificationMock,
    })),
    __mocks__: { zeroShotClassificationMock },
  };
});

describe('detectBreakingNews', () => {
  let zeroShotClassificationMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Retrieve the mock from the Jest mock setup
    const mocks = require('@huggingface/inference').__mocks__;
    zeroShotClassificationMock = mocks.zeroShotClassificationMock;

    // Set default behavior for the mock
    zeroShotClassificationMock.mockResolvedValue([
      { label: 'breaking news', scores: [0.8] },
      { label: 'regular news', scores: [0.2] },
    ]);
  });

  test('detects breaking news based on keywords and classification score', async () => {
    const result = await detectBreakingNews(
      'BREAKING: Major Event',
      'This is breaking news content with significant impact.'
    );

    expect(result).toEqual({
      isBreaking: true,
      confidence: 0.8,
      urgencyScore: 0.8,
      timestamp: expect.any(String),
    });
    expect(zeroShotClassificationMock).toHaveBeenCalledWith({
      model: 'facebook/bart-large-mnli',
      inputs: 'BREAKING: Major Event This is breaking news content with significant impact.',
      parameters: { candidate_labels: ['breaking news', 'regular news'] },
    });
  });

  test('throws an error when classification fails', async () => {
    zeroShotClassificationMock.mockRejectedValue(new Error('API Error'));

    await expect(
      detectBreakingNews('Test Title', 'Test Content')
    ).rejects.toThrow('Failed to analyze breaking news');
  });
});
