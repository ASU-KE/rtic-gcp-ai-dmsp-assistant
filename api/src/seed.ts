import { AppDataSource } from './config/data-source.config';
import { Rubric } from './entities/rubric.entity';

import NSFRubric from './rubrics/NSF';

const seed = async () => {
  try {
    await AppDataSource.initialize();
    const rubricRepo = AppDataSource.getRepository(Rubric);

    const rubrics = [
      {
        agency: 'NSF',
        rubricText: NSFRubric.trim(),
      },
    ];

    for (const rubric of rubrics) {
      const existing = await rubricRepo.findOne({
        where: { agency: rubric.agency },
      });

      if (!existing) {
        await rubricRepo.save(rubric);
        console.log(`Inserted rubric for agency: ${rubric.agency}`);
      } else if (existing.rubricText !== rubric.rubricText) {
        await rubricRepo.update({ agency: rubric.agency }, rubric);
        console.log(`Updated rubric for agency: ${rubric.agency}`);
      } else {
        console.log(`No changes for agency: ${rubric.agency}`);
      }
    }
  } catch (error) {
    console.error('Rubrics insertion failed:', error);
  } finally {
    await AppDataSource.destroy();
  }
};

seed();
