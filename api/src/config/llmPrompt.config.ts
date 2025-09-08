import fs from 'fs';
import path from 'path';

interface SystemPrompt {
  prompt: string;
}

enum FundingAgency {
  NSF = 'NSF',
  DOE = 'DOE',
  DOD = 'DOD',
  NIH = 'NIH',
  NASA = 'NASA',
  NOAA = 'NOAA',
  USDA = 'USDA',
  USGS = 'USGS',
}

const rubricDir = path.join(__dirname, 'rubrics');

function loadRubric(fileName: string): string {
  const filePath = path.join(rubricDir, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Rubric file not found: ${fileName}`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

const rubricMap: Record<FundingAgency, string> = {
  [FundingAgency.NSF]: 'NSFRubric.txt',
  [FundingAgency.DOE]: 'DOERubric.txt',
  [FundingAgency.DOD]: 'DODRubric.txt',
  [FundingAgency.NIH]: 'NIHRubric.txt',
  [FundingAgency.NASA]: 'NASARubric.txt',
  [FundingAgency.NOAA]: 'NOAARubric.txt',
  [FundingAgency.USDA]: 'USDARubric.txt',
  [FundingAgency.USGS]: 'USGSRubric.txt',
};

export function getSystemPrompt(agency: string): SystemPrompt {
  const key = agency.toUpperCase() as FundingAgency;

  if (!Object.values(FundingAgency).includes(key)) {
    throw new Error(`Invalid funding agency: ${agency}`);
  }

  const rubricFile = rubricMap[key];
  const rubric = loadRubric(rubricFile);

  return {
    prompt: `You are a research administrator evaluating data management plans. For each section of performance criteria, determine whether the plan is complete/detailed, addressed issue but incomplete, or did not address. Skip sections that are complete/detailed. If a section of criteria is not complete/detailed, quote the relevant text from the plan, and provide a list of recommended improvements. Format each section with a section header. Use the following rubric to assess the data management plan: ${rubric}`,
  };
}
